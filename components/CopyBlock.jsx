"use client";

import { useState } from "react";
import CopyButton from "@/components/CopyButton";

// A block of text with a Copy button — the build prompt on /contribute. With
// `previewUntil`, only the text before that marker shows at full strength; a
// few lines after it fade out (nobody reads the whole prompt, they copy it),
// and "Show the whole prompt" opens the rest. Copy always copies everything.
const FADE_CHARS = 260;

export default function CopyBlock({ text, label = "Copy prompt", previewUntil }) {
  const [open, setOpen] = useState(false);
  const cut = previewUntil ? text.indexOf(previewUntil) : -1;
  const short = cut > 0 && !open;

  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <CopyButton text={text} label={label} size="sm" />
      </div>
      <pre className="copyblock-text" data-short={short || undefined}>
        {short ? (
          <>
            {text.slice(0, cut)}
            <span className="copyblock-fade">{text.slice(cut, cut + FADE_CHARS)}</span>
          </>
        ) : (
          text
        )}
      </pre>
      {cut > 0 ? (
        <button className="btn copyblock-toggle" data-size="sm" data-variant="ghost" onClick={() => setOpen(!open)}>
          {open ? "Show less" : "Show the whole prompt"}
        </button>
      ) : null}
    </div>
  );
}
