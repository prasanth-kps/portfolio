"use client";
import { useSyncExternalStore } from "react";

// Best scores for the Lab games, kept in this browser only. Higher is always better.
const KEY = "lab-best-v1";
const listeners = new Set<() => void>();

const raw = () => {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};

function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}

function parse(s: string): Record<string, number> {
  try {
    return s ? (JSON.parse(s) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function useBest(id: string): number | null {
  const s = useSyncExternalStore(subscribe, raw, () => "");
  const v = parse(s)[id];
  return typeof v === "number" ? v : null;
}

export function recordBest(id: string, score: number) {
  const all = parse(raw());
  if (typeof all[id] === "number" && all[id] >= score) return;
  all[id] = score;
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage can be blocked. The game still works without a saved best.
  }
  listeners.forEach((fn) => fn());
}
