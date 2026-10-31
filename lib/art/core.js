// Shared machinery for every card style: deterministic randomness, colour maths,
// and a "pen" that lets one motif be drawn as fat cartoon ink, as an unfilled
// neon tube, or as a soft gradient shape depending on the style asking for it.

export const INK = "#17121D";

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function escapeXml(s) {
  return String(s).replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c])
  );
}

// --- colour ----------------------------------------------------------------

function hexToRgb(hex) {
  const m = String(hex).replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }) {
  const to = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h, s, l };
}

function hslToRgb({ h, s, l }) {
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255 };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return { r: f(h + 1 / 3) * 255, g: f(h) * 255, b: f(h - 1 / 3) * 255 };
}

export function adjust(hex, { saturate = 1, lighten = 0 } = {}) {
  if (!hex || hex === "none" || hex.startsWith("rgba")) return hex;
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.s = Math.max(0, Math.min(1, hsl.s * saturate));
  hsl.l = Math.max(0, Math.min(1, hsl.l + lighten));
  return rgbToHex(hslToRgb(hsl));
}

// --- the pen ---------------------------------------------------------------

// `ink: "none"` drops outlines entirely. `fill: "none"` drops fills, which turns
// every motif into a line drawing — that is how the neon style works.
// `tint` remaps whatever fill a motif asks for, for styles with a fixed palette.
export function makePen({ ink = INK, width = 6, fill = null, tint = null, extra = "" } = {}) {
  const paint = (c) => (fill !== null ? fill : tint ? tint(c) : c);
  const outline = (w) =>
    ink === "none"
      ? ""
      : `stroke="${ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

  return {
    ink,
    width,
    paint,
    path: (d, c, w) => `<path d="${d}" fill="${paint(c)}" ${outline(w ?? width)}${extra}/>`,
    circle: (cx, cy, r, c, w) =>
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${paint(c)}" ${outline(w ?? width)}${extra}/>`,
    ellipse: (cx, cy, rx, ry, c, w) =>
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${paint(c)}" ${outline(w ?? width)}${extra}/>`,
    // A bare stroke — a noodle, a gill line, steam. Styles that drop detail pass detail:false.
    stroke: (d, color, w) =>
      `<path d="${d}" fill="none" stroke="${
        ink === "none" ? color : color
      }" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`,
  };
}

// --- palettes --------------------------------------------------------------

const PALETTES = {
  asian:         { bg: "#FF5D73", ray: "#FF8095", pop: "#FFD166", cool: "#2EC4B6", cream: "#FFF3E2" },
  japanese:      { bg: "#EF476F", ray: "#F86D8D", pop: "#FFD166", cool: "#26A0A0", cream: "#FFF3E2" },
  thai:          { bg: "#06A77D", ray: "#27BE95", pop: "#FFD166", cool: "#FF6B6B", cream: "#FFF8E7" },
  chinese:       { bg: "#D62828", ray: "#E84B4B", pop: "#FFC94A", cool: "#2A9D8F", cream: "#FFF1DA" },
  italian:       { bg: "#E63946", ray: "#F05563", pop: "#F4D35E", cool: "#3A9D7E", cream: "#FFF6E5" },
  mexican:       { bg: "#F4711F", ray: "#FF8C3E", pop: "#FCBF49", cool: "#06A77D", cream: "#FFF1D6" },
  mediterranean: { bg: "#2A9D8F", ray: "#3FB6A7", pop: "#F4D35E", cool: "#E76F51", cream: "#FFF6E5" },
  french:        { bg: "#6A4C93", ray: "#8264AC", pop: "#FFCA3A", cool: "#8AC926", cream: "#FFF4E6" },
  indian:        { bg: "#E07A1F", ray: "#F3903A", pop: "#FFD166", cool: "#118AB2", cream: "#FFF2DD" },
  seafood:       { bg: "#118AB2", ray: "#28A2C9", pop: "#FFD166", cool: "#06D6A0", cream: "#F2FBFF" },
  american:      { bg: "#C1121F", ray: "#D93A44", pop: "#FDC500", cool: "#457B9D", cream: "#FFF4E3" },
  korean:        { bg: "#B5179E", ray: "#C93BB4", pop: "#FFD166", cool: "#4CC9F0", cream: "#FFF0FA" },
  vietnamese:    { bg: "#1B998B", ray: "#33B0A2", pop: "#FFD166", cool: "#FF6B6B", cream: "#F4FFF9" },
  other:         { bg: "#7B5EA7", ray: "#9375BE", pop: "#FFD166", cool: "#4CC9F0", cream: "#FFF4E6" },
};

export function paletteFor(cuisine = "other") {
  return PALETTES[String(cuisine).toLowerCase().trim()] ?? PALETTES.other;
}

export function cuisineIndex(cuisine = "other") {
  return hash(String(cuisine).toLowerCase().trim());
}

// --- motif choice ----------------------------------------------------------

const MOTIF_KEYWORDS = [
  ["bowl",  ["noodle", "soba", "udon", "ramen", "pho", "rice bowl", "stir fry", "stir-fry", "curry"]],
  ["fish",  ["salmon", "fish", "tuna", "cod", "halibut", "shrimp", "seafood", "ceviche", "scallop"]],
  ["pot",   ["soup", "stew", "braise", "chili", "chowder", "broth", "pot", "ragu", "bolognese"]],
  ["pasta", ["pasta", "spaghetti", "linguine", "carbonara", "lasagna", "penne", "orzo", "risotto"]],
  ["taco",  ["taco", "burrito", "quesadilla", "enchilada", "tostada", "carnitas", "al pastor"]],
  ["salad", ["salad", "slaw", "greens", "caprese", "panzanella"]],
  ["pizza", ["pizza", "flatbread", "focaccia"]],
  ["flame", ["grill", "grilled", "roast", "roasted", "bbq", "barbecue", "steak", "kebab", "skewer"]],
];

export function motifFor(recipe) {
  if (recipe.motif) return recipe.motif;
  const hay = [recipe.title, recipe.category, ...(recipe.tags ?? [])]
    .filter(Boolean).join(" ").toLowerCase();
  for (const [motif, words] of MOTIF_KEYWORDS) {
    if (words.some((w) => hay.includes(w))) return motif;
  }
  const cuisine = String(recipe.cuisine ?? "").toLowerCase();
  if (["asian", "japanese", "chinese", "thai", "korean", "vietnamese"].includes(cuisine)) return "bowl";
  if (cuisine === "italian") return "pasta";
  if (cuisine === "mexican") return "taco";
  return "plate";
}
