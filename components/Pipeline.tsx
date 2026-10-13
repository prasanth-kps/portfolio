"use client";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { FlowNode } from "@/data/projects";

const STEP_MS = 380;
const HINT = "Tap Run to watch it work, or tap a step to see what it does.";

// An architecture diagram that runs on demand. Tapping Run sends a packet along each row,
// and every step is a button that explains itself.
export default function Pipeline({
  rows,
  large,
  invert,
}: {
  rows: FlowNode[][];
  large?: boolean;
  invert?: boolean;
}) {
  const reduced = useReducedMotion();
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [step, setStep] = useState(-1); // index into the flattened sequence, -1 when idle
  const [sel, setSel] = useState<string | null>(null);

  const seq = useMemo(() => rows.flatMap((r, ri) => r.map((node, ci) => ({ key: `${ri}-${ci}`, node }))), [rows]);
  const offsets = useMemo(() => rows.map((_, ri) => rows.slice(0, ri).reduce((a, r) => a + r.length, 0)), [rows]);

  const stop = useCallback(() => {
    clearInterval(timer.current);
    timer.current = undefined;
    setStep(-1);
  }, []);

  const play = useCallback(() => {
    if (reduced || timer.current) return;
    setSel(null);
    let s = 0;
    setStep(0);
    timer.current = setInterval(() => {
      s += 1;
      if (s >= seq.length + 3) {
        stop();
        return;
      }
      setStep(Math.min(s, seq.length - 1));
    }, STEP_MS);
  }, [reduced, seq.length, stop]);

  useEffect(() => () => clearInterval(timer.current), []);

  const playing = step >= 0;
  const current = playing ? seq[step] : seq.find((s) => s.key === sel);

  const lit = invert ? "border-inv-accent" : "border-accent";
  const fill = invert ? "bg-inv-accent" : "bg-accent";

  return (
    <div>
      {!reduced && (
        <button
          type="button"
          onClick={() => (playing ? stop() : play())}
          className="label mb-4 inline-flex h-8 items-center border border-current/40 px-3 !text-current transition-[background-color,color,border-color] duration-200 hover:border-current hover:bg-current/10 active:translate-y-px"
        >
          {playing ? "Stop" : "Run"}
        </button>
      )}
      <div className={large ? "space-y-5" : "space-y-2.5"}>
        {rows.map((row, ri) => (
          <div
            key={ri}
            role="group"
            aria-label={row.map((n) => n.label).join(" to ")}
            className="flex flex-wrap items-center gap-y-2"
          >
            {row.map((node, ci) => {
              const idx = offsets[ri] + ci;
              const key = `${ri}-${ci}`;
              const visited = playing && idx <= step;
              const now = playing && idx === step;
              const picked = !playing && sel === key;
              return (
                <Fragment key={key}>
                  <button
                    type="button"
                    aria-pressed={picked}
                    onClick={() => {
                      stop();
                      setSel((s) => (s === key ? null : key));
                    }}
                    className={`border font-mono tracking-wide transition-[border-color,background-color] duration-200 hover:border-current ${
                      large ? "px-4 py-2.5 text-sm" : "px-2.5 py-1 text-xs"
                    } ${visited || picked ? lit : "border-current/30"} ${now || picked ? "bg-current/10" : ""}`}
                  >
                    {node.label}
                  </button>
                  {ci < row.length - 1 && (
                    <span
                      aria-hidden
                      className={`relative h-px bg-current/40 ${large ? "w-5 sm:w-10" : "w-4 sm:w-6"}`}
                    >
                      <span
                        className={`absolute inset-0 origin-left transition-transform duration-300 ease-linear ${fill} ${
                          playing && step >= idx ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </span>
                  )}
                </Fragment>
              );
            })}
          </div>
        ))}
      </div>

      <p
        aria-live={playing ? "off" : "polite"}
        className="mt-5 min-h-[3.3rem] max-w-[58ch] font-mono text-[0.78rem] leading-snug"
      >
        {current ? (
          <>
            <span className="font-semibold">{current.node.label}.</span>{" "}
            <span className="opacity-80">{current.node.note}</span>
          </>
        ) : (
          <span className="opacity-60">{HINT}</span>
        )}
      </p>
    </div>
  );
}
