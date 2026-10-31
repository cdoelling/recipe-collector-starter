"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FOOD_FACTS } from "@/lib/food-facts";

// The food facts live in lib/food-facts.js, shared with the weekly menu PDF.

// Each instance owns its paint servers, including duplicate icons in a preview.
function FoodDefs({ id, food, light, dark }) {
  return (
    <defs>
      <radialGradient id={`${id}-food`} cx="32%" cy="22%" r="85%">
        <stop stopColor={`var(--food-${light})`} />
        <stop offset="0.48" stopColor={`var(--food-${food})`} />
        <stop offset="1" stopColor={`var(--food-${dark})`} />
      </radialGradient>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="0.85" y2="1">
        <stop stopColor="var(--food-white)" />
        <stop offset="0.35" stopColor="var(--food-knife)" />
        <stop offset="0.65" stopColor="var(--food-metal-dark)" />
        <stop offset="1" stopColor="var(--food-bowl)" />
      </linearGradient>
      <linearGradient id={`${id}-ceramic`} x1="0" y1="0" x2="0.2" y2="1">
        <stop stopColor="var(--food-white)" />
        <stop offset="0.45" stopColor="var(--food-ceramic)" />
        <stop offset="1" stopColor="var(--food-ceramic-dark)" />
      </linearGradient>
      <radialGradient id={`${id}-shadow`}>
        <stop stopColor="var(--food-shadow)" stopOpacity="0.24" />
        <stop offset="0.65" stopColor="var(--food-shadow)" stopOpacity="0.1" />
        <stop offset="1" stopColor="var(--food-shadow)" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-sheen`}>
        <stop stopColor="var(--food-white)" stopOpacity="0" />
        <stop offset="0.5" stopColor="var(--food-white)" stopOpacity="0.65" />
        <stop offset="1" stopColor="var(--food-white)" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

export function ButterIcon() {
  const id = `butter-${useId()}`;
  return (
    <svg className="food-icon" width="240" height="176" viewBox="0 0 240 176" aria-hidden="true">
      <FoodDefs id={id} food="butter" light="butter-light" dark="butter-dark" />
      <defs>
        <clipPath id={`${id}-stick`}><path d="M92 82l29-17h63v49l-29 17H92Z" /></clipPath>
      </defs>
      <ellipse cx="121" cy="149" rx="102" ry="13" fill={`url(#${id}-shadow)`} />
      <path d="M23 128Q120 91 216 125l-7 14Q118 164 30 141Z" fill={`url(#${id}-ceramic)`} />
      <ellipse cx="119" cy="127" rx="91" ry="19" fill="var(--food-white)" />
      <ellipse cx="123" cy="130" rx="75" ry="12" fill={`url(#${id}-shadow)`} />
      <path d="M92 82l29-17h63l-29 17Z" fill="var(--food-butter-light)" />
      <path d="M92 82h63v49H92Z" fill={`url(#${id}-food)`} />
      <path d="M155 82l29-17v49l-29 17Z" fill="var(--food-butter-dark)" />
      <path d="M97 86h53M160 85l19-12" className="food-fine-highlight" />
      <g clipPath={`url(#${id}-stick)`}>
        <path className="butter-sheen" d="M82 61h18l51 80h-18Z" fill={`url(#${id}-sheen)`} />
      </g>
      {[0, 1].map((slice) => (
        <g key={slice} transform={`translate(${slice * -23} ${slice * 5})`}>
          <g className="butter-slice" style={{ "--slice-x": `${18 + slice * 23}px`, animationDelay: `${slice * -0.3}s` }}>
            <path d="M67 91l22-13h12l-22 13Z" fill="var(--food-butter-light)" />
            <path d="M67 91h12v40H67Z" fill={`url(#${id}-food)`} />
            <path d="M79 91l22-13v39l-22 14Z" fill="var(--food-butter)" />
            <path d="M70 96v29" className="food-fine-highlight" />
          </g>
        </g>
      ))}
      <g className="butter-knife">
        <path d="M94 41l10 5-7 72q-9 8-12-2Z" fill={`url(#${id}-metal)`} />
        <rect x="94" y="16" width="13" height="35" rx="6" fill="var(--food-wood-dark)" transform="rotate(7 100 45)" />
        <path d="M99 23v19" className="food-fine-highlight" />
      </g>
    </svg>
  );
}

export function EggIcon() {
  const id = `egg-${useId()}`;
  return (
    <svg className="food-icon" width="240" height="176" viewBox="0 0 240 176" aria-hidden="true">
      <FoodDefs id={id} food="shell" light="white" dark="shell-2" />
      <defs>
        <radialGradient id={`${id}-yolk`} cx="35%" cy="25%">
          <stop stopColor="var(--food-yolk-light)" />
          <stop offset="0.6" stopColor="var(--food-yolk)" />
          <stop offset="1" stopColor="var(--food-yolk-dark)" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="151" rx="83" ry="12" fill={`url(#${id}-shadow)`} />
      <path d="M44 112q5 40 76 40t76-40" fill={`url(#${id}-ceramic)`} />
      <ellipse cx="120" cy="113" rx="76" ry="21" fill="var(--food-ceramic-dark)" />
      <ellipse cx="120" cy="113" rx="69" ry="17" fill="var(--food-shell-2)" />
      <g className="egg-white">
        <path d="M69 116c-7-10 14-16 29-13 11-14 33-10 41-2 24-4 43 4 37 15-4 11-28 10-44 9-26 8-59 3-63-9Z" fill="var(--food-white)" opacity="0.94" />
        <path d="M79 114q13-8 25-6m37 11q17 1 26-6" fill="none" stroke="var(--food-shell)" strokeWidth="2" />
      </g>
      <path className="egg-drip" d="M119 69q-4 21 0 39" fill="none" stroke="var(--food-white)" strokeWidth="5" strokeLinecap="round" />
      <g className="egg-yolk">
        <ellipse cx="121" cy="110" rx="20" ry="14" fill={`url(#${id}-yolk)`} />
        <ellipse cx="114" cy="105" rx="7" ry="3" fill="var(--food-white)" opacity="0.75" transform="rotate(-18 114 105)" />
      </g>
      <g className="egg-shell-left">
        <path d="M120 25c-19-5-35 19-35 37 0 14 14 22 35 17l-6-9 7-10-7-9 7-10Z" fill={`url(#${id}-food)`} stroke="var(--food-shell-2)" strokeWidth="1.5" />
        <path d="M105 34q-11 7-13 22" className="food-highlight" />
        <path d="M120 25l1 16-7 10 7 9-7 10 6 9" fill="none" stroke="var(--food-shell-edge)" strokeWidth="2" />
      </g>
      <g className="egg-shell-right">
        <path d="M122 25c19-5 35 19 35 37 0 14-14 22-35 17l-6-9 7-10-7-9 7-10Z" fill={`url(#${id}-food)`} stroke="var(--food-shell-2)" strokeWidth="1.5" />
        <path d="M122 25l1 16-7 10 7 9-7 10 6 9" fill="none" stroke="var(--food-shell-edge)" strokeWidth="2" />
        <path d="M144 59l-3 7m6 3-3 2" stroke="var(--food-shell-2)" strokeWidth="2" />
      </g>
      <path d="M50 120q70 33 140 0" className="food-highlight" />
    </svg>
  );
}

export function OnionIcon() {
  const id = `onion-${useId()}`;
  return (
    <svg className="food-icon" width="240" height="176" viewBox="0 0 240 176" aria-hidden="true">
      <FoodDefs id={id} food="onion" light="white" dark="onion-ring" />
      <ellipse cx="120" cy="153" rx="99" ry="11" fill={`url(#${id}-shadow)`} />
      <path d="M27 130l143-17 43 25-148 19-38-14Z" fill="var(--food-wood)" />
      <path d="M37 137l130-15m-99 26 123-16" stroke="var(--food-wood-dark)" strokeWidth="1" opacity="0.22" />
      <ellipse cx="104" cy="135" rx="55" ry="9" fill={`url(#${id}-shadow)`} />
      <path d="M86 73q-10-14-3-28l9 28 6-26q8 17 1 29" fill="var(--food-onion-green)" />
      <path d="M88 70c-27 8-40 29-32 50 6 20 53 24 67 6 19-26-12-42-22-54Z" fill={`url(#${id}-food)`} stroke="var(--food-onion-ring)" strokeWidth="2" />
      <ellipse cx="99" cy="107" rx="28" ry="31" fill="var(--food-onion)" />
      {[23, 17, 11, 5].map((r) => <ellipse key={r} cx="99" cy="107" rx={r * 0.82} ry={r} className="onion-ring" />)}
      <path d="M73 82q-16 24-4 40" className="food-highlight" />
      {[0, 1, 2].map((ring) => (
        <g key={ring} transform={`translate(${141 + ring * 19} ${127 + ring * 4}) rotate(${10 + ring * 9})`}>
          <g className="onion-slice" style={{ animationDelay: `${ring * -0.32}s` }}>
            <ellipse rx="15" ry="22" fill={`url(#${id}-food)`} fillOpacity="0.8" stroke="var(--food-onion-ring)" />
            <ellipse rx="11" ry="17" className="onion-ring" />
            <ellipse rx="6" ry="11" className="onion-ring" />
          </g>
        </g>
      ))}
      <g className="onion-knife">
        <path d="M55 58l103 26 3 38Q96 115 53 79Z" fill={`url(#${id}-metal)`} />
        <path d="M56 79q53 31 105 43" fill="none" stroke="var(--food-white)" strokeWidth="2" />
        <path d="M156 83l43 12" stroke="var(--food-wood-dark)" strokeWidth="15" strokeLinecap="round" />
        <circle cx="174" cy="88" r="2" fill="var(--food-knife)" />
        <circle cx="190" cy="92" r="2" fill="var(--food-knife)" />
      </g>
    </svg>
  );
}

export function CookieIcon() {
  const id = `cookie-${useId()}`;
  return (
    <svg className="food-icon" width="240" height="176" viewBox="0 0 240 176" aria-hidden="true">
      <FoodDefs id={id} food="dough" light="dough-light" dark="dough-dark" />
      <ellipse cx="120" cy="151" rx="106" ry="13" fill={`url(#${id}-shadow)`} />
      <path d="M33 90h172l15 52q1 8-9 8H29q-9 0-8-8Z" fill={`url(#${id}-metal)`} stroke="var(--food-tray)" strokeWidth="2" />
      <path d="M42 96l151-3 16 46-172 3-8-13Z" fill="var(--food-parchment)" />
      <path d="M42 96l3 14-16 19m164-36-7 13 23 33" fill="none" stroke="var(--food-shell-2)" strokeWidth="1.5" />
      {[63, 120, 177].map((x, i) => (
        <g key={x} transform={`translate(${x} 114)`}>
          <ellipse cy="18" rx="27" ry="7" fill={`url(#${id}-shadow)`} />
          <g className="cookie-ball" style={{ animationDelay: `${i * -0.22}s` }}>
            <ellipse rx="23" ry="19" fill={`url(#${id}-food)`} />
            <path d="M-17-3q2-10 13-11" className="food-fine-highlight" />
            <path d="M-17 8l5-2 2 4m20-21-3 5 4 3m-12 13 2-5" fill="none" stroke="var(--food-dough-dark)" strokeWidth="1.2" opacity="0.6" />
            <g className="cookie-chips" style={{ animationDelay: `${i * -0.22}s` }} fill="var(--food-choc)">
              <path d="M-10-9l5-2 3 5-6 2Zm17-3 6 2-1 5-6-2ZM-1 3l5-1 2 6-6 1Zm-15 2 4 1-1 5-4-2Zm27 3 4-2 2 4-4 2Z" />
              <path d="M-9-8l3-1m14-1 3 1M0 4h2" stroke="var(--food-choc-light)" strokeWidth="1.5" />
            </g>
          </g>
          <path className="cookie-steam" d="M0-30c-10-8 9-13 1-23" style={{ animationDelay: `${i * -0.45}s` }} />
        </g>
      ))}
      <path d="M31 145h178" className="food-fine-highlight" />
    </svg>
  );
}

export function AppleIcon() {
  const id = `apple-${useId()}`;
  const wedges = [
    "M112 61C64 39 54 86 69 120q13 29 35 19Z",
    "M112 61q-20 25-8 78 8 7 16 0V65Z",
    "M120 65v74q9 7 18 0 12-52-10-78Z",
    "M128 61c48-22 58 25 43 59q-13 29-33 19Z",
  ];
  return (
    <svg className="food-icon" width="240" height="176" viewBox="0 0 240 176" aria-hidden="true">
      <FoodDefs id={id} food="apple-red" light="apple-light" dark="apple-dark" />
      <ellipse cx="120" cy="153" rx="80" ry="11" fill={`url(#${id}-shadow)`} />
      {wedges.map((d, i) => (
        <g className="apple-wedge" key={d} style={{ "--fan-x": `${(i - 1.5) * 15}px`, "--fan-angle": `${(i - 1.5) * 13}deg` }}>
          <defs><clipPath id={`${id}-wedge-${i}`}><path d={d} /></clipPath></defs>
          <path d={d} fill={`url(#${id}-food)`} stroke="var(--food-apple-dark)" strokeWidth="0.8" />
          <g clipPath={`url(#${id}-wedge-${i})`}>
            <path className="apple-cut" d={d} fill="var(--food-apple-flesh)" transform={`translate(${i < 2 ? 5 : -5} -3) scale(1 0.98)`} />
            <path className="apple-sheen" d="M69 48h17l36 101h-17Z" fill={`url(#${id}-sheen)`} />
          </g>
          {(i === 1 || i === 2) && <path className="apple-cut" d={`M${i === 1 ? 113 : 128} 104q-7 7-2 12 6-1 2-12Z`} fill="var(--food-apple-stem)" />}
        </g>
      ))}
      <path d="M120 65q-5-17 3-27" fill="none" stroke="var(--food-apple-stem)" strokeWidth="5" strokeLinecap="round" />
      <g className="apple-leaf">
        <path d="M122 48q8-27 34-17-6 24-34 17Z" fill="var(--food-apple-leaf)" />
        <path d="M125 46l23-12" fill="none" stroke="var(--food-onion-green)" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export function StockIcon() {
  const id = `stock-${useId()}`;
  return (
    <svg className="food-icon" width="240" height="176" viewBox="0 0 240 176" aria-hidden="true">
      <FoodDefs id={id} food="broth" light="broth-light" dark="broth-dark" />
      <ellipse cx="120" cy="154" rx="94" ry="12" fill={`url(#${id}-shadow)`} />
      <path d="M50 97H32q-11 0-11 11t13 11h18m138-22h18q11 0 11 11t-13 11h-18" fill="none" stroke="var(--food-metal-dark)" strokeWidth="7" />
      <path d="M49 94l6 43q4 17 65 17t65-17l6-43" fill={`url(#${id}-metal)`} />
      <path d="M65 110l4 23q1 9 24 11" className="food-highlight" />
      <ellipse cx="120" cy="95" rx="71" ry="22" fill="var(--food-metal-dark)" />
      <ellipse cx="120" cy="94" rx="65" ry="18" fill={`url(#${id}-food)`} />
      <path d="M80 98l9 3m47-13 10 2m8 11 7-2" stroke="var(--food-onion-green)" strokeWidth="3" strokeLinecap="round" />
      {[ [76, 91, 4], [98, 99, 6], [121, 85, 3], [141, 98, 5], [161, 90, 4] ].map(([x, y, r], i) => (
        <g className="stock-bubble" key={x} style={{ animationDelay: `${i * -0.53}s` }}>
          <circle cx={x} cy={y} r={r} fill="var(--food-broth-light)" fillOpacity="0.65" stroke="var(--food-shell)" strokeWidth="1" />
          <path d={`M${x - r / 2} ${y}q0-${r / 2} ${r / 2}-${r / 2}`} className="food-fine-highlight" />
        </g>
      ))}
      <g className="stock-ladle">
        <path d="M140 94l42-58q6-7 10-3" fill="none" stroke="var(--food-wood-dark)" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="138" cy="97" rx="15" ry="7" fill={`url(#${id}-metal)`} transform="rotate(-16 138 97)" />
        <path d="M129 96q8-5 16-2" className="food-fine-highlight" />
      </g>
      {[79, 111, 148].map((x, i) => <path key={x} className="stock-steam" d={`M${x} 77c-15-12 16-19 1-33s10-17 6-26`} style={{ animationDelay: `${i * -0.8}s` }} />)}
      <g className="stock-lid">
        <path d="M55 65q8-22 57-22t63 22Z" fill={`url(#${id}-metal)`} />
        <ellipse cx="115" cy="65" rx="61" ry="5" fill="var(--food-knife)" stroke="var(--food-metal-dark)" strokeWidth="1.5" />
        <path d="M104 43v-6q9-7 18 0v6" fill="none" stroke="var(--food-wood-dark)" strokeWidth="6" strokeLinecap="round" />
        <path d="M75 56q13-8 29-8" className="food-highlight" />
      </g>
    </svg>
  );
}

export function PanTossIcon() {
  const id = `pan-${useId()}`;
  return (
    <svg className="food-icon" width="240" height="176" viewBox="0 0 240 176" aria-hidden="true">
      <FoodDefs id={id} food="pepper" light="pepper-light" dark="pepper-dark" />
      <defs>
        <linearGradient id={`${id}-iron`} x2="0" y2="1"><stop stopColor="var(--food-pan-light)" /><stop offset="1" stopColor="var(--food-pan)" /></linearGradient>
        <linearGradient id={`${id}-flame`} x2="0" y2="1"><stop stopColor="var(--food-flame-light)" /><stop offset="1" stopColor="var(--food-flame)" /></linearGradient>
      </defs>
      <ellipse cx="107" cy="157" rx="77" ry="10" fill={`url(#${id}-shadow)`} />
      {[74, 105, 137].map((x, i) => <path key={x} className="pan-flame" d={`M${x} 152q-14-7 0-25-1 10 6 12 6 8-6 13Z`} fill={`url(#${id}-flame)`} style={{ animationDelay: `${i * -0.7}s` }} />)}
      <g className="pan-skillet">
        <path d="M160 111l53-22q8-3 10 4t-7 9l-50 21" fill="var(--food-pan)" />
        <path d="M182 107l29-12" stroke="var(--food-pan-light)" strokeWidth="3" strokeLinecap="round" />
        <path d="M38 113q4 31 66 31t66-31Z" fill={`url(#${id}-iron)`} />
        <ellipse cx="104" cy="111" rx="66" ry="18" fill="var(--food-pan)" stroke="var(--food-pan-light)" strokeWidth="3" />
        <ellipse cx="104" cy="112" rx="53" ry="11" fill={`url(#${id}-shadow)`} />
        <path d="M52 126q19 11 46 11" className="food-fine-highlight" />
        <g transform="translate(76 105)"><g className="pan-pepper">
          <path d="M-13-8q15-12 27 0l-4 13q-13-9-21 0Z" fill={`url(#${id}-food)`} />
          <path d="M-9-6q10-6 19-1" fill="none" stroke="var(--food-pepper-light)" strokeWidth="2" />
        </g></g>
        <g transform="translate(114 105)"><g className="pan-mushroom">
          <path d="M-4-5h8l4 14q-8 5-15 0Z" fill="var(--food-mushroom-stem)" />
          <path d="M-15-3q2-23 16-17 11 3 15 17-14 9-31 0Z" fill="var(--food-mushroom)" />
          <path d="M-10-8q5-10 14-7" className="food-fine-highlight" />
          <path d="M-11-2q11 4 23 0" fill="none" stroke="var(--food-mushroom-dark)" strokeWidth="2" />
        </g></g>
        <g transform="translate(139 109)"><g className="pan-scallion">
          <path d="M-12 0l22-11 4 6L-7 6Z" fill="var(--food-scallion)" />
          <path d="M-8 1l18-9" stroke="var(--food-onion-green)" strokeWidth="2" />
          <ellipse cx="-9" cy="3" rx="3" ry="4" fill="var(--food-onion)" transform="rotate(-30 -9 3)" />
        </g></g>
        <g transform="translate(96 113)"><g className="pan-pepper pan-pepper-gold">
          <path d="M-8-3q9-11 17-3l-2 8q-7-4-11 2Z" fill="var(--food-pepper-gold)" />
        </g></g>
      </g>
    </svg>
  );
}

export function DoughRollIcon() {
  const id = `dough-${useId()}`;
  return (
    <svg className="food-icon" width="240" height="176" viewBox="0 0 240 176" aria-hidden="true">
      <FoodDefs id={id} food="bread-dough" light="flour" dark="bread-dough-dark" />
      <defs><linearGradient id={`${id}-pin`} x2="0" y2="1"><stop stopColor="var(--food-wood-dark)" /><stop offset="0.35" stopColor="var(--food-wood-light)" /><stop offset="1" stopColor="var(--food-wood)" /></linearGradient></defs>
      <ellipse cx="120" cy="153" rx="102" ry="11" fill={`url(#${id}-shadow)`} />
      <rect x="25" y="101" width="190" height="49" rx="13" fill="var(--food-wood)" />
      <path d="M38 142h164M47 107h98" stroke="var(--food-wood-dark)" opacity="0.22" />
      <ellipse cx="120" cy="125" rx="76" ry="20" fill="var(--food-flour)" opacity="0.45" />
      <g className="dough-spread">
        <ellipse cx="119" cy="128" rx="61" ry="16" fill={`url(#${id}-shadow)`} />
        <path d="M61 120c-3-23 35-33 61-30 34-4 60 10 57 29-3 21-118 23-118 1Z" fill={`url(#${id}-food)`} />
        <path d="M75 119q44 18 89-1" fill="none" stroke="var(--food-bread-dough-dark)" strokeWidth="2" opacity="0.5" />
        <path d="M77 104q20-10 42-8" className="food-highlight" />
      </g>
      <g className="dough-fold">
        <path d="M77 98q34-28 76 0c12 21-65 30-76 0Z" fill={`url(#${id}-food)`} />
        <path d="M82 102q37 13 68-3" fill="none" stroke="var(--food-bread-dough-dark)" strokeWidth="2" />
      </g>
      {[64, 171].map((x, i) => (
        <g key={x} transform={`translate(${x} 108)`}>
          <g className="dough-flour" style={{ "--puff-x": `${i ? 17 : -17}px`, animationDelay: `${i * -0.12}s` }} fill="var(--food-flour)">
            <circle r="5" /><circle cx="-7" cy="-5" r="3" /><circle cx="8" cy="-9" r="4" /><circle cx="3" cy="-18" r="2" />
          </g>
        </g>
      ))}
      <g className="dough-pin">
        <path d="M37 77h165" stroke="var(--food-wood-dark)" strokeWidth="11" strokeLinecap="round" />
        <rect x="61" y="62" width="117" height="30" rx="11" fill={`url(#${id}-pin)`} />
        <ellipse cx="64" cy="77" rx="5" ry="13" fill="var(--food-wood)" />
        <ellipse cx="175" cy="77" rx="5" ry="13" fill="var(--food-wood-dark)" />
        <path d="M76 70h83" className="food-fine-highlight" />
        <path d="M84 82q30-6 62 0" fill="none" stroke="var(--food-wood-dark)" opacity="0.3" />
      </g>
      <g fill="var(--food-flour)" opacity="0.8"><circle cx="49" cy="128" r="2" /><circle cx="187" cy="130" r="2" /><circle cx="60" cy="139" r="1.5" /><circle cx="177" cy="141" r="1" /></g>
    </svg>
  );
}

export function WhiskIcon() {
  const id = `whisk-${useId()}`;
  return (
    <svg className="food-icon" width="240" height="176" viewBox="0 0 240 176" aria-hidden="true">
      <FoodDefs id={id} food="sauce" light="sauce-light" dark="sauce-dark" />
      <ellipse cx="119" cy="154" rx="90" ry="12" fill={`url(#${id}-shadow)`} />
      <path d="M41 104q4 50 79 50t79-50" fill={`url(#${id}-ceramic)`} />
      <ellipse cx="120" cy="103" rx="79" ry="25" fill="var(--food-ceramic-dark)" />
      <ellipse cx="120" cy="103" rx="72" ry="20" fill="var(--food-sauce-thin)" />
      <ellipse className="whisk-cream" cx="120" cy="103" rx="72" ry="20" fill={`url(#${id}-food)`} />
      <g className="whisk-ripples" fill="none" stroke="var(--food-sauce-light)" strokeLinecap="round">
        <path d="M75 103c0-16 87-16 88 0 0 12-64 18-75 5" strokeWidth="3" />
        <path d="M99 103c-2-7 43-10 44-1s-25 10-32 4" strokeWidth="2" />
      </g>
      <g className="whisk-tool">
        <path d="M138 80l37-47" stroke="var(--food-wood-dark)" strokeWidth="11" strokeLinecap="round" />
        <path d="M145 70l26-33" stroke="var(--food-wood-light)" strokeWidth="2" strokeLinecap="round" />
        <g fill="none" stroke={`url(#${id}-metal)`} strokeWidth="2.5">
          <path d="M140 77c-57 8-44 40-25 33 19-7 23-23 25-33Z" />
          <path d="M140 77c-38 17-35 41-23 31 11-10 15-21 23-31Z" />
          <path d="M140 77c-15 31-26 43-34 32" />
        </g>
        <path d="M132 82l9-9" stroke="var(--food-knife)" strokeWidth="6" strokeLinecap="round" />
      </g>
      <path className="whisk-gloss" d="M75 110q26 12 53 7m13-2q15-1 23-7" />
      <path className="whisk-drop" d="M191 91q-9 9-3 12 10 2 3-12Z" fill="var(--food-sauce)" />
      <path d="M48 114q72 32 144 0" className="food-highlight" />
      <path d="M66 126q14 15 37 17" className="food-fine-highlight" />
    </svg>
  );
}

export function SpiceGrindIcon() {
  const id = `spice-${useId()}`;
  return (
    <svg className="food-icon" width="240" height="176" viewBox="0 0 240 176" aria-hidden="true">
      <FoodDefs id={id} food="stone" light="stone-light" dark="stone-dark" />
      <ellipse cx="117" cy="156" rx="97" ry="12" fill={`url(#${id}-shadow)`} />
      <path d="M90 135h59l7 15q-36 11-73 0Z" fill={`url(#${id}-food)`} />
      <path d="M48 94q4 52 72 52t72-52Z" fill={`url(#${id}-food)`} />
      <ellipse cx="120" cy="94" rx="72" ry="23" fill="var(--food-stone-dark)" />
      <ellipse cx="120" cy="96" rx="62" ry="16" fill="var(--food-spice-ground)" />
      <g className="spice-whole" fill="var(--food-peppercorn)">
        {[ [88, 92], [105, 102], [140, 92], [157, 99], [126, 88] ].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4.5" />)}
        <path d="M91 94l20-9 3 6-20 9Z" fill="var(--food-cinnamon)" />
        <path d="M94 94l15-7" stroke="var(--food-cinnamon-light)" strokeWidth="1.5" />
        <g transform="translate(125 99) scale(0.6 0.45)">
          <path d="M0-16 4-6 13-11 9-2 18 3 7 5 9 15 0 9-8 16-7 5-18 2-8-3-12-13-3-7Z" fill="var(--food-cinnamon)" stroke="var(--food-cinnamon-dark)" strokeWidth="1.5" />
          <path d="M0-11V0l10-8M0 0l12 3M0 0l6 10M0 0l-6 10M0 0l-12 1M0 0l-8-9" fill="none" stroke="var(--food-cinnamon-light)" strokeWidth="1.5" />
        </g>
      </g>
      <g className="spice-grains" fill="var(--food-cinnamon-light)">
        {[ [82, 99], [95, 87], [103, 108], [129, 102], [145, 105], [155, 91], [118, 90], [160, 101] ].map(([x, y]) => <ellipse key={x} cx={x} cy={y} rx="2" ry="1.3" />)}
      </g>
      <g className="spice-pestle">
        <path d="M108 98q-9-5-2-17l43-49q10-11 19-3t0 19l-39 51q-10 10-21-1Z" fill={`url(#${id}-food)`} stroke="var(--food-stone-dark)" strokeWidth="1" />
        <path d="M119 83l36-43" className="food-highlight" />
        <ellipse cx="160" cy="34" rx="10" ry="6" fill="var(--food-stone-light)" transform="rotate(-42 160 34)" />
      </g>
      {[86, 139, 156].map((x, i) => (
        <g key={x} transform={`translate(${x} 87)`}>
          <g className="spice-dust" style={{ animationDelay: `${i * -0.7}s` }} fill="var(--food-spice-dust)">
            <circle r="5" opacity="0.3" /><circle cx="-8" cy="-7" r="3" opacity="0.5" /><circle cx="4" cy="-14" r="2" /><circle cx="10" cy="-4" r="1.5" />
          </g>
        </g>
      ))}
      <path d="M57 106q6 27 39 31" className="food-fine-highlight" />
      <g fill="var(--food-stone-light)" opacity="0.35"><circle cx="81" cy="121" r="1.2" /><circle cx="112" cy="137" r="1" /><circle cx="155" cy="119" r="1.5" /><circle cx="141" cy="132" r="1" /></g>
      <g transform="translate(44 145) rotate(-16)">
        <path d="M0-16 4-6 13-11 9-2 18 3 7 5 9 15 0 9-8 16-7 5-18 2-8-3-12-13-3-7Z" fill="var(--food-cinnamon)" stroke="var(--food-cinnamon-dark)" strokeWidth="1.5" />
        <path d="M0 0V-11m0 11 10-8M0 0l12 3M0 0l6 10M0 0l-6 10M0 0l-12 1M0 0l-8-9" stroke="var(--food-cinnamon-light)" strokeWidth="1.5" />
        <circle r="3" fill="var(--food-cinnamon-dark)" />
      </g>
      <g transform="rotate(-18 192 143)">
        <path d="M171 139h40v10h-40Z" fill="var(--food-cinnamon)" />
        <path d="M174 141h34m-34 5h30" stroke="var(--food-cinnamon-light)" strokeWidth="1.5" />
        <ellipse cx="211" cy="144" rx="4" ry="5" fill="var(--food-cinnamon-dark)" /><ellipse cx="211" cy="144" rx="2" ry="3" fill="none" stroke="var(--food-cinnamon-light)" />
      </g>
      <g fill="var(--food-peppercorn)"><circle cx="66" cy="155" r="4" /><circle cx="74" cy="151" r="3" /><circle cx="166" cy="153" r="3.5" /></g>
    </svg>
  );
}

// The icons that can actually appear on the upload screen.
export const ICONS = [EggIcon, PanTossIcon, StockIcon, WhiskIcon, DoughRollIcon];

// Upgraded but not signed off yet — kept out of rotation until they get another
// pass. The dev-only /loading-preview page shows these alongside ICONS.
export const DRAFT_ICONS = [ButterIcon, OnionIcon, CookieIcon, AppleIcon, SpiceGrindIcon];

// Facts rotate purely on a clock — unrelated to how the upload itself is going.
function useRotatingFact(active, intervalMs = 10000) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * FOOD_FACTS.length));

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % FOOD_FACTS.length), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);

  return FOOD_FACTS[index];
}

