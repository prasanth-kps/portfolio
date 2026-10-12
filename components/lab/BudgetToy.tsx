"use client";
import { useState } from "react";
import { Switch } from "./ui";

const BUDGET_MS = 10;

interface Stage {
  id: string;
  label: string;
  ms: number;
  extra?: boolean; // a cost the design choices can add or remove
}

function stages(historical: boolean, precomputed: boolean, deep: boolean): Stage[] {
  return [
    { id: "net-in", label: "Network in", ms: 1.2 },
    { id: "deser", label: "Deserialize", ms: 0.6 },
    { id: "feat", label: "Real-time features", ms: 1.4 },
    { id: "hist", label: "Historical lookup", ms: historical ? 8.2 : 0, extra: true },
    { id: "norm", label: "Recompute normalization", ms: precomputed ? 0 : 1.1, extra: true },
    { id: "infer", label: deep ? "Deep network inference" : "Lightweight tree model inference", ms: deep ? 7.8 : 2.1, extra: deep },
    { id: "ser", label: "Serialize", ms: 0.4 },
    { id: "net-out", label: "Network out", ms: 1.0 },
  ];
}

export default function BudgetToy() {
  const [historical, setHistorical] = useState(false);
  const [precomputed, setPrecomputed] = useState(true);
  const [deep, setDeep] = useState(false);

  const list = stages(historical, precomputed, deep);
  const total = list.reduce((a, s) => a + s.ms, 0);
  const axis = Math.max(12, total * 1.06);
  const over = total > BUDGET_MS;
  const starts = list.map((_, i) => list.slice(0, i).reduce((a, s) => a + s.ms, 0));

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,22rem)_1fr]">
      <div>
        <Switch
          checked={historical}
          onChange={setHistorical}
          label="Add a historical lookup"
          hint="Pull a long history for the merchant from a database on every transaction."
          delta="+8.2 ms"
        />
        <Switch
          checked={deep}
          onChange={setDeep}
          label="Use a deep network"
          hint="More expressive than a small model, but every prediction is a heavy forward pass."
          delta="+5.7 ms"
        />
        <Switch
          checked={!precomputed}
          onChange={(v) => setPrecomputed(!v)}
          label="Recompute normalization"
          hint="Derive constants per request instead of loading them precomputed."
          delta="+1.1 ms"
        />
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <p
            className={`font-display text-[clamp(3.2rem,6vw,5rem)] font-semibold leading-none tracking-[-0.05em] tabular-nums transition-colors duration-300 ${
              over ? "text-accent-text" : ""
            }`}
          >
            {total.toFixed(1)}
            <span className="ml-2 text-2xl text-muted">ms</span>
          </p>
          <p aria-live="polite" className="max-w-[34ch] text-[0.95rem] sm:text-right leading-snug">
            {over
              ? `Over budget by ${(total - BUDGET_MS).toFixed(1)} ms. In production this is a timeout or a fallback decision.`
              : `Fits with ${(BUDGET_MS - total).toFixed(1)} ms to spare.`}
          </p>
        </div>

        <div className="relative mt-10">
          <div className="relative h-14 overflow-hidden border border-line bg-sunken" role="img" aria-label={`Latency pipeline totaling ${total.toFixed(1)} milliseconds`}>
            {list.map((s, i) => {
              const start = starts[i];
              return (
                <span
                  key={s.id}
                  aria-hidden
                  className={`absolute inset-y-0 left-0 w-full origin-left transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
                    s.extra ? "bg-accent" : i % 2 ? "bg-ink/70" : "bg-ink"
                  }`}
                  style={{ transform: `translateX(${(start / axis) * 100}%) scaleX(${s.ms / axis})` }}
                />
              );
            })}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-6 bottom-0 transition-[left] duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
            style={{ left: `${(BUDGET_MS / axis) * 100}%` }}
          >
            <span className={`label absolute -top-0.5 whitespace-nowrap ${BUDGET_MS / axis > 0.55 ? "right-2" : "left-2"}`}>10 ms budget</span>
            <span className="absolute inset-y-0 left-0 w-px bg-ink" />
          </div>
        </div>

        <ul className="mt-8 grid gap-x-10 sm:grid-cols-2">
          {list.map((s) => (
            <li
              key={s.id}
              className={`flex justify-between gap-4 border-b border-line py-2 font-mono text-[0.82rem] transition-opacity duration-200 ${
                s.ms === 0 ? "opacity-30" : ""
              }`}
            >
              <span className={s.extra && s.ms > 0 ? "text-accent-text" : ""}>{s.label}</span>
              <span className="tabular-nums">{s.ms.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
