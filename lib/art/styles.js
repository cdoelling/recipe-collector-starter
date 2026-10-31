import { adjust, makePen } from "./core.js";
import { MOTIFS } from "./motifs.js";

// Every renderer gets the same context and returns { defs, body }.
// `place` drops a motif group at a given centre and scale in card space.
function place(inner, { cx, cy, scale = 1, extra = "" }) {
  return `<g transform="translate(${cx - 100 * scale},${cy - 100 * scale}) scale(${scale})"${extra}>${inner}</g>`;
}

const grain = (id, opacity = 0.16, freq = 0.9) => ({
  def: `<filter id="${id}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="7" result="n"/>
      <feColorMatrix type="saturate" values="0" in="n" result="g"/>
    </filter>`,
  layer: (W, H) =>
    `<rect width="${W}" height="${H}" filter="url(#${id})" opacity="${opacity}" style="mix-blend-mode:multiply"/>`,
});

/* ------------------------------------------------------------------ *
 * Risograph — two spot inks, overprinted, slightly out of register.
 * ------------------------------------------------------------------ */
export function riso(recipe, { W, H, rand, p, motifName, id }) {
  const paper = "#F4EFE3";
  const a = adjust(p.bg, { saturate: 1.15, lighten: 0.02 });
  const b = adjust(p.cool, { saturate: 1.2, lighten: -0.04 });
  const cx = W / 2, cy = 126;
  const g = grain(`${id}g`, 0.22, 1.1);
  const off = 5 + rand() * 3;

  // Riso only has two inks. Bucket every colour a motif asks for by lightness so
  // the dish still reads as a dish instead of collapsing into one silhouette.
  const luma = (hex) => {
    if (!hex || !hex.startsWith("#")) return 1;
    const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
    return (((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255;
  };
  const ink2 = (c) => {
    const l = luma(c);
    if (l > 0.86) return paper;
    if (l > 0.62) return adjust(a, { lighten: 0.2 });
    if (l > 0.36) return a;
    return b;
  };

  const shape = makePen({ ink: "none", tint: ink2 });
  const shadow = makePen({ ink: "none", fill: b });
  const outline = makePen({ ink: b, fill: "none", width: 2.6 });

  return {
    defs: `${g.def}
      <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.5" stop-color="${b}" stop-opacity="0"/>
        <stop offset="1" stop-color="${b}" stop-opacity="0.78"/>
      </linearGradient>`,
    body: `<rect width="${W}" height="${H}" fill="${paper}"/>
      <g style="mix-blend-mode:multiply">
        <circle cx="${cx + 6}" cy="${cy - 8}" r="116" fill="${adjust(b, { lighten: 0.3, saturate: 0.7 })}" opacity="0.9"/>
        <path d="M0,${H - 70} Q${W / 2},${H - 124} ${W},${H - 70} L${W},${H} L0,${H} Z" fill="${a}" opacity="0.75"/>
        <circle cx="${W - 46}" cy="44" r="24" fill="${a}" opacity="0.8"/>
      </g>
      <g style="mix-blend-mode:multiply" opacity="0.32">
        ${place(MOTIFS[motifName](shadow, p, { detail: false }), { cx: cx + off, cy: cy + off, scale: 1.0 })}
      </g>
      <g style="mix-blend-mode:multiply">
        ${place(MOTIFS[motifName](shape, p, { detail: false }), { cx, cy, scale: 1.0 })}
        ${place(MOTIFS[motifName](outline, p, { detail: false }), { cx, cy, scale: 1.0 })}
      </g>
      ${g.layer(W, H)}
      <rect width="${W}" height="${H}" fill="url(#${id}s)"/>`,
  };
}
