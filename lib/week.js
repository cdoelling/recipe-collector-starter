import fs from "node:fs";
import { WEEK_FILE } from "./paths.js";

export const SLOT_COUNT = 7;

const EMPTY = { rolled: [], slots: [], rolledAt: null, weather: null };

export function readWeek() {
  let raw = {};
  try {
    raw = JSON.parse(fs.readFileSync(WEEK_FILE, "utf8"));
  } catch {
    raw = {};
  }
  // Earlier versions called this `selected` and cleared it on every roll.
  const slots = Array.isArray(raw.slots) ? raw.slots : Array.isArray(raw.selected) ? raw.selected : [];
  return {
    ...EMPTY,
    ...raw,
    slots: slots.filter(Boolean).slice(0, SLOT_COUNT),
    rolled: Array.isArray(raw.rolled) ? raw.rolled : [],
  };
}

export function writeWeek(next) {
  const value = { ...readWeek(), ...next };
  delete value.selected;
  value.slots = value.slots.filter(Boolean).slice(0, SLOT_COUNT);
  fs.writeFileSync(WEEK_FILE, JSON.stringify(value, null, 2));
  return value;
}
