import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { RECIPES_DIR } from "./paths.js";
import { normalizeUnit } from "./format.js";

// A recipe is a markdown file: YAML frontmatter + "## Ingredients" + "## Instructions".
// Keeping them as plain files means you can edit any recipe in any text editor.

function sectionLines(body, heading) {
  const lines = body.split("\n");
  const start = lines.findIndex(
    (l) => l.trim().toLowerCase() === `## ${heading}`.toLowerCase()
  );
  if (start === -1) return [];
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) break;
    out.push(lines[i]);
  }
  return out;
}

// Ingredient lines are "- 9 oz soba noodles (3 bundles)".
// A line that is bold and has no leading "-" is a group label ("**For the sauce**").
function parseIngredientSection(lines) {
  const items = [];
  let group = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (!line.startsWith("- ")) {
      group = line.replace(/[*_#:]/g, "").trim() || null;
      continue;
    }
    const parsed = parseIngredient(line.slice(2).trim());
    if (parsed) items.push({ ...parsed, group });
  }
  return items;
}

const UNITS = [
  "tablespoons", "tablespoon", "tbsp", "tbs",
  "teaspoons", "teaspoon", "tsp",
  "ounces", "ounce", "oz",
  "pounds", "pound", "lbs", "lb",
  "grams", "gram", "g", "kg",
  "cups", "cup", "quarts", "quart", "pints", "pint",
  "milliliters", "ml", "liters", "liter", "l",
  "cloves", "clove", "bunches", "bunch", "sprigs", "sprig",
  "cans", "can", "jars", "jar", "packages", "package", "pkg",
  "slices", "slice", "heads", "head", "stalks", "stalk",
  "bundles", "bundle", "pieces", "piece", "handfuls", "handful",
  "pinches", "pinch", "dashes", "dash", "sticks", "stick",
];

const VULGAR = {
  "½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75,
  "⅕": 0.2, "⅖": 0.4, "⅗": 0.6, "⅘": 0.8,
  "⅙": 1 / 6, "⅚": 5 / 6, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
};

function numberFrom(token) {
  if (VULGAR[token] != null) return VULGAR[token];
  if (/^\d+\/\d+$/.test(token)) {
    const [a, b] = token.split("/").map(Number);
    return b ? a / b : null;
  }
  if (/^\d+(\.\d+)?$/.test(token)) return Number(token);
  return null;
}

export function parseIngredient(text) {
  if (!text) return null;
  let rest = text;
  let note = null;

  // Trailing parenthetical is a note, not part of the item name.
  const paren = rest.match(/\s*\(([^)]*)\)\s*$/);
  if (paren) {
    note = paren[1].trim();
    rest = rest.slice(0, paren.index).trim();
  }
  // "diced into cubes" style tails after a comma are also notes.
  const comma = rest.match(/,\s*(.+)$/);
  if (comma) {
    note = note ? `${comma[1].trim()}, ${note}` : comma[1].trim();
    rest = rest.slice(0, comma.index).trim();
  }

  const tokens = rest.split(/\s+/);
  let qty = null;
  let i = 0;

  // Quantity can be "1", "1.5", "1/2", "½", "1 ½", or a range "1-2".
  const rangeMatch = tokens[0]?.match(/^(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)$/);
  if (rangeMatch) {
    qty = Number(rangeMatch[2]); // shop for the larger end of a range
    i = 1;
  } else {
    const first = numberFrom(tokens[0] ?? "");
    if (first != null) {
      qty = first;
      i = 1;
      const second = numberFrom(tokens[1] ?? "");
      if (second != null && second < 1 && Number.isInteger(first)) {
        qty = first + second; // "1 ½"
        i = 2;
      }
    }
  }

  let unit = null;
  const maybeUnit = (tokens[i] ?? "").toLowerCase().replace(/\.$/, "");
  if (UNITS.includes(maybeUnit)) {
    unit = normalizeUnit(maybeUnit);
    i += 1;
  }

  const item = tokens.slice(i).join(" ").trim();
  if (!item) return null;
  return { qty, unit, item, raw: text, note };
}

function sectionText(body, heading) {
  return sectionLines(body, heading).join("\n").trim() || null;
}

function parseInstructions(lines) {
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^(\d+\.|-|\*)\s*/, ""))
    .filter(Boolean);
}

export function readRecipe(slug) {
  const file = path.join(RECIPES_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  let data, content;
  try {
    ({ data, content } = matter(fs.readFileSync(file, "utf8")));
  } catch (err) {
    // One malformed recipe (e.g. a transcription that dropped the closing
    // `---`) shouldn't take down the whole list — skip it, not crash it.
    console.error(`Skipping unreadable recipe "${slug}": ${err.message ?? err}`);
    return null;
  }
  return {
    slug,
    title: data.title ?? slug,
    cuisine: data.cuisine ?? "Other",
    category: data.category ?? null,
    totalTime: Number(data.totalTime) || null,
    serves: data.serves ?? null,
    weather: data.weather ?? "any",
    source: data.source ?? null,
    author: data.author ?? null,
    motif: data.motif ?? null,
    image: data.image ?? null,
    blurb: data.blurb ?? null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    ingredients: parseIngredientSection(sectionLines(content, "Ingredients")),
    instructions: parseInstructions(sectionLines(content, "Instructions")),
    // The house voice (docs/VOICE.md): an intro note and a one-line closer.
    note: sectionText(content, "Before we start"),
    closer: sectionText(content, "Kitchen's closed"),
  };
}

export function allRecipes() {
  if (!fs.existsSync(RECIPES_DIR)) return [];
  return fs
    .readdirSync(RECIPES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => readRecipe(f.replace(/\.md$/, "")))
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// Re-exported from lib/format.js (which has no fs import) so both this
// server-side module and client components can share the same helpers.
export { groupIngredients, formatQty, normalizeUnit } from "./format.js";
