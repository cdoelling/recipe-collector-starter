import { seasonFor } from "./season.js";
import { HOME } from "./home.js";

// Home is set in lib/home.js. Open-Meteo needs no API key. No fs here, so the
// share site runs this same code in the browser for any zip.
export const LOCATION = HOME;

// Below this (°F) the app suggests cozy food; at or above it, cool food.
export const COZY_THRESHOLD = 60;

let cache = { at: 0, key: null, value: null };
const TTL_MS = 30 * 60 * 1000;

// US zip → a location shaped like LOCATION, via Open-Meteo's geocoder (which
// matches postcodes). Null when nothing matches.
export async function geocodeZip(zip) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(zip)}&count=1&countryCode=US`,
  );
  if (!res.ok) throw new Error(`geocoding ${res.status}`);
  const place = (await res.json()).results?.[0];
  if (!place) return null;
  return {
    zip,
    label: [place.name, place.admin1].filter(Boolean).join(", "),
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone ?? "auto",
  };
}

// Rough location from the visitor's IP (city level), for the share site's first
// guess before anyone types a zip. geojs.io needs no key and allows browser
// calls. Null when it can't place them.
export async function locateByIp() {
  const res = await fetch("https://get.geojs.io/v1/ip/geo.json", { signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error(`ip lookup ${res.status}`);
  const geo = await res.json();
  const latitude = Number(geo.latitude);
  const longitude = Number(geo.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    zip: null,
    label: [geo.city, geo.region].filter(Boolean).join(", ") || "your area",
    latitude,
    longitude,
    timezone: geo.timezone || "auto",
  };
}

export async function getWeather(location = LOCATION) {
  const key = `${location.latitude},${location.longitude}`;
  if (cache.value && cache.key === key && Date.now() - cache.at < TTL_MS) return cache.value;

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}` +
    `&longitude=${location.longitude}&current=temperature_2m,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=7` +
    `&temperature_unit=fahrenheit&timezone=${encodeURIComponent(location.timezone)}`;

  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`open-meteo ${res.status}`);
    const json = await res.json();

    const maxes = (json.daily?.temperature_2m_max ?? []).filter(Number.isFinite);
    const mins = (json.daily?.temperature_2m_min ?? []).filter(Number.isFinite);
    if (!maxes.length || !mins.length) throw new Error("no daily forecast");

    const high = Math.round(Math.max(...maxes));
    const low = Math.round(Math.min(...mins));
    // You're planning a whole week of dinners, so the week's average decides the
    // mood — not whatever the thermometer happens to say this minute.
    const days = Math.min(maxes.length, mins.length);
    let sum = 0;
    for (let i = 0; i < days; i++) sum += (maxes[i] + mins[i]) / 2;
    const mean = Math.round(sum / days);

    const value = {
      temp: Math.round(json.current?.temperature_2m),
      high,
      low,
      mean,
      days,
      code: json.current?.weather_code ?? null,
      mode: mean < COZY_THRESHOLD ? "cozy" : "cool",
      label: location.label,
      forecast: buildForecast(json.daily, json.timezone ?? location.timezone),
      ok: true,
    };
    cache = { at: Date.now(), key, value };
    return value;
  } catch (err) {
    // Never block the weekly roll on a weather outage — fall back to the season.
    return {
      temp: null,
      high: null,
      low: null,
      mean: null,
      days: 0,
      code: null,
      mode: seasonFor().mode,
      label: location.label,
      forecast: [],
      ok: false,
      error: String(err.message ?? err),
    };
  }
}

export function weatherEmoji(mode) {
  return mode === "cozy" ? "🧣" : "🌤️";
}

// WMO weather codes (https://open-meteo.com/en/docs) collapsed into the handful
// of conditions the forecast strip actually draws.
export function conditionFromCode(code) {
  if (code == null) return "clear";
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "partly-cloudy";
  if (code === 3 || code === 45 || code === 48) return "cloudy";
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  return "cloudy";
}

export const PRECIP_CONDITIONS = new Set(["rain", "snow", "storm"]);

function buildForecast(daily, timeZone) {
  const dates = daily?.time ?? [];
  const maxes = daily?.temperature_2m_max ?? [];
  const mins = daily?.temperature_2m_min ?? [];
  const codes = daily?.weather_code ?? [];
  const days = Math.min(5, dates.length);

  const dayName = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone });

  return Array.from({ length: days }, (_, i) => {
    const condition = conditionFromCode(codes[i] ?? null);
    return {
      date: dates[i],
      label: i === 0 ? "Today" : dayName.format(new Date(`${dates[i]}T12:00:00`)),
      high: Number.isFinite(maxes[i]) ? Math.round(maxes[i]) : null,
      low: Number.isFinite(mins[i]) ? Math.round(mins[i]) : null,
      condition,
      precip: PRECIP_CONDITIONS.has(condition),
    };
  });
}
