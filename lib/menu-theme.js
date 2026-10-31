import { seasonFor } from "./season.js";

// The printed "menu of the week" changes its look every week on its own: the
// ISO week number picks the palette, cover headline and cover layout, so the
// same week always prints the same, and next week never matches this one.

export const PALETTES = [
  { name: "Tomato", paper: "#fbf6ee", ink: "#2a1d17", accent: "#c8402f", soft: "#f3dccd" },
  { name: "Olive", paper: "#f6f4ea", ink: "#24271c", accent: "#5d6b2f", soft: "#e2e5c9" },
  { name: "Indigo", paper: "#f5f3ef", ink: "#1b2233", accent: "#2f4f9e", soft: "#dbe0f0" },
  { name: "Saffron", paper: "#fdf7e8", ink: "#2b2111", accent: "#b9770f", soft: "#f5e2b3" },
  { name: "Plum", paper: "#f9f3f3", ink: "#2a1a24", accent: "#7d2f5c", soft: "#efd6e2" },
  { name: "Sea glass", paper: "#f2f6f3", ink: "#16302b", accent: "#2f7a6b", soft: "#d2e7de" },
  { name: "Paprika", paper: "#fbf3ec", ink: "#2e1a12", accent: "#a8461c", soft: "#f1d6c3" },
];

export const HEADLINES = [
  "Pull up a chair.",
  "Seven dinners. Zero \u201cwhat do you want?\u201d",
  "This week, we eat like we mean it.",
  "The kitchen is open.",
  "Tonight\u2019s specials. And tomorrow\u2019s.",
  "Hey Babe, it\u2019s all figured out.",
  "No substitutions. (Fine, some substitutions.)",
  "Salt the water. We\u2019ve got a week to cook.",
  "Reservations not required.",
  "Dinner is handled. You\u2019re welcome.",
  "A week of good decisions.",
  "Aprons on. Phones down.",
  "Somebody preheat the oven.",
  "Leftovers are a love language.",
  "Butter first. Questions later.",
  "Hungry? Good. That\u2019s the plan.",
  "Fresh week. Clean pans. Big appetite.",
  "The table\u2019s set. Mostly.",
  "Cook once, brag all week.",
  "Takeout menus, stand down.",
  "Grab a fork. It\u2019s that kind of week.",
  "Mise en place, babe.",
  "Something good is simmering.",
  "We\u2019re eating well this week.",
  "Bring your appetite. Leave the guesswork.",
  "Seven nights of \u201cooh, what\u2019s this?\u201d",
];

export const LAYOUTS = ["classic", "bistro", "chalkboard"];

export const ORNAMENTS = ["✦", "❦", "◆", "✿", "✱"];

export function isoWeek(date = new Date()) {
  const t = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const year = t.getUTCFullYear();
  const week = Math.ceil(((t - Date.UTC(year, 0, 1)) / 86400000 + 1) / 7);
  return { year, week };
}

// Monday–Sunday of the week containing `date`, e.g. "Oct 12 – 18".
function weekRange(date) {
  const start = new Date(date);
  start.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d, opts) => d.toLocaleDateString("en-US", opts);
  const sameMonth = start.getMonth() === end.getMonth();
  return `${fmt(start, { month: "short", day: "numeric" })} – ${fmt(end, sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" })}`;
}

export function menuTheme(date = new Date()) {
  const { year, week } = isoWeek(date);
  const n = year * 53 + week; // keeps counting across New Year
  return {
    seed: year * 100 + week,
    week,
    year,
    range: weekRange(date),
    season: seasonFor(date),
    palette: PALETTES[n % PALETTES.length],
    headline: HEADLINES[n % HEADLINES.length],
    layout: LAYOUTS[n % LAYOUTS.length],
    ornament: ORNAMENTS[n % ORNAMENTS.length],
  };
}
