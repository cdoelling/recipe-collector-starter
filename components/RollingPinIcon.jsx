// The "Roll again" icon: a rolling pin, slightly tilted, in the button's ink
// (currentColor) with an accent-tinted barrel. There's no rolling-pin emoji,
// so it's drawn here.
export default function RollingPinIcon({ size = 34 }) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 40 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <g transform="rotate(-14 20 12)">
        {/* handles: a neck and a rounded grip on each end */}
        <path d="M5.5 12h4M30.5 12h4" strokeWidth="2.2" />
        <rect x="1" y="9.6" width="5" height="4.8" rx="2.4" fill="currentColor" />
        <rect x="34" y="9.6" width="5" height="4.8" rx="2.4" fill="currentColor" />
        {/* barrel */}
        <rect x="9.5" y="6.5" width="21" height="11" rx="3" fill="var(--accent)" fillOpacity="0.85" />
        <path d="M13 10.2h9" stroke="var(--on-accent)" strokeWidth="1.4" opacity="0.8" />
      </g>
    </svg>
  );
}
