"use client";
import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Btn, Switch } from "./ui";

const CELLS = 100;
const BASE = 82; // live data, cannot be removed

interface Fix {
  id: string;
  label: string;
  hint: string;
  points: number;
}

// The 98% to 82% endpoints are real. How the 16 points split across fixes is illustrative.
const fixes: Fix[] = [
  {
    id: "copies",
    label: "Process in place",
    hint: "Stop copying data between processing stages.",
    points: 6,
  },
  {
    id: "lists",
    label: "Flat arrays, not linked lists",
    hint: "Drop per-node pointer overhead where random access is not needed.",
    points: 4,
  },
  {
    id: "cache",
    label: "Evict stale cache entries",
    hint: "Free data nobody will read again.",
    points: 3,
  },
  {
    id: "proto",
    label: "Tighten Protobuf layouts",
    hint: "Smaller messages, smaller buffers.",
    points: 3,
  },
];

function Counter({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}

export default function RamToy() {
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  const saved = fixes.reduce((a, f) => a + (applied[f.id] ? f.points : 0), 0);
  const waste = fixes.reduce((a, f) => a + f.points, 0) - saved;
  const used = BASE + waste;
  const allOn = fixes.every((f) => applied[f.id]);

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,22rem)_1fr]">
      <div>
        {fixes.map((f) => (
          <Switch
            key={f.id}
            checked={!!applied[f.id]}
            onChange={(v) => setApplied((a) => ({ ...a, [f.id]: v }))}
            label={f.label}
            hint={f.hint}
            delta={`-${f.points} pts`}
          />
        ))}
        <div className="mt-5 flex gap-2">
          <Btn
            onClick={() =>
              setApplied(Object.fromEntries(fixes.map((f) => [f.id, true])))
            }
            disabled={allOn}
          >
            Apply all
          </Btn>
          <Btn
            onClick={() => setApplied({})}
            variant="line"
            disabled={saved === 0}
          >
            Reset
          </Btn>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <p
            className={`font-display text-[clamp(3.2rem,6vw,5rem)] font-semibold leading-none tracking-[-0.05em] tabular-nums transition-colors duration-300 ${
              used >= 95 ? "text-accent-text" : ""
            }`}
          >
            <Counter value={used} />
            <span className="text-3xl">%</span>
            <span className="ml-3 whitespace-nowrap text-xl font-medium tracking-normal text-muted">
              RAM used
            </span>
          </p>
          <p
            aria-live="polite"
            className="max-w-[34ch] text-[0.95rem] sm:text-right leading-snug"
          >
            {used >= 95
              ? `Only ${100 - used}% headroom. One burst of data could exhaust memory.`
              : `${100 - used}% headroom. Room to absorb a burst.`}
          </p>
        </div>

        <ul
          className="mt-8 grid gap-1"
          style={{ gridTemplateColumns: "repeat(20, minmax(0, 1fr))" }}
          role="img"
          aria-label={`RAM map, ${used} of ${CELLS} blocks used`}
        >
          {Array.from({ length: CELLS }, (_, i) => {
            const kind = i < BASE ? "live" : i < used ? "waste" : "free";
            return (
              <li
                key={i}
                className={`aspect-square transition-colors duration-300 ${
                  kind === "live"
                    ? "bg-ink"
                    : kind === "waste"
                      ? "bg-accent"
                      : "border border-line"
                }`}
              />
            );
          })}
        </ul>

        <p className="label mt-4 flex flex-wrap gap-x-6 gap-y-1 normal-case tracking-normal">
          <span>
            <span
              aria-hidden
              className="mr-2 inline-block h-2.5 w-2.5 bg-ink"
            />
            Live data
          </span>
          <span>
            <span
              aria-hidden
              className="mr-2 inline-block h-2.5 w-2.5 bg-accent"
            />
            Overhead and copies
          </span>
          <span>
            <span
              aria-hidden
              className="mr-2 inline-block h-2.5 w-2.5 border border-line"
            />
            Free
          </span>
        </p>
      </div>
    </div>
  );
}
