// Small condition icons for the forecast strip. Colors come from the same
// --accent / --text-dim theme variables everything else on the page uses, so
// they recolor automatically with the active skin instead of needing one
// icon set per style.
const SUN = "var(--accent)";
const CLOUD = "var(--text-dim)";
const RAIN = "var(--accent-2)";
const SNOW = "var(--accent-3)";

function Sun({ cx = 12, cy = 12, r = 5 }) {
  return (
    <g stroke={SUN} strokeWidth="2" strokeLinecap="round">
      <circle cx={cx} cy={cy} r={r} fill={SUN} stroke="none" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1={cx + Math.cos((deg * Math.PI) / 180) * (r + 2)}
          y1={cy + Math.sin((deg * Math.PI) / 180) * (r + 2)}
          x2={cx + Math.cos((deg * Math.PI) / 180) * (r + 5)}
          y2={cy + Math.sin((deg * Math.PI) / 180) * (r + 5)}
        />
      ))}
    </g>
  );
}

function Cloud({ x = 4, y = 10 }) {
  return (
    <path
      d={`M${x + 4} ${y + 8}h9a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.5A3.5 3.5 0 0 0 ${x + 4} ${y + 8}Z`}
      fill={CLOUD}
    />
  );
}

function Drops({ color = RAIN, y = 19 }) {
  return (
    <g stroke={color} strokeWidth="2" strokeLinecap="round">
      <line x1="9" y1={y} x2="8" y2={y + 3} />
      <line x1="14" y1={y} x2="13" y2={y + 3} />
      <line x1="19" y1={y} x2="18" y2={y + 3} />
    </g>
  );
}

function Flakes({ y = 20 }) {
  return (
    <g stroke={SNOW} strokeWidth="1.6" strokeLinecap="round">
      <line x1="8" y1={y - 2} x2="8" y2={y + 2} />
      <line x1="6.3" y1={y} x2="9.7" y2={y} />
      <line x1="13" y1={y - 2} x2="13" y2={y + 2} />
      <line x1="11.3" y1={y} x2="14.7" y2={y} />
      <line x1="18" y1={y - 2} x2="18" y2={y + 2} />
      <line x1="16.3" y1={y} x2="19.7" y2={y} />
    </g>
  );
}

function Bolt() {
  return <path d="M13 13l-4 6h3l-1 4 5-6h-3l1-4z" fill={SNOW /* reuse accent-3 for the strike */} />;
}

export default function WeatherIcon({ condition, size = 28 }) {
  const body = (() => {
    switch (condition) {
      case "clear":
        return <Sun cx={12} cy={12} r={6} />;
      case "partly-cloudy":
        return (
          <>
            <Sun cx={9} cy={9} r={4} />
            <Cloud x={2} y={9} />
          </>
        );
      case "rain":
        return (
          <>
            <Cloud x={2} y={4} />
            <Drops />
          </>
        );
      case "snow":
        return (
          <>
            <Cloud x={2} y={4} />
            <Flakes />
          </>
        );
      case "storm":
        return (
          <>
            <Cloud x={2} y={2} />
            <Bolt />
          </>
        );
      case "cloudy":
      default:
        return <Cloud x={2} y={7} />;
    }
  })();

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {body}
    </svg>
  );
}
