"use client";
import { useState } from "react";
import { Btn, ResultCard, ScoreBar, Switch } from "./ui";
import { recordBest, useBest } from "@/lib/best";

const BUDGET_MS = 10;
const BASE_MS = 4.6; // network in and out, parsing, real-time features, serializing

interface Opt {
  id: string;
  label: string;
  hint: string;
  ms: number;
  catches: number; // points of fraud coverage, only counted when a model uses them
  group?: "model" | "history";
}

const OPTS: Opt[] = [
  {
    id: "tree",
    label: "Lightweight tree model",
    hint: "Small, fast, and good at tabular transaction data.",
    ms: 2.1,
    catches: 60,
    group: "model",
  },
  {
    id: "deep",
    label: "Deep network",
    hint: "More expressive, but every prediction is a heavy forward pass.",
    ms: 7.8,
    catches: 80,
    group: "model",
  },
  {
    id: "cache",
    label: "Merchant history from a cache",
    hint: "Recent history held in memory next to the model.",
    ms: 1.3,
    catches: 7,
    group: "history",
  },
  {
    id: "db",
    label: "Merchant history from the database",
    hint: "Full history, fetched on every transaction.",
    ms: 8.2,
    catches: 10,
    group: "history",
  },
  {
    id: "vel",
    label: "Velocity features",
    hint: "How many cards this merchant saw in the last minute.",
    ms: 0.9,
    catches: 4,
  },
  {
    id: "ens",
    label: "A second tree for an ensemble",
    hint: "Two small models vote.",
    ms: 1.4,
    catches: 5,
  },
  {
    id: "norm",
    label: "Recompute normalization",
    hint: "Derive constants per request instead of loading them.",
    ms: 1.1,
    catches: 0,
  },
];

const evaluate = (on: Set<string>) => {
  const ms =
    Math.round(
      (BASE_MS +
        OPTS.filter((o) => on.has(o.id)).reduce((a, o) => a + o.ms, 0)) *
        10,
    ) / 10;
  const hasModel = on.has("tree") || on.has("deep");
  const caught = hasModel
    ? OPTS.filter((o) => on.has(o.id)).reduce((a, o) => a + o.catches, 0)
    : 0;
  return { ms, caught, fits: ms <= BUDGET_MS };
};

// Best score reachable, found by trying every combination.
const OPTIMUM = (() => {
  let best = 0;
  for (let mask = 0; mask < 1 << OPTS.length; mask += 1) {
    const on = new Set(OPTS.filter((_, i) => mask & (1 << i)).map((o) => o.id));
    const clash = (["model", "history"] as const).some(
      (g) => OPTS.filter((o) => o.group === g && on.has(o.id)).length > 1,
    );
    if (clash) continue;
    const r = evaluate(on);
    if (r.fits) best = Math.max(best, r.caught);
  }
  return best;
})();

