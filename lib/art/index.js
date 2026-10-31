import { hash, mulberry32, escapeXml, paletteFor, motifFor } from "./core.js";
import { riso } from "./styles.js";

export { paletteFor, motifFor };

export function cardSvg(recipe, { aspect = 4 / 3 } = {}) {
  const seed = hash(recipe.slug || recipe.title || "recipe");
  const H = 300;
  const W = Math.round(H * aspect);

  const ctx = {
    W,
    H,
    // Seeded per recipe, so any one card stays stable across reloads.
    rand: mulberry32(hash(`riso:${recipe.slug ?? recipe.title ?? "r"}`)),
    p: paletteFor(recipe.cuisine),
    motifName: motifFor(recipe),
    id: `c${seed.toString(36)}`,
  };

  const { defs, body } = riso(recipe, ctx);
  const clip = `${ctx.id}clip`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${escapeXml(recipe.title ?? "")}">
  <defs><clipPath id="${clip}"><rect width="${W}" height="${H}"/></clipPath>${defs}</defs>
  <g clip-path="url(#${clip})">${body}</g>
</svg>`;
}
