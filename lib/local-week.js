"use client";

import { useSyncExternalStore } from "react";

// The share site has no server, so a visitor's roll, seven slots and zip live
// in their own browser. Reads and writes are wrapped: private mode or blocked
// storage just means the week doesn't survive a reload.
const KEY = "recipe-collector:share-week";
const EMPTY = { rolled: [], slots: [], place: null };

let snapshot = null;
const listeners = new Set();

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return {
      rolled: Array.isArray(raw.rolled) ? raw.rolled : [],
      slots: Array.isArray(raw.slots) ? raw.slots.slice(0, 7) : [],
      place: raw.place ?? null,
    };
  } catch {
    return EMPTY;
  }
}

function get() {
  if (!snapshot) snapshot = load();
  return snapshot;
}

export function writeLocalWeek(patch) {
  snapshot = { ...get(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(snapshot)); } catch {}
  listeners.forEach((fn) => fn());
  return snapshot;
}

function subscribe(fn) {
  listeners.add(fn);
  // Another tab changed the week — reload ours.
  const onStorage = (e) => {
    if (e.key !== KEY) return;
    snapshot = load();
    fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

// The static HTML renders an empty week; the browser's copy takes over on mount.
export function useLocalWeek() {
  return useSyncExternalStore(subscribe, get, () => EMPTY);
}
