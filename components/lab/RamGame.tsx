"use client";
import { useEffect, useReducer, useRef } from "react";
import { Btn, ResultCard, ScoreBar } from "./ui";
import { recordBest, useBest } from "@/lib/best";

const N = 100;
const LIVE = 82;
const OVERHEAD = 16;
const TICK_MS = 100;
const WIN = 300; // ticks, 30 seconds
const LEAK_EVERY = 11; // a new overhead block every 1.1 s
const BURST_FIRST = 30;
const BURST_EVERY = 40;
const BURST_LEN = 12;

type Cell = 0 | 1 | 2 | 3; // free, live data, overhead, incoming burst
interface S {
  cells: Cell[];
  tick: number;
  bursts: number;
  releaseAt: number;
  phase: "idle" | "play" | "oom" | "held";
}
type A =
  | { type: "start" }
  | { type: "free"; i: number }
  | { type: "tick"; r1: number; r2: number };

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 98% used: 82 live blocks, 16 of overhead, 2 free. Same layout every run.
const START: Cell[] = (() => {
  const cells: Cell[] = [
    ...Array<Cell>(LIVE).fill(1),
    ...Array<Cell>(OVERHEAD).fill(2),
    ...Array<Cell>(N - LIVE - OVERHEAD).fill(0),
  ];
  const r = rng(11);
  for (let i = cells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(r() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells;
})();

const idle: S = {
  cells: START,
  tick: 0,
  bursts: 0,
  releaseAt: -1,
  phase: "idle",
};

function reduce(s: S, a: A): S {
  switch (a.type) {
    case "start":
      return { ...idle, phase: "play" };
    case "free": {
      if (s.phase !== "play" || s.cells[a.i] !== 2) return s;
      const cells = s.cells.slice();
      cells[a.i] = 0;
      return { ...s, cells };
    }
    case "tick": {
      if (s.phase !== "play") return s;
      const tick = s.tick + 1;
      let cells = s.cells.slice();
      let { bursts, releaseAt } = s;
      if (releaseAt >= 0 && tick >= releaseAt) {
        cells = cells.map((c) => (c === 3 ? 0 : c));
        releaseAt = -1;
      }
      const free = () => cells.flatMap((c, i) => (c === 0 ? [i] : []));
      // Overhead creeps back while nothing is in flight.
      if (tick % LEAK_EVERY === 0 && releaseAt < 0) {
        const f = free();
        if (!f.length) return { ...s, cells, tick, phase: "oom" };
        cells[f[Math.floor(a.r1 * f.length)]] = 2;
      }
      if (tick >= BURST_FIRST && (tick - BURST_FIRST) % BURST_EVERY === 0) {
        const size = Math.min(9, 3 + bursts);
        const f = free();
        if (f.length < size) return { ...s, cells, tick, bursts, phase: "oom" };
        const from = Math.floor(a.r2 * f.length);
        for (let k = 0; k < size; k += 1) cells[f[(from + k) % f.length]] = 3;
        bursts += 1;
        releaseAt = tick + BURST_LEN;
      }
      return {
        cells,
        tick,
        bursts,
        releaseAt,
        phase: tick >= WIN ? "held" : "play",
      };
    }
  }
}

const seconds = (n: number) => `${(n / 10).toFixed(1)} s`;

export default function RamGame() {
  const [s, dispatch] = useReducer(reduce, idle);
  const best = useBest("ram");
  const logged = useRef(false);

  useEffect(() => {
    if (s.phase !== "play") return;
    const id = setInterval(
      () => dispatch({ type: "tick", r1: Math.random(), r2: Math.random() }),
      TICK_MS,
    );
    return () => clearInterval(id);
  }, [s.phase]);

  const used = s.cells.filter((c) => c !== 0).length;
  const free = N - used;
  const score = s.tick;

  useEffect(() => {
    if (s.phase === "idle" || s.phase === "play") {
      logged.current = false;
      return;
    }
    if (logged.current) return;
    logged.current = true;
    recordBest("ram", score);
  }, [s.phase, score]);

  const over = s.cells.filter((c) => c === 2).length;
  const done = s.phase === "oom" || s.phase === "held";

  return (
    <div className="space-y-6">
      <ScoreBar
        goal={`Start at 98% RAM and hold for ${WIN / 10} seconds. Click the orange blocks to free them before a burst of data arrives.`}
        score={score}
        best={best}
        fmt={seconds}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,15rem)_1fr]">
        <div>
          <p
            className={`font-display text-[clamp(3.2rem,6vw,5rem)] font-semibold leading-none tracking-[-0.05em] tabular-nums transition-colors duration-300 ${
              used >= 95 ? "text-accent-text" : ""
            }`}
          >
            {used}
            <span className="text-3xl">%</span>
          </p>
          <p className="label mt-2">RAM used</p>
          <div
            className="mt-5 h-1.5 w-full bg-sunken"
            role="progressbar"
            aria-label="Time held"
            aria-valuemin={0}
            aria-valuemax={WIN}
            aria-valuenow={s.tick}
          >
            <div
              className="h-full bg-accent"
              style={{ width: `${(s.tick / WIN) * 100}%` }}
            />
          </div>
          <p className="label mt-2 tabular-nums">
            {seconds(s.tick)} of {WIN / 10} s
          </p>
          <div className="mt-6">
            {s.phase === "idle" && (
              <Btn onClick={() => dispatch({ type: "start" })}>Start</Btn>
            )}
            {s.phase === "play" && (
              <p
                aria-live="polite"
                className="text-[0.95rem] leading-snug text-muted"
              >
                {over} blocks of overhead. {free} free.{" "}
                {s.releaseAt >= 0 ? "Burst incoming." : "Keep freeing."}
              </p>
            )}
          </div>
        </div>

        <div>
          <ul
            className="grid gap-1"
            style={{ gridTemplateColumns: "repeat(20, minmax(0, 1fr))" }}
            aria-label={`RAM map, ${used} of ${N} blocks used`}
          >
            {s.cells.map((c, i) => (
              <li key={i} className="aspect-square">
                {c === 2 && s.phase === "play" ? (
                  <button
                    type="button"
                    aria-label="Free this overhead block"
                    onClick={() => dispatch({ type: "free", i })}
                    className="block h-full w-full bg-accent transition-transform duration-150 hover:scale-110 active:scale-90"
                  />
                ) : (
                  <span
                    className={`block h-full w-full transition-colors duration-200 ${
                      c === 1
                        ? "bg-ink"
                        : c === 2
                          ? "bg-accent"
                          : c === 3
                            ? "border border-accent bg-accent/25"
                            : "border border-line"
                    }`}
                  />
                )}
              </li>
            ))}
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
              Overhead, click to free
            </span>
            <span>
              <span
                aria-hidden
                className="mr-2 inline-block h-2.5 w-2.5 border border-accent bg-accent/25"
              />
              Incoming burst
            </span>
          </p>
        </div>
      </div>

      {done && (
        <ResultCard
          win={s.phase === "held"}
          headline={s.phase === "held" ? "Headroom held" : "Out of memory"}
          detail={
            s.phase === "held"
              ? `You held for ${WIN / 10} seconds with ${free} blocks to spare.`
              : `A burst needed more room than was free after ${seconds(s.tick)}.`
          }
          real="A deployed fleet sat at 98% RAM, one burst from running out. Freeing copies and wasted overhead took it to 82%, and that headroom is what let it absorb bursts."
          score={score}
          best={best}
          fmt={seconds}
          onAgain={() => dispatch({ type: "start" })}
        />
      )}
    </div>
  );
}