export default function BudgetGame() {
  const [on, setOn] = useState<Set<string>>(new Set());
  const [shipped, setShipped] = useState(false);
  const best = useBest("budget");

  const r = evaluate(on);
  const axis = Math.max(12, r.ms * 1.06);
  const score = shipped && r.fits ? r.caught : 0;
  const hasModel = on.has("tree") || on.has("deep");

  const toggle = (o: Opt, v: boolean) => {
    if (shipped) return;
    setOn((cur) => {
      const n = new Set(cur);
      if (v) {
        // One model and one history source at a time.
        if (o.group)
          OPTS.filter((x) => x.group === o.group).forEach((x) =>
            n.delete(x.id),
          );
        n.add(o.id);
      } else n.delete(o.id);
      return n;
    });
  };

  const ship = () => {
    setShipped(true);
    recordBest("budget", r.fits ? r.caught : 0);
  };
  const again = () => {
    setOn(new Set());
    setShipped(false);
  };

  const picked = OPTS.filter((o) => on.has(o.id));
  const segs = picked.map((o, i) => ({
    o,
    start: BASE_MS + picked.slice(0, i).reduce((a, x) => a + x.ms, 0),
  }));

  return (
    <div className="space-y-6">
      <ScoreBar
        goal={`Catch as much fraud as you can, and still answer in ${BUDGET_MS} ms. Go over and the score is zero.`}
        score={score}
        best={best}
        fmt={(n) => `${n}%`}
      />

      <div className="grid gap-10 xl:grid-cols-[minmax(0,24rem)_1fr]">
        <div className={shipped ? "pointer-events-none opacity-60" : ""}>
          {OPTS.map((o) => (
            <Switch
              key={o.id}
              checked={on.has(o.id)}
              onChange={(v) => toggle(o, v)}
              label={o.label}
              hint={o.hint}
              delta={`+${o.ms.toFixed(1)} ms${o.catches ? `, +${o.catches}%` : ""}`}
            />
          ))}
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <p
              className={`font-display text-[clamp(3.2rem,6vw,5rem)] font-semibold leading-none tracking-[-0.05em] tabular-nums transition-colors duration-300 ${
                r.fits ? "" : "text-accent-text"
              }`}
            >
              {r.ms.toFixed(1)}
              <span className="ml-2 text-2xl text-muted">ms</span>
            </p>
            <div className="sm:text-right">
              <p className="font-display text-3xl font-semibold leading-none tabular-nums">
                {r.caught}%
              </p>
              <p className="label mt-1">fraud caught</p>
            </div>
          </div>

          <p
            aria-live="polite"
            className="mt-3 text-[0.95rem] leading-snug text-muted"
          >
            {!hasModel && on.size > 0
              ? "Features need a model to use them. Pick one."
              : r.fits
                ? `${(BUDGET_MS - r.ms).toFixed(1)} ms to spare.`
                : `Over by ${(r.ms - BUDGET_MS).toFixed(1)} ms. In production this is a timeout.`}
          </p>

          <div className="relative mt-10">
            <div
              className="relative h-14 overflow-hidden border border-line bg-sunken"
              role="img"
              aria-label={`Latency ${r.ms} milliseconds of ${BUDGET_MS}`}
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 bg-ink"
                style={{ width: `${(BASE_MS / axis) * 100}%` }}
              />
              {segs.map(({ o, start }, i) => (
                <span
                  key={o.id}
                  aria-hidden
                  className={`absolute inset-y-0 ${i % 2 ? "bg-accent/80" : "bg-accent"}`}
                  style={{
                    left: `${(start / axis) * 100}%`,
                    width: `${(o.ms / axis) * 100}%`,
                  }}
                />
              ))}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute -top-6 bottom-0"
              style={{ left: `${(BUDGET_MS / axis) * 100}%` }}
            >
              <span
                className={`label absolute -top-0.5 whitespace-nowrap ${BUDGET_MS / axis > 0.55 ? "right-2" : "left-2"}`}
              >
                10 ms budget
              </span>
              <span className="absolute inset-y-0 left-0 w-px bg-ink" />
            </div>
          </div>
          <p className="label mt-3 normal-case tracking-normal">
            Dark: fixed pipeline, {BASE_MS} ms. Orange: your choices.
          </p>

          {!shipped && (
            <div className="mt-8 flex gap-2">
              <Btn onClick={ship} disabled={!hasModel}>
                Ship it
              </Btn>
              <Btn onClick={again} variant="line" disabled={on.size === 0}>
                Clear
              </Btn>
            </div>
          )}
        </div>
      </div>

      {shipped && (
        <ResultCard
          win={r.fits}
          headline={
            r.fits
              ? r.caught === OPTIMUM
                ? "Best design"
                : "Shipped"
              : "Timed out"
          }
          detail={
            r.fits
              ? `Caught ${r.caught}% in ${r.ms.toFixed(1)} ms. The best design that fits catches ${OPTIMUM}%.`
              : `${r.ms.toFixed(1)} ms is over the ${BUDGET_MS} ms budget, so every transaction would fall back to a default decision. The best design that fits catches ${OPTIMUM}%.`
          }
          real="The real trade is the same one. A heavier model or a slower lookup catches more on paper, but a score that arrives late is a score nobody uses."
          score={score}
          best={best}
          fmt={(n) => `${n}%`}
          onAgain={again}
        />
      )}
    </div>
  );
}
