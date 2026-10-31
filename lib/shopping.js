import fs from "node:fs";
import { PANTRY_FILE } from "./paths.js";
import { buildShoppingList as build } from "./grocery.js";

export { normalizeItem, listAsText } from "./grocery.js";

export function readPantry() {
  try {
    const json = JSON.parse(fs.readFileSync(PANTRY_FILE, "utf8"));
    return Array.isArray(json.staples) ? json.staples : [];
  } catch {
    return [];
  }
}

export function writePantry(staples) {
  const unique = [...new Set(staples.map((s) => s.trim()).filter(Boolean))].sort();
  fs.writeFileSync(PANTRY_FILE, JSON.stringify({ staples: unique }, null, 2));
  return unique;
}

export function buildShoppingList(recipes, pantry = readPantry()) {
  return build(recipes, pantry);
}
