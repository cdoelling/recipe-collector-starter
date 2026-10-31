"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import RollingPinIcon from "@/components/RollingPinIcon";
import WeatherPanel from "@/components/WeatherPanel";
import { roll, eligible } from "@/lib/select";
import { getWeather, geocodeZip, locateByIp } from "@/lib/weather";
import { seasonFor } from "@/lib/season";
import { useLocalWeek, writeLocalWeek } from "@/lib/local-week";

const SLOT_COUNT = 7;

// Where the weather starts when the IP lookup can't place a visitor.
const DENVER = {
  zip: "80202",
  label: "Denver, Colorado",
  latitude: 39.7392,
  longitude: -104.9903,
  timezone: "America/Denver",
};

// The share site's home page: the same roll → seven slots flow as app/page.js
// and /api/week, but the week lives in the visitor's browser and the weather
// follows whatever zip they enter.
export default function ShareHome({ recipes, season: builtSeason }) {
  const week = useLocalWeek();
  const [season, setSeason] = useState(builtSeason);
  const [weather, setWeather] = useState(null);
  const [mounted, setMounted] = useState(false);
  // undefined while the IP lookup runs; null if it couldn't place them.
  const [guess, setGuess] = useState(undefined);

  const known = new Set(recipes.map((r) => r.slug));
  const slots = week.slots.filter((s) => known.has(s));
  const rolled = week.rolled.filter((s) => known.has(s));
  // A zip they picked wins, then their IP's city, then Denver.
  const place = week.place ?? (guess === undefined ? null : guess ?? DENVER);
  const mode = weather?.mode ?? season.mode;
  const full = slots.length >= SLOT_COUNT;

  // The page was built once; the month is whenever it's opened.
  useEffect(() => {
    setSeason(seasonFor());
    setMounted(true);
  }, []);

  // The guess isn't saved: only a zip they choose sticks.
  useEffect(() => {
    if (!mounted || week.place) return;
    let live = true;
    locateByIp()
      .catch(() => null)
      .then((found) => live && setGuess(found));
    return () => { live = false; };
  }, [mounted, Boolean(week.place)]);

  useEffect(() => {
    if (!place) return;
    let live = true;
    getWeather(place).then((w) => live && setWeather(w));
    return () => { live = false; };
  }, [place?.latitude, place?.longitude]);

  const rollAgain = () => {
    const picks = roll(recipes, mode, { exclude: slots, previous: rolled });
    writeLocalWeek({ rolled: picks.map((r) => r.slug) });
  };

  // First visit (or a library change emptied the roll): deal a hand.
  useEffect(() => {
    if (mounted && rolled.length === 0) rollAgain();
  }, [mounted, rolled.length]);

  // Booking a card swaps a fresh one into its place, like the app does.
  const add = (slug) => {
    if (slots.includes(slug) || full) return;
    const nextSlots = [...slots, slug];
    const taken = [...rolled, ...nextSlots];
    const pool = eligible(recipes, mode).filter((r) => !taken.includes(r.slug));
    const source = pool.length ? pool : recipes.filter((r) => !taken.includes(r.slug));
    const replacement = source.length ? source[Math.floor(Math.random() * source.length)] : null;
    writeLocalWeek({
      slots: nextSlots,
      rolled: replacement
        ? rolled.map((s) => (s === slug ? replacement.slug : s))
        : rolled.filter((s) => s !== slug),
    });
  };

  const remove = (slug) => writeLocalWeek({ slots: slots.filter((s) => s !== slug) });

  const items = rolled.map((slug) => recipes.find((r) => r.slug === slug)).filter(Boolean);

  return (
    <>
      <div style={{ paddingTop: 30 }}>
        <p className="eyebrow">{season.month} · {season.name}</p>
        <h1 className="page">Hey Babe, what sounds good?</h1>
      </div>

      {weather && place ? (
        <WeatherPanel weather={weather}>
          <ZipPicker place={place} />
        </WeatherPanel>
      ) : (
        <div className="weather">
          <p>{place ? `Checking the weather for ${place.label}…` : "Finding your weather…"}</p>
        </div>
      )}

      <div className="section-head">
        <h2>This week&apos;s roll</h2>
        <button className="btn roll-btn" data-variant="ghost" onClick={rollAgain}>
          <RollingPinIcon /> Roll again
        </button>
      </div>

      {full ? (
        <div className="notice" data-tone="warn" style={{ marginBottom: 18 }}>
          All seven slots are full. Drop one from the tray below to make room.
        </div>
      ) : null}

      <div className="grid">
        {items.map((recipe) => {
          const isBooked = slots.includes(recipe.slug);
          return (
            <div key={recipe.slug} className="pick" data-booked={isBooked}>
              <Card recipe={recipe} />
              <div className="pick-actions">
                <button className="btn" data-size="sm"
                        data-variant={isBooked ? "cool" : undefined}
                        disabled={!isBooked && full}
                        onClick={() => (isBooked ? remove(recipe.slug) : add(recipe.slug))}>
                  {isBooked ? "In the week" : full ? "Week full" : "+ Add to week"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// "Not here?" → a zip box. The place is saved with the visitor's week.
function ZipPicker({ place }) {
  const [open, setOpen] = useState(false);
  const [zip, setZip] = useState("");
  const [state, setState] = useState(null); // null | "looking" | "missing" | "error"

  const submit = async (e) => {
    e.preventDefault();
    const value = zip.trim();
    if (!/^\d{5}$/.test(value)) return setState("missing");
    setState("looking");
    try {
      const found = await geocodeZip(value);
      if (!found) return setState("missing");
      writeLocalWeek({ place: found });
      setOpen(false);
      setZip("");
      setState(null);
    } catch {
      setState("error");
    }
  };

  if (!open) {
    return (
      <p style={{ marginTop: 8 }}>
        <button className="btn" data-size="sm" data-variant="ghost" onClick={() => setOpen(true)}>
          📍 Not near {place.label}? Change zip
        </button>
      </p>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
      <input
        className="field"
        inputMode="numeric"
        autoComplete="postal-code"
        maxLength={5}
        placeholder="Zip code"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        style={{ flex: "0 0 140px", minWidth: 0, minHeight: 44 }}
        autoFocus
      />
      <button className="btn" data-size="sm" type="submit" disabled={state === "looking"}>
        {state === "looking" ? "Looking…" : "Use this zip"}
      </button>
      <button className="btn" data-size="sm" data-variant="ghost" type="button" onClick={() => setOpen(false)}>
        Cancel
      </button>
      {state === "missing" ? <span>Couldn&apos;t find that US zip.</span> : null}
      {state === "error" ? <span>Couldn&apos;t reach the lookup. Try again in a moment.</span> : null}
    </form>
  );
}
