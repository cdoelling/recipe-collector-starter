// Pure formatting helpers with no filesystem access, so client components
// (the printable recipe booklet) can import them directly without pulling
// Node's `fs` into the browser bundle the way lib/recipes.js would.

// Groups a recipe's parsed ingredients back into their "For the sauce"
// sections, in source order.
export function groupIngredients(ingredients) {
  const groups = [];
  for (const ing of ingredients) {
    const key = ing.group ?? null;
    const last = groups[groups.length - 1];
    if (!last || last.group !== key) groups.push({ group: key, items: [ing] });
    else last.items.push(ing);
  }
  return groups;
}

export function formatQty(n) {
  const frac = { 0.25: "¼", 0.33: "⅓", 0.5: "½", 0.67: "⅔", 0.75: "¾", 0.13: "⅛" };
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  const whole = Math.floor(rounded);
  const glyph = frac[Math.round((rounded - whole) * 100) / 100];
  if (glyph) return whole ? `${whole}${glyph}` : glyph;
  return String(rounded);
}

const UNIT_CANON = {
  tablespoon: "tbsp", tablespoons: "tbsp", tbs: "tbsp",
  teaspoon: "tsp", teaspoons: "tsp",
  ounce: "oz", ounces: "oz",
  pound: "lb", pounds: "lb", lbs: "lb",
  gram: "g", grams: "g",
  cups: "cup", quarts: "quart", pints: "pint",
  milliliters: "ml", liters: "l", liter: "l",
  cloves: "clove", bunches: "bunch", sprigs: "sprig",
  cans: "can", jars: "jar", packages: "package", pkg: "package",
  slices: "slice", heads: "head", stalks: "stalk",
  bundles: "bundle", pieces: "piece", handfuls: "handful",
  pinches: "pinch", dashes: "dash", sticks: "stick",
};

export function normalizeUnit(u) {
  if (!u) return null;
  return UNIT_CANON[u] ?? u;
}
