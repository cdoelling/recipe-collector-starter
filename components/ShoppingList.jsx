"use client";

import { useEffect, useState } from "react";
import MenuPrint from "@/components/MenuPrint";
import StoreMapPrint from "@/components/StoreMapPrint";
import { STORE_CHAIN, STORE_SITE } from "@/lib/home";

// Ticked-off items are per-device convenience only, so localStorage is the right home.
const KEY = "recipe-collector:got";

// Drives the browser's own print dialog, scoped to just one hidden section
// via the CSS in globals.css (see "Printables"). "Save as PDF" in that
// dialog is what actually produces the file — no PDF library needed.
function usePrint() {
  const [printing, setPrinting] = useState(null); // "list" | "recipes" | null

  useEffect(() => {
    if (!printing) return;
    document.body.dataset.printing = printing;
    const done = () => setPrinting(null);
    window.addEventListener("afterprint", done);
    // The menu's card pictures load when it mounts; give them a few seconds to
    // arrive so the PDF isn't full of empty boxes.
    let live = true;
    const images = [...document.querySelectorAll(".print-only img")];
    Promise.race([
      Promise.all(images.map((img) => img.decode().catch(() => {}))),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ]).then(() => live && window.print());
    return () => {
      live = false;
      delete document.body.dataset.printing;
      window.removeEventListener("afterprint", done);
    };
  }, [printing]);

  return [printing, setPrinting];
}

export default function ShoppingList({ list, text, recipes, cart = true }) {
  const [got, setGot] = useState({});
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [cartResult, setCartResult] = useState(null);
  const [notice, setNotice] = useState(null);
  const [printing, setPrinting] = usePrint();

  useEffect(() => {
    try {
      setGot(JSON.parse(localStorage.getItem(KEY) ?? "{}"));
    } catch {
      setGot({});
    }
  }, []);

  const toggle = (key) => {
    const next = { ...got, [key]: !got[key] };
    setGot(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Safari refuses the clipboard API outside a secure context — fall back.
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

  // Match every list item to a Kroger product and drop the matches in the cart.
  // A 401 means we've never connected — bounce through Kroger's one-time login,
  // which lands back here at /list?kroger=connected and auto-sends (below).
  const sendToKroger = async () => {
    setSending(true);
    setCartResult(null);
    try {
      const res = await fetch("/api/kroger/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: list.items.map((i) => ({ term: i.key, name: i.name, quantity: 1 })),
        }),
      });
      if (res.status === 401) {
        window.location.href = "/api/kroger/authorize";
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Something went wrong");
      setCartResult(data);
    } catch (err) {
      setCartResult({ error: err.message });
    } finally {
      setSending(false);
    }
  };

  // Kroger sends the customer back with ?kroger=... — connected means the login
  // just succeeded, so finish the send they started; anything else is an error.
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("kroger");
    if (!status || !cart) return;
    window.history.replaceState({}, "", window.location.pathname);
    if (status === "connected") sendToKroger();
    else setNotice(status);
  }, []);

  const remaining = list.items.filter((i) => !got[i.key]).length;

  return (
    <>
      {list.sections.map((section) => (
        <div className="aisle" key={section.aisle}>
          <h3>{section.aisle}</h3>
          <ul className="list">
            {section.items.map((item) => (
              <li key={item.key} data-got={Boolean(got[item.key])} onClick={() => toggle(item.key)}>
                <span className="box" />
                <span className="amt">{item.amount ?? ""}</span>
                <span className="info">
                  <span className="name">{item.name}</span>
                  {item.from.length > 1 ? <span className="from">{item.from.join(" · ")}</span> : null}
                </span>
                <a
                  className="krogerlink"
                  href={`${STORE_SITE}/search?query=${encodeURIComponent(item.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Find ${item.name} on ${STORE_CHAIN}`}
                >
                  ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {list.omitted.length ? (
        <div className="omitted">
          <strong>Skipped {list.omitted.length} pantry item{list.omitted.length === 1 ? "" : "s"}</strong> —{" "}
          {[...new Set(list.omitted.map((o) => o.item.toLowerCase()))].join(", ")}. Edit that list on the
          Pantry page.
        </div>
      ) : null}

      <div className="actionbar">
        <span className="count">{remaining} still to buy</span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn" data-variant={copied ? "cool" : "ghost"} data-size="sm" onClick={copy}>
            {copied ? "Copied ✓" : "Copy list"}
          </button>
          <button className="btn" data-variant="ghost" data-size="sm" onClick={() => setPrinting("list")}>
            ⬇ Download Shopping List
          </button>
          {recipes?.length ? (
            <button className="btn" data-variant="ghost" data-size="sm" onClick={() => setPrinting("recipes")}>
              📖 Menu of the week
            </button>
          ) : null}
          {cart ? (
            <>
              <button className="btn" data-variant="cool" data-size="sm" onClick={sendToKroger} disabled={sending}>
                {sending ? "Sending…" : `🛒 Send to ${STORE_CHAIN} cart`}
              </button>
              <a className="btn" data-variant="ghost" data-size="sm" href={`${STORE_SITE}/cart`} target="_blank" rel="noreferrer">
                Open cart ↗
              </a>
            </>
          ) : null}
        </div>
      </div>

      {notice ? (
        <div className="omitted">
          <strong>{STORE_CHAIN} connection didn't complete</strong> ({notice}). Press <em>Send to {STORE_CHAIN} cart</em> to try again.
        </div>
      ) : null}

      {cartResult ? (
        <div className="omitted">
          {cartResult.error ? (
            <><strong>Couldn't reach {STORE_CHAIN}</strong> — {cartResult.error}</>
          ) : (
            <>
              <strong>
                Added {cartResult.added.length} item{cartResult.added.length === 1 ? "" : "s"} to your {STORE_CHAIN} cart.
              </strong>
              {cartResult.missed.length ? (
                <> Couldn't find: {cartResult.missed.map((m) => m.name).join(", ")} — add those by hand.</>
              ) : null}{" "}
              <a href={`${STORE_SITE}/cart`} target="_blank" rel="noreferrer">
                Open cart to choose delivery →
              </a>
            </>
          )}
        </div>
      ) : null}

      {/* Printables — hidden on screen; shown (and only these) when window.print()
          runs, via the body[data-printing] rules in globals.css. */}
      {printing === "list" ? <StoreMapPrint list={list} recipes={recipes} /> : null}
      {printing === "recipes" && recipes?.length ? <MenuPrint recipes={recipes} list={list} /> : null}
    </>
  );
}
