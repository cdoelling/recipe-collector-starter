// The shopping-list builder, with no filesystem access, so the static share
// site can build a list in the browser. lib/shopping.js wraps it with the
// pantry file for the full app.
import { normalizeUnit } from "./format.js";

// Descriptors that shouldn't change what you actually buy.
const DESCRIPTORS = new Set([
  "small", "medium", "large", "extra", "fresh", "freshly", "ripe", "raw",
  "cooked", "chopped", "diced", "sliced", "minced", "grated", "shredded",
  "ground", "whole", "halved", "quartered", "peeled", "seeded", "trimmed",
  "boneless", "skinless", "thinly", "roughly", "finely", "good", "quality",
  "organic", "low", "sodium", "unsalted", "salted", "plus", "more", "for",
  "serving", "garnish", "optional", "to", "taste", "divided", "room",
  "temperature", "softened", "melted", "toasted", "dry", "dried", "of",
]);

export function normalizeItem(name) {
  const cleaned = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !DESCRIPTORS.has(w))
    .join(" ")
    .trim();
  // Crude singularization so "tomatoes"/"tomato" merge.
  return cleaned
    .split(" ")
    .map((w) =>
      w.endsWith("ies") ? w.slice(0, -3) + "y"
      : w.endsWith("oes") ? w.slice(0, -2)
      : w.endsWith("s") && !w.endsWith("ss") && w.length > 3 ? w.slice(0, -1)
      : w
    )
    .join(" ");
}

function formatQty(n) {
  if (n == null) return null;
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  const frac = { 0.25: "¼", 0.33: "⅓", 0.5: "½", 0.67: "⅔", 0.75: "¾" };
  const whole = Math.floor(rounded);
  const rest = Math.round((rounded - whole) * 100) / 100;
  const glyph = frac[rest];
  if (glyph) return whole ? `${whole}${glyph}` : glyph;
  return String(rounded);
}

// The store, in the order you walk it: around the fresh walls first, then up
// the middle aisles. `place` and `n` position each zone on the printed store
// map (components/StoreMapPrint.jsx). Keys match the normalized item name,
// longest match wins, so "garlic powder" beats "garlic" and "peanut butter"
// beats "butter".
export const ZONES = [
  { name: "Produce", place: "left", keys: ["onion", "garlic", "ginger", "lemon", "lime", "tomato", "pepper", "bell pepper", "poblano", "lettuce", "romaine", "spinach", "kale", "collard", "herb", "cilantro", "parsley", "basil", "mint", "dill", "sage", "thyme", "rosemary", "chive", "scallion", "green onion", "carrot", "celery", "potato", "sweet potato", "mushroom", "cucumber", "avocado", "cabbage", "broccoli", "broccolini", "cauliflower", "brussel sprout", "asparagu", "bok choy", "leek", "fennel", "zucchini", "squash", "corn", "ear corn", "apple", "orange", "mango", "berry", "shallot", "chile", "chily", "jalapeno", "radish", "bean sprout", "vegetable", "slaw"] },
  { name: "Bakery", place: "front-left", keys: ["bread", "crusty bread", "bun", "brioche", "tortilla", "baguette", "pita", "naan"] },
  { name: "Meat & Seafood", place: "back", keys: ["salmon", "chicken", "beef", "pork", "shrimp", "fish", "cod", "tuna", "mahi", "lamb", "turkey", "veal", "bacon", "sausage", "chorizo", "pepperoni", "prosciutto", "steak", "filet mignon", "chuck", "chuck roast", "pork shoulder", "scallop", "clam", "mussel", "halibut", "tilapia", "liver"] },
  { name: "Dairy & Eggs", place: "right", keys: ["milk", "cream", "heavy cream", "yogurt", "cheese", "parmesan", "parmigiano", "pecorino", "mozzarella", "burrata", "mascarpone", "feta", "ricotta", "cheddar", "cotija", "fontina", "pepper jack", "butter", "egg", "creme fraiche", "sour cream", "cream cheese", "orange juice"] },
  { name: "Frozen", place: "front-right", keys: ["frozen", "puff pastry", "pea"] },
  { name: "Pasta, Rice & Grains", place: "aisle", n: 1, keys: ["noodle", "pasta", "rice", "soba", "udon", "ramen", "spaghetti", "tonnarelli", "pappardelle", "linguine", "penne", "orzo", "rigatoni", "paccheri", "bucatini", "casarecce", "orecchiette", "lasagna", "lasagne", "oat", "quinoa", "panko", "bread crumb", "breadcrumb"] },
  { name: "Canned & Jarred", place: "aisle", n: 2, keys: ["canned", "broth", "stock", "chicken broth", "chicken stock", "vegetable broth", "beef broth", "pickled jalapeno", "bean", "lentil", "chickpea", "tomato paste", "crushed tomato", "pumpkin", "coconut milk", "olive", "caper", "pickle", "pickled", "cornichon", "pepperoncini", "enchilada sauce", "green chile"] },
  { name: "Oils, Sauces & Condiments", place: "aisle", n: 3, keys: ["oil", "olive oil", "vegetable oil", "mango salsa", "cooking spray", "oil spray", "vinegar", "sauce", "hot sauce", "tabasco", "worcestershire", "salsa", "salsa verde", "mustard", "dijon", "mayo", "mayonnaise", "ketchup", "horseradish", "peanut butter", "tahini", "bechamel"] },
  { name: "Spices & Baking", place: "aisle", n: 4, keys: ["salt", "kosher salt", "black pepper", "peppercorn", "cayenne", "paprika", "cumin", "turmeric", "oregano", "bay leave", "garam masala", "curry powder", "chili powder", "chile powder", "garlic powder", "onion powder", "red pepper flake", "seasoning", "jerk seasoning", "seasoned salt", "msg", "spice", "cinnamon", "nutmeg", "sesame seed", "flour", "baking powder", "baking soda", "sugar", "brown sugar", "honey", "syrup", "maple syrup", "coconut flake", "nut", "almond", "walnut", "peanut", "cashew"] },
  { name: "International", place: "aisle", n: 5, keys: ["soy sauce", "tamari", "miso", "mirin", "fish sauce", "oyster sauce", "shaoxing", "sesame oil", "sriracha", "gochujang", "calabrian", "chipotle", "curry paste"] },
  { name: "Snacks & Drinks", place: "aisle", n: 6, keys: ["chip", "potato chip", "cornflake", "cereal", "cracker", "fried onion", "wine", "beer", "vermentino", "sake"] },
];
const ELSEWHERE = "Everything else";

