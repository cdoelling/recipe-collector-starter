// Nine dishes, each drawn inside a 0 0 200 200 box. Every shape goes through the
// pen, so the same geometry becomes fat cartoon ink, an unfilled neon tube, or a
// soft gradient blob depending on which style is drawing it.

import { INK } from "./core.js";

function steam(k, p, x, y) {
  return [0, 1, 2]
    .map((i) =>
      k.stroke(
        `M${x + i * 26 - 26},${y - i * 6} c-9,-12 9,-20 0,-32 c-9,-12 9,-20 0,-30`,
        k.paint(p.cream), 7
      )
    )
    .join("");
}

export const MOTIFS = {
  bowl: (k, p, o = {}) => [
    k.path("M16,96 L184,96 C178,164 150,186 100,186 C50,186 22,164 16,96 Z", p.cool),
    k.ellipse(100, 96, 84, 18, "#FFF6E2"),
    k.ellipse(100, 96, 68, 12, "#F2C75C", 5),
    o.detail === false ? "" : steam(k, p, 100, 44),
    k.path("M148,18 l36,10 -6,20 -36,-10 z", "#FFF6E2", 5),
    o.detail === false ? "" : k.stroke("M150,22 L186,32", k.ink === "none" ? p.cool : INK, 4),
    k.circle(70, 84, 18, "#FFF9F0", 5),
    k.circle(70, 84, 8, "#F2A03D", 5),
    k.path("M116,58 l30,4 -5,36 -30,-4 z", "#2B2440", 5),
    k.circle(134, 86, 9, p.bg, 4),
    o.detail === false ? "" : k.stroke("M44,90 c12,-16 26,4 38,-12 c12,-16 26,4 38,-12", k.paint("#E8B44F"), 7),
    k.path("M16,96 C24,132 56,150 100,150 C144,150 176,132 184,96 C178,164 150,186 100,186 C50,186 22,164 16,96 Z", p.cool),
  ].join(""),

  fish: (k, p, o = {}) => [
    k.path("M46,100 L10,66 C5,92 5,110 10,134 Z", p.pop),
    k.path("M92,58 C106,36 132,38 142,62 C126,54 108,54 92,58 Z", p.pop),
    k.path("M44,100 C68,54 142,46 176,86 C186,94 186,106 176,114 C142,154 68,146 44,100 Z", p.cool),
    o.detail === false ? "" : k.stroke("M92,64 C82,86 82,114 92,136", k.ink === "none" ? p.pop : INK, 5),
    k.path("M106,140 c8,18 28,18 36,0 z", p.pop, 5),
    o.detail === false ? "" : k.stroke("M110,88 c14,8 14,22 0,30 M132,84 c14,9 14,24 0,34", "rgba(255,255,255,.6)", 6),
    k.circle(154, 88, 12, "#FFF9F0", 5),
    k.circle(157, 89, 6, k.ink === "none" ? p.bg : INK, 0),
    k.circle(52, 48, 9, "rgba(255,255,255,.75)", 4),
    k.circle(74, 30, 6, "rgba(255,255,255,.7)", 3),
  ].join(""),

  pot: (k, p, o = {}) => [
    o.detail === false ? "" : steam(k, p, 100, 44),
    k.path("M18,84 L36,84 L36,112 L18,112 z", p.cool, 5),
    k.path("M164,84 L182,84 L182,112 L164,112 z", p.cool, 5),
    k.path("M26,84 L174,84 C174,158 150,182 100,182 C50,182 26,158 26,84 Z", p.cool),
    k.ellipse(100, 84, 80, 16, "#FFF6E2"),
    k.ellipse(100, 82, 60, 10, "#F2C75C", 5),
    k.circle(100, 60, 11, "#F2C75C", 5),
    k.circle(78, 80, 7, p.bg, 4),
    k.circle(118, 78, 6, p.bg, 4),
  ].join(""),

  pasta: (k, p, o = {}) => [
    k.ellipse(100, 130, 90, 46, p.cool),
    k.ellipse(100, 130, 78, 38, "#FFF9F0", 5),
    k.ellipse(100, 120, 58, 26, "#F2C75C", 5),
    o.detail === false ? "" : k.stroke("M52,118 c14,-14 28,10 44,-4 c14,-12 28,10 46,-6", k.paint("#D9932F"), 6),
    o.detail === false ? "" : k.stroke("M56,132 c14,-14 28,10 44,-4 c14,-12 28,10 44,-6", k.paint("#D9932F"), 6),
    k.circle(76, 112, 14, "#8C3B1E", 5),
    k.circle(116, 118, 13, "#8C3B1E", 5),
    k.circle(98, 98, 12, "#8C3B1E", 5),
    k.path("M126,92 c12,-12 26,-8 28,4 c-12,10 -24,8 -28,-4 z", "#4FA85C", 4),
  ].join(""),

  taco: (k, p) => [
    k.path("M22,148 a78,78 0 0 1 156,0 z", "#F2C75C"),
    k.path("M34,144 a66,66 0 0 1 132,0 z", "#8C3B1E", 5),
    k.circle(62, 116, 16, "#4FA85C", 5),
    k.circle(100, 106, 17, "#4FA85C", 5),
    k.circle(138, 116, 16, "#4FA85C", 5),
    k.circle(80, 126, 11, p.bg, 4),
    k.circle(120, 126, 11, p.bg, 4),
    k.path("M22,148 L178,148 c0,17 -12,27 -78,27 c-66,0 -78,-10 -78,-27 z", "#F7DFA0"),
  ].join(""),

  salad: (k, p, o = {}) => {
    const leaf = (x, y, rot, fill) =>
      `<g transform="translate(${x},${y}) rotate(${rot})">` +
      k.path("M-32,0 C-19,-25 19,-25 32,0 C19,25 -19,25 -32,0 Z", fill, 5) +
      (o.detail === false ? "" : k.stroke("M-25,0 L25,0", "rgba(0,0,0,.22)", 3)) +
      `</g>`;
    return [
      leaf(52, 72, -22, "#3F9A52"),
      leaf(148, 70, 20, "#6FBF6A"),
      leaf(100, 54, -3, "#57B25E"),
      k.circle(66, 94, 14, "#D9414A", 5),
      k.circle(136, 96, 13, "#D9414A", 5),
      k.circle(100, 86, 12, "#F2C75C", 5),
      leaf(78, 108, 12, "#4FA85C"),
      leaf(126, 110, -14, "#3F9A52"),
      k.path("M20,118 L180,118 C174,166 148,186 100,186 C52,186 26,166 20,118 Z", p.cool),
    ].join("");
  },

  pizza: (k, p) => [
    k.path("M100,18 L182,166 L18,166 Z", "#F2C75C"),
    k.path("M18,166 a92,92 0 0 0 164,0 z", "#E8B45C", 6),
    k.circle(100, 76, 13, "#C1272D", 5),
    k.circle(72, 116, 13, "#C1272D", 5),
    k.circle(128, 118, 13, "#C1272D", 5),
    k.circle(100, 142, 12, "#C1272D", 5),
    k.path("M84,96 c10,-10 22,-8 24,2 c-10,8 -20,7 -24,-2 z", "#4FA85C", 4),
    k.path("M118,90 c9,-9 20,-7 22,2 c-9,7 -18,6 -22,-2 z", "#4FA85C", 4),
  ].join(""),

  flame: (k, p) => [
    k.path("M100,12 c34,44 58,58 58,94 a58,58 0 0 1 -116,0 c0,-24 16,-38 30,-58 c6,16 14,20 20,10 c8,-14 6,-30 8,-46 z", "#F2C75C"),
    k.path("M100,72 c18,26 30,32 30,54 a30,30 0 0 1 -60,0 c0,-16 20,-30 30,-54 z", p.bg, 5),
    k.stroke("M30,180 L170,180", k.ink === "none" ? p.pop : INK, 9),
    k.stroke("M52,180 L52,196 M100,180 L100,198 M148,180 L148,196", k.ink === "none" ? p.pop : INK, 7),
  ].join(""),

  plate: (k, p) => [
    k.path("M16,40 l12,0 0,146 -12,0 z", p.pop, 5),
    k.path("M172,40 c13,0 13,34 0,34 l6,112 -15,0 z", p.pop, 5),
    k.ellipse(100, 112, 82, 64, p.cool),
    k.ellipse(100, 112, 60, 46, "#FFF9F0", 5),
    k.circle(100, 104, 25, "#F2C75C", 5),
    k.circle(78, 124, 15, "#D9414A", 5),
    k.circle(124, 126, 13, "#4FA85C", 5),
  ].join(""),
};
