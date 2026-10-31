// The weekly roll: 3 recipes, all different cuisines, filtered by how cold it is outside.

// A recipe declares `weather: cozy | cool | any`.
// cozy  -> braises, soups, roasts, baked pasta. Suggested when it's under 60°F.
// cool  -> salads, cold noodles, grilled fish, ceviche. Suggested when it's 60°F+.
// any   -> works year round.
export function eligible(recipes, mode) {
  return recipes.filter((r) => r.weather === "any" || r.weather === mode);
}

function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// `exclude` never comes back (it's booked into the week). `previous` is the hand
// being replaced: a re-roll deals three new cards, and only reuses one of those
// if the whole library has nothing else left to offer.
export function roll(recipes, mode, { count = 3, exclude = [], previous = [], rand = Math.random } = {}) {
  const blocked = [...exclude, ...previous];
  const pool = eligible(recipes, mode).filter((r) => !blocked.includes(r.slug));
  const byCuisine = new Map();
  for (const r of shuffle(pool, rand)) {
    const key = (r.cuisine || "Other").toLowerCase();
    if (!byCuisine.has(key)) byCuisine.set(key, []);
    byCuisine.get(key).push(r);
  }

  // One pick per cuisine first, so a slate is never three pastas.
  const picks = [];
  for (const list of shuffle([...byCuisine.values()], rand)) {
    if (picks.length >= count) break;
    picks.push(list[0]);
  }

  // Not enough distinct cuisines? Backfill from whatever's eligible,
  // then from the whole library rather than returning a short slate.
  if (picks.length < count) {
    const chosen = new Set(picks.map((r) => r.slug));
    for (const r of shuffle(pool, rand)) {
      if (picks.length >= count) break;
      if (!chosen.has(r.slug)) { picks.push(r); chosen.add(r.slug); }
    }
    for (const r of shuffle(recipes, rand)) {
      if (picks.length >= count) break;
      if (!chosen.has(r.slug) && !blocked.includes(r.slug)) { picks.push(r); chosen.add(r.slug); }
    }
    for (const r of shuffle(recipes, rand)) {
      if (picks.length >= count) break;
      if (!chosen.has(r.slug) && !exclude.includes(r.slug)) { picks.push(r); chosen.add(r.slug); }
    }
  }

  return picks.slice(0, count);
}
