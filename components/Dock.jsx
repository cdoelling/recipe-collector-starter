"use client";

import { useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dock({ slots, hasList, onRemove }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const ref = useRef(null);

  // The dock's height drives the page's bottom padding and where the shopping
  // list's own bar sits, so publish it rather than hard-coding a guess.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty("--dock-h", `${Math.round(el.offsetHeight)}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, [slots.length]);

  const remove = async (slug) => {
    if (onRemove) return onRemove(slug);
    await fetch("/api/week", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "remove", slug }),
    });
    startTransition(() => router.refresh());
  };

  return (
    <div className="dock" ref={ref}>
      <div className="dock-inner">
        <div className="dock-head">
          <span className="dock-title">What&apos;s on the menu</span>
          <div className="dock-actions">
            {hasList ? (
              <Link className="btn" data-size="sm" href="/list">🛒 List</Link>
            ) : null}
          </div>
        </div>

        <div className="slots">
          {slots.map((slot, i) => (
            <div key={i} className="slot" data-filled={Boolean(slot)}>
              {slot ? (
                <>
                  <Link href={`/recipe/${slot.slug}`} className="thumb">{slot.art}</Link>
                  <span className="cap">{slot.title}</span>
                  <button className="x" onClick={() => remove(slot.slug)} aria-label={`Remove ${slot.title}`}>
                    ✕
                  </button>
                </>
              ) : (
                <span className="n">{i + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
