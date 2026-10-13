"use client";
import { useEffect, useState } from "react";
import { Btn, ResultCard, ScoreBar } from "./ui";
import { recordBest, useBest } from "@/lib/best";

const TEXT = "battery 3.7V, grid 238V, inverter online, temp 41C";
const FRAME = 8;
const MAX_TRIES = 6;
const BUDGET = 12; // transmissions allowed for the whole message
const TICK_MS = 50;
const SWEET = 75; // signal level worth transmitting at
const CHUNKS = Array.from({ length: Math.ceil(TEXT.length / FRAME) }, (_, i) =>
  TEXT.slice(i * FRAME, (i + 1) * FRAME),
);

// Link quality drifts like a real radio: a slow swing with a faster wobble on top.
const quality = (t: number) =>
  Math.round(
    Math.min(
      98,
      Math.max(8, 52 + 38 * Math.sin(t * 0.11) + 10 * Math.sin(t * 0.37 + 1)),
    ),
  );

type Status = "pending" | "retry" | "done" | "failed";
interface Game {
  phase: "idle" | "play" | "done";
  frames: { status: Status; tries: number }[];
  cursor: number;
  attempts: number;
}

const fresh = (): Game => ({
  phase: "idle",
  frames: CHUNKS.map(() => ({ status: "pending", tries: 0 })),
  cursor: 0,
  attempts: 0,
});
const delivered = (g: Game) =>
  g.frames.filter((f) => f.status === "done").length;
const scoreOf = (g: Game) =>
  g.phase === "idle" ? 0 : delivered(g) * 100 + (BUDGET - g.attempts) * 10;

const cell: Record<Status | "sending", string> = {
  pending: "border-line text-muted",
  sending: "border-accent bg-accent/15 text-ink",
  retry: "border-accent bg-accent/10 text-accent-text",
  done: "border-ink bg-ink text-bg",
  failed: "border-dashed border-accent text-accent-text",
};

export default function LinkGame() {
  const [g, setG] = useState<Game>(fresh);
  const [t, setT] = useState(0);
  const best = useBest("link");

  useEffect(() => {
    if (g.phase !== "play") return;
    const id = setInterval(() => setT((x) => x + 1), TICK_MS);
    return () => clearInterval(id);
  }, [g.phase]);

  const q = quality(t);
  const trace = Array.from({ length: 64 }, (_, i) => {
    const age = 63 - i;
    return `${(i / 63) * 100},${100 - quality(t - age)}`;
  }).join(" ");

  const start = () => {
    setT(0);
    setG({ ...fresh(), phase: "play" });
  };

  const transmit = () => {
    if (g.phase !== "play") return;
    const ok = Math.random() * 100 < q;
    const frames = g.frames.slice();
    const tries = frames[g.cursor].tries + 1;
    let status: Status = "retry";
    let cursor = g.cursor;
    if (ok) {
      status = "done";
      cursor += 1;
    } else if (tries >= MAX_TRIES) {
      status = "failed";
      cursor += 1;
    }
    frames[g.cursor] = { status, tries };
    const attempts = g.attempts + 1;
    const done = cursor >= frames.length || attempts >= BUDGET;
    const next: Game = {
      phase: done ? "done" : "play",
      frames,
      cursor,
      attempts,
    };
    setG(next);
    if (done) recordBest("link", scoreOf(next));
  };

  const score = scoreOf(g);
  const got = delivered(g);
  const all = got === CHUNKS.length;
  const left = BUDGET - g.attempts;

  return (
    <div className="space-y-6">
      <ScoreBar
        goal={`Deliver all ${CHUNKS.length} frames in ${BUDGET} transmissions. Send when the signal is strong.`}
        score={score}
        best={best}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,19rem)_1fr]">
        <div>
          <div className="flex items-baseline justify-between">
            <p className="label">Signal</p>
            <p
              className={`font-mono text-sm tabular-nums ${q >= SWEET ? "text-accent-text" : ""}`}
            >
              {q}%
            </p>
          </div>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="mt-2 h-24 w-full border border-line bg-bg"
            role="img"
            aria-label={`Signal quality ${q} percent`}
          >
            <line
              x1="0"
              x2="100"
              y1={100 - SWEET}
              y2={100 - SWEET}
              strokeWidth="1"
              strokeDasharray="3 3"
              className="stroke-muted"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={trace}
              fill="none"
              strokeWidth="2"
              className="stroke-ink"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx="100"
              cy={100 - q}
              r="2.4"
              className={q >= SWEET ? "fill-accent" : "fill-ink"}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <p className="label mt-2 normal-case tracking-normal">
            Dashed line: good enough to transmit.
          </p>

          <div className="mt-5 flex items-center gap-4">
            {g.phase === "play" ? (
              <button
                type="button"
                autoFocus
                onClick={transmit}
                className="label inline-flex h-12 flex-1 items-center justify-center bg-ink px-5 !text-bg transition-[background-color,color,transform] duration-200 hover:bg-accent hover:!text-[#14181a] active:translate-y-px"
              >
                Transmit
              </button>
            ) : g.phase === "idle" ? (
              <Btn onClick={start}>Start</Btn>
            ) : null}
            <p className="label tabular-nums">
              {left} {left === 1 ? "transmission" : "transmissions"} left
            </p>
          </div>
        </div>

        <ul className="grid h-fit grid-cols-[repeat(auto-fill,minmax(5.2rem,1fr))] gap-2">
          {CHUNKS.map((chunk, i) => {
            const f = g.frames[i];
            const sending = g.phase === "play" && i === g.cursor;
            const key: Status | "sending" = sending ? "sending" : f.status;
            return (
              <li
                key={i}
                className={`flex h-[4.4rem] flex-col justify-between border px-2 py-1.5 transition-colors duration-150 ${cell[key]}`}
              >
                <span className="flex justify-between font-mono text-[0.65rem] uppercase tracking-wider opacity-70">
                  <span>#{i + 1}</span>
                  <span>{f.tries > 0 ? `x${f.tries}` : ""}</span>
                </span>
                <span className="truncate font-mono text-sm">{chunk}</span>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider opacity-70">
                  {f.status === "done"
                    ? "acked"
                    : f.status === "failed"
                      ? "dropped"
                      : f.status === "retry"
                        ? "retry"
                        : sending
                          ? "next"
                          : "queued"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {g.phase === "done" && (
        <ResultCard
          win={all}
          headline={
            all
              ? "Message delivered"
              : `${CHUNKS.length - got} ${CHUNKS.length - got === 1 ? "frame" : "frames"} lost`
          }
          detail={
            all
              ? `All ${CHUNKS.length} frames arrived in ${g.attempts} transmissions, ${left} to spare.`
              : `${got} of ${CHUNKS.length} frames arrived before the ${BUDGET} transmissions ran out or a frame hit its ${MAX_TRIES} tries.`
          }
          real="Real devices work the same way: acknowledge each frame, retry a few times, then give up. A bad link can never fill the memory with retries."
          score={score}
          best={best}
          onAgain={start}
        />
      )}
    </div>
  );
}
