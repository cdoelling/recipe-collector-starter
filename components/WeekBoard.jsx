"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RollingPinIcon from "@/components/RollingPinIcon";

async function post(body) {
  const res = await fetch("/api/week", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export default function WeekBoard({ items, booked, hasRolled, hasRecipes, slotsLeft }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);
  const [note, setNote] = useState(null);
  const [, startTransition] = useTransition();

  const run = async (key, body) => {
    setBusy(key);
    const json = await post(body);
    setNote(json.note ?? null);
    startTransition(() => router.refresh());
    setBusy(null);
  };

  if (!hasRecipes) {
    return (
      <div className="empty" style={{ marginTop: 30 }}>
        <p>No recipes yet.</p>
        <Link className="btn" href="/capture" style={{ marginTop: 16 }}>Add your first recipe</Link>
      </div>
    );
  }

  const full = slotsLeft <= 0;

  return (
    <>
      <div className="section-head">
        <h2>{hasRolled ? "This week's roll" : "Roll the week"}</h2>
        <button className="btn roll-btn" data-variant="ghost"
                onClick={() => run("roll", { action: "roll" })} disabled={busy === "roll"}>
          {busy === "roll" ? "Rolling…" : <><RollingPinIcon /> {hasRolled ? "Roll again" : "Roll"}</>}
        </button>
      </div>

      {note ? <div className="notice" data-tone="warn" style={{ marginBottom: 18 }}>{note}</div> : null}
      {full ? (
        <div className="notice" data-tone="warn" style={{ marginBottom: 18 }}>
          All seven slots are full. Drop one from the tray below to make room.
        </div>
      ) : null}

      {hasRolled ? (
        <div className="grid">
          {items.map((item) => {
            const isBooked = booked.includes(item.slug);
            return (
              <div key={item.slug} className="pick" data-booked={isBooked}>
                {item.card}
                <div className="pick-actions">
                  <button className="btn" data-size="sm"
                          data-variant={isBooked ? "cool" : undefined}
                          disabled={(!isBooked && full) || busy === item.slug}
                          onClick={() => run(item.slug, { action: isBooked ? "remove" : "add", slug: item.slug })}>
                    {isBooked ? "In the week" : full ? "Week full" : "+ Add to week"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <p>Nothing rolled yet. Hit roll and you&apos;ll get three dishes that suit today&apos;s weather.</p>
        </div>
      )}
    </>
  );
}
