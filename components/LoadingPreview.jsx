"use client";

import { ICONS, DRAFT_ICONS } from "./LoadingScreen";

function Gallery({ icons }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
      {icons.map((Icon) => (
        <figure
          key={Icon.name}
          style={{
            margin: 0,
            padding: "28px 16px 16px",
            background: "var(--surface)",
            border: "var(--border-w) solid var(--card-border)",
            borderRadius: "var(--radius)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div style={{ transform: "scale(1.6)", transformOrigin: "center", padding: "30px 0" }}>
            <Icon />
          </div>
          <figcaption className="loading-progress">{Icon.name.replace(/Icon$/, "")}</figcaption>
        </figure>
      ))}
    </div>
  );
}

// Dev-only gallery: every loading icon, large, so an animation can be judged
// without uploading a recipe. Mounted at /loading-preview.
export default function LoadingPreview() {
  return (
    <>
      <p className="eyebrow" style={{ margin: "0 0 12px" }}>In rotation ({ICONS.length})</p>
      <Gallery icons={ICONS} />
      <p className="eyebrow" style={{ margin: "36px 0 12px" }}>Needs another pass ({DRAFT_ICONS.length})</p>
      <Gallery icons={DRAFT_ICONS} />
    </>
  );
}