function randomOtherIndex(current, length) {
  if (length <= 1) return current;
  let next = current;
  while (next === current) next = Math.floor(Math.random() * length);
  return next;
}

// The icon is tied to progress, not the clock: it holds steady for as long as
// one file is being read, and only changes when the batch moves on to the
// next upload (or a fresh upload starts).
function useIconForUpload(active, done) {
  const [iconIndex, setIconIndex] = useState(() => Math.floor(Math.random() * ICONS.length));
  const prevActive = useRef(false);
  const prevDone = useRef(done);

  useEffect(() => {
    const justStarted = active && !prevActive.current;
    const movedOn = active && done !== prevDone.current;
    if (justStarted || movedOn) {
      setIconIndex((i) => randomOtherIndex(i, ICONS.length));
    }
    prevActive.current = active;
    prevDone.current = done;
  }, [active, done]);

  return ICONS[iconIndex];
}

export default function LoadingScreen({ active, done, total }) {
  const fact = useRotatingFact(active);
  const Icon = useIconForUpload(active, done);
  if (!active) return null;

  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <Icon />
      <p className="loading-progress">
        {total > 1 ? `Reading recipe ${done} of ${total}…` : "Reading the recipe…"}
      </p>
      <p className="loading-fact" key={fact}>{fact}</p>
    </div>
  );
}
