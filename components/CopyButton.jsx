"use client";

import { useState } from "react";

// A button that copies `text` and says so for a couple of seconds. Used by
// CopyBlock (the build prompt) and the tastetest@ address on /send.
export default function CopyButton({ text, label = "Copy", size, className }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older Safari refuses the clipboard API; fall back like ShoppingList does.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <button
      className={["btn", className].filter(Boolean).join(" ")}
      data-size={size}
      data-variant={copied ? "cool" : undefined}
      onClick={copy}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
