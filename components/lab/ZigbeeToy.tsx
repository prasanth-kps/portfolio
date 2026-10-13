"use client";
import { useEffect, useReducer, useState } from "react";
import { Btn, Slider } from "./ui";

const FRAME_BYTES = 8;
const MAX_TRIES = 6;
const TICK_MS = 110;
const DEFAULT_TEXT = "battery 3.7V, grid 238V, inverter online, temp 41C";

type Status = "pending" | "retry" | "done" | "failed";
interface Frame {
  chunk: string;
  status: Status;
  tries: number;
}
interface State {
  frames: Frame[];
  cursor: number;
  attempts: number;
  running: boolean;
}
type Action =
  | { type: "start"; chunks: string[] }
  | { type: "tick"; ok: boolean }
  | { type: "stop" }
  | { type: "reset" };

const initial: State = { frames: [], cursor: 0, attempts: 0, running: false };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "start":
      return {
        frames: a.chunks.map((chunk) => ({
          chunk,
          status: "pending",
          tries: 0,
        })),
        cursor: 0,
        attempts: 0,
        running: a.chunks.length > 0,
      };
    case "stop":
      return { ...s, running: false };
    case "reset":
      return initial;
    case "tick": {
      if (!s.running) return s;
      const frames = s.frames.slice();
      const f = frames[s.cursor];
      const tries = f.tries + 1;
      let status: Status = "retry";
      let cursor = s.cursor;
      if (a.ok) {
        status = "done";
        cursor += 1;
      } else if (tries >= MAX_TRIES) {
        status = "failed";
        cursor += 1;
      }
      frames[s.cursor] = { ...f, tries, status };
      return {
        frames,
        cursor,
        attempts: s.attempts + 1,
        running: cursor < frames.length,
      };
    }
  }
}

const split = (msg: string) => {
  const out: string[] = [];
  for (let i = 0; i < msg.length; i += FRAME_BYTES)
    out.push(msg.slice(i, i + FRAME_BYTES));
  return out;
};

const cellStyle: Record<Status | "sending", string> = {
  pending: "border-line text-muted",
  sending: "border-accent bg-accent/15 text-ink",
  retry: "border-accent bg-accent/10 text-accent-text",
  done: "border-ink bg-ink text-bg",
  failed: "border-dashed border-accent text-accent-text",
};

export default function ZigbeeToy() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [quality, setQuality] = useState(65);
  const [s, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    if (!s.running) return;
    const id = setInterval(
      () => dispatch({ type: "tick", ok: Math.random() < quality / 100 }),
      TICK_MS,
    );
    return () => clearInterval(id);
  }, [s.running, quality]);

  const started = s.frames.length > 0;
  const view: Frame[] = started
    ? s.frames
    : split(text).map((chunk) => ({ chunk, status: "pending", tries: 0 }));
  const finished = started && !s.running && s.cursor >= s.frames.length;
  const delivered = view.filter((f) => f.status === "done").length;
  const failedAt = view.findIndex((f) => f.status === "failed");
  const received = view
    .map((f) => (f.status === "done" ? f.chunk : "░".repeat(f.chunk.length)))
    .join("");

  let status =
    "Type a message. It gets cut into frames small enough for the radio.";
  if (s.running) status = `Sending frame ${s.cursor + 1} of ${view.length}…`;
  if (finished && failedAt === -1)
    status = `Delivered all ${view.length} frames in ${s.attempts} transmissions.`;
  if (finished && failedAt !== -1)
    status = `Frame ${failedAt + 1} was dropped after ${MAX_TRIES} tries. The sender gives up instead of buffering forever.`;

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,17rem)_1fr]">
      <div className="space-y-6">
        <div>
          <label htmlFor="zb-text" className="label block">
            Telemetry message
          </label>
          <textarea
            id="zb-text"
            name="zb-text"
            rows={3}
            maxLength={96}
            value={text}
            disabled={s.running}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => {
              setText(e.target.value.replace(/[^\x20-\x7E]/g, ""));
              if (started) dispatch({ type: "reset" });
            }}
            className="mt-2 w-full resize-none border border-line bg-bg p-3 font-mono text-sm leading-relaxed text-ink disabled:opacity-60"
          />
        </div>
        <Slider
          id="zb-quality"
          label="Link quality"
          value={quality}
          min={10}
          max={100}
          step={5}
          readout={`${quality}%`}
          onChange={setQuality}
        />
        <div className="flex gap-2">
          {s.running ? (
            <Btn onClick={() => dispatch({ type: "stop" })} variant="line">
              Stop
            </Btn>
          ) : (
            <Btn
              onClick={() => dispatch({ type: "start", chunks: split(text) })}
              disabled={!text}
            >
              {finished ? "Send again" : "Send"}
            </Btn>
          )}
          {started && !s.running && (
            <Btn onClick={() => dispatch({ type: "reset" })} variant="line">
              Reset
            </Btn>
          )}
        </div>
      </div>

      <div>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(5.2rem,1fr))] gap-2">
          {view.map((f, i) => {
            const sending = s.running && i === s.cursor;
            const key: Status | "sending" = sending ? "sending" : f.status;
            return (
              <li
                key={i}
                className={`flex h-[4.4rem] flex-col justify-between border px-2 py-1.5 transition-colors duration-150 ${cellStyle[key]}`}
              >
                <span className="flex justify-between font-mono text-[0.65rem] uppercase tracking-wider opacity-70">
                  <span>#{i + 1}</span>
                  <span>{f.tries > 0 ? `x${f.tries}` : ""}</span>
                </span>
                <span className="truncate font-mono text-sm">
                  {f.chunk.replace(/ /g, " ")}
                </span>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider opacity-70">
                  {f.status === "done"
                    ? "acked"
                    : f.status === "failed"
                      ? "dropped"
                      : f.status === "retry"
                        ? "retry"
                        : sending
                          ? "tx"
                          : "queued"}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border border-line bg-bg p-4">
          <p className="label">Receiver has</p>
          <p className="mt-2 whitespace-pre-wrap break-all font-mono text-[0.95rem] leading-relaxed">
            {received}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <p
            aria-live="polite"
            className="max-w-[52ch] text-[0.95rem] leading-snug"
          >
            {status}
          </p>
          <p className="label tabular-nums">
            {delivered}/{view.length} frames, {s.attempts} tx
            {started && s.attempts > 0
              ? `, ${(s.attempts / Math.max(delivered, 1)).toFixed(1)} tx per frame`
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