function aisleFor(name) {
  if (/\bfrozen\b/.test(name)) return "Frozen";
  if (/\b(canned|can|cans|jar|jarred)\b/.test(name)) return "Canned & Jarred";
  let best = { aisle: ELSEWHERE, length: 0 };
  for (const { name: aisle, keys } of ZONES) {
    for (const key of keys) {
      if (name.includes(key) && key.length > best.length) best = { aisle, length: key.length };
    }
  }
  return best.aisle;
}

// Words that dress up a staple without changing what's on your shelf, so
// "flaky sea salt", "fine pink Himalayan salt" and "pure maple syrup" still
// count as the pantry's salt and maple syrup. Deliberately short: "peanut
// butter" and "bell pepper" must NOT match the pantry's butter and pepper.
const STAPLE_DRESSING = new Set([
  "flaky", "fine", "coarse", "pink", "himalayan", "table", "pure", "light",
  "dark", "cold", "whipped", "stick", "crushed", "extra", "virgin", "kosher",
  "freshly", "ground", "large", "spray",
]);
const UNIT_WORDS = /^(\d.*|[\u00bc-\u00be\u2150-\u215e].*|tsp|tbsp|teaspoon|tablespoon|cup|oz|ounce|lb|pound|pinch|dash|a|clove)$/;

// Which pantry staple (if any) an ingredient is. Checks the name as written,
// then with amounts and dressing words stripped, and splits "salt and pepper"
// style pairs so both halves must be staples.
function stapleFor(key, pantryMap) {
  const plain = key.replace(/-/g, " ").replace(/\bsuch a\b.*$/, "").trim();
  const tokens = plain.split(/\s+/).filter((w) => !UNIT_WORDS.test(w));
  const parts = tokens.join(" ").split(/\s+(?:and or|and|or)\s+/);
  const found = [];
  for (const part of parts) {
    const words = part.split(" ").filter(Boolean);
    const exact = pantryMap.get(words.join(" "));
    const stripped = pantryMap.get(words.filter((w) => !STAPLE_DRESSING.has(w)).join(" "));
    const staple = exact ?? stripped;
    if (!staple) return null;
    found.push(staple);
  }
  return found.length ? found : null;
}

export function buildShoppingList(recipes, pantry = []) {
  // normalized staple -> the staple as written in the pantry list
  const pantryMap = new Map(pantry.map((p) => [normalizeItem(p).replace(/-/g, " "), p]));
  const merged = new Map();
  const omitted = [];

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const key = normalizeItem(ing.item);
      if (!key) continue;
      const staples = stapleFor(key, pantryMap);
      if (staples) {
        for (const staple of staples) omitted.push({ item: ing.item, staple, from: recipe.title });
        continue;
      }
      if (!merged.has(key)) {
        merged.set(key, { key, name: ing.item, amounts: new Map(), from: [] });
      }
      const entry = merged.get(key);
      if (!entry.from.includes(recipe.title)) entry.from.push(recipe.title);
      // Sum quantities that share a unit; keep mismatched units side by side.
      const unit = normalizeUnit(ing.unit) ?? "";
      if (ing.qty != null) {
        entry.amounts.set(unit, (entry.amounts.get(unit) ?? 0) + ing.qty);
      } else if (!entry.amounts.has(unit)) {
        entry.amounts.set(unit, null);
      }
    }
  }

  const items = [...merged.values()].map((e) => {
    const amount = [...e.amounts.entries()]
      .map(([unit, qty]) => [formatQty(qty), unit].filter(Boolean).join(" ").trim())
      .filter(Boolean)
      .join(" + ");
    return {
      key: e.key,
      name: e.name,
      amount: amount || null,
      from: e.from,
      aisle: aisleFor(e.key),
      line: [amount, e.name].filter(Boolean).join(" "),
    };
  });

  const order = [...ZONES.map((z) => z.name), ELSEWHERE];
  const sections = order
    .map((aisle) => ({ aisle, items: items.filter((i) => i.aisle === aisle) }))
    .filter((s) => s.items.length);

  // The pantry staples this week leans on, once each, for the "double check
  // what we already have" box on the printed list.
  const staples = [...new Set(omitted.map((o) => o.staple))];

  return { sections, items, omitted, staples, count: items.length };
}

export function listAsText(list) {
  return list.sections
    .map((s) => `${s.aisle.toUpperCase()}\n` + s.items.map((i) => `  ${i.line}`).join("\n"))
    .join("\n\n");
}
