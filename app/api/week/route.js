import { NextResponse } from "next/server";
import { allRecipes } from "@/lib/recipes";
import { readWeek, writeWeek, SLOT_COUNT } from "@/lib/week";
import { getWeather } from "@/lib/weather";
import { roll, eligible } from "@/lib/select";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ week: readWeek(), weather: await getWeather() });
}

export async function POST(request) {
  const { action, slug } = await request.json();
  const recipes = allRecipes();
  const week = readWeek();

  if (action === "roll") {
    const weather = await getWeather();
    // Don't offer what's already booked, or anything from the hand being replaced.
    const picks = roll(recipes, weather.mode, { exclude: week.slots, previous: week.rolled });
    return NextResponse.json({
      week: writeWeek({
        rolled: picks.map((r) => r.slug),
        rolledAt: new Date().toISOString(),
        weather: { temp: weather.temp, mode: weather.mode },
      }),
    });
  }

  if (action === "swap") {
    const weather = await getWeather();
    const taken = [...week.rolled, ...week.slots];
    const pool = eligible(recipes, weather.mode).filter((r) => !taken.includes(r.slug));
    const fallback = recipes.filter((r) => !taken.includes(r.slug));
    const source = pool.length ? pool : fallback;
    if (!source.length) return NextResponse.json({ week, note: "nothing left to swap in" });
    const replacement = source[Math.floor(Math.random() * source.length)];
    return NextResponse.json({
      week: writeWeek({ rolled: week.rolled.map((s) => (s === slug ? replacement.slug : s)) }),
    });
  }

  if (action === "add") {
    if (week.slots.includes(slug)) return NextResponse.json({ week });
    if (week.slots.length >= SLOT_COUNT) {
      return NextResponse.json({ week, full: true, note: "all seven slots are taken" });
    }
    const slots = [...week.slots, slug];
    // A booked recipe shouldn't keep sitting in the roll — replace it in place.
    const weather = await getWeather();
    const taken = [...week.rolled, ...slots];
    const pool = eligible(recipes, weather.mode).filter((r) => !taken.includes(r.slug));
    const source = pool.length ? pool : recipes.filter((r) => !taken.includes(r.slug));
    const replacement = source.length ? source[Math.floor(Math.random() * source.length)] : null;
    const rolled = replacement
      ? week.rolled.map((s) => (s === slug ? replacement.slug : s))
      : week.rolled.filter((s) => s !== slug);
    return NextResponse.json({ week: writeWeek({ slots, rolled }) });
  }

  if (action === "remove") {
    return NextResponse.json({ week: writeWeek({ slots: week.slots.filter((s) => s !== slug) }) });
  }

  if (action === "clear") {
    return NextResponse.json({ week: writeWeek({ slots: [] }) });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
