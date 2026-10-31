"use client";

import { useState } from "react";

export default function Pantry({ initial }) {
  const [staples, setStaples] = useState(initial);
  const [draft, setDraft] = useState("");

  const send = async (body) => {
    const res = await fetch("/api/pantry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setStaples(json.staples);
  };

  return (
    <>
      <form
        className="btn-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          send({ add: draft.trim() });
          setDraft("");
        }}
      >
        <input
          className="field"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a staple — fish sauce, panko…"
          aria-label="Add a pantry staple"
        />
        <button className="btn" type="submit">Add</button>
      </form>

      <div className="tagrow" style={{ marginTop: 22 }}>
        {staples.map((s) => (
          <button key={s} className="tag" onClick={() => send({ remove: s })} title={`Remove ${s}`}>
            {s} ✕
          </button>
        ))}
      </div>
    </>
  );
}
