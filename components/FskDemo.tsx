"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const W = 400;
const H = 120;
const SYMBOL_SECONDS = 0.22;

// One tone per character, 1.2 to 2.9 kHz. Same idea as NoFi's audible mode.
const freqOf = (ch: string) => 1200 + (ch.charCodeAt(0) % 18) * 100;

// Phase-continuous path: the visual cycle count follows the real tone.
function buildPath(text: string) {
  if (!text) return `M0,${H / 2} L${W},${H / 2}`;
  const segW = W / text.length;
  let phase = 0;
  let d = "";
  for (let x = 0; x <= W; x += 1) {
    const ch = text[Math.min(Math.floor(x / segW), text.length - 1)];
    const cycles = 2 + Math.round(((freqOf(ch) - 1200) / 1800) * 5);
    phase += (2 * Math.PI * cycles) / segW;
    d += `${x === 0 ? "M" : "L"}${x},${(H / 2 + Math.sin(phase) * 38).toFixed(1)} `;
  }
  return d.trim();
}

type AudioCtor = typeof AudioContext;

export default function FskDemo() {
  const [text, setText] = useState("NOFI");
  const [playing, setPlaying] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  const total = Math.max(text.length, 1) * SYMBOL_SECONDS;

  const play = () => {
    if (playing) {
      stopRef.current?.();
      return;
    }
    if (!text) return;
    const Ctx: AudioCtor | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
    if (!Ctx) return;

    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t0 = ctx.currentTime + 0.05;
    const end = t0 + text.length * SYMBOL_SECONDS;

    // A single oscillator that changes frequency per symbol keeps the phase continuous, as real FSK does.
    [...text].forEach((ch, i) => osc.frequency.setValueAtTime(freqOf(ch), t0 + i * SYMBOL_SECONDS));
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.06, t0 + 0.03);
    gain.gain.setValueAtTime(0.06, end - 0.04);
    gain.gain.linearRampToValueAtTime(0, end);
    osc.connect(gain).connect(ctx.destination);

    osc.onended = () => {
      setPlaying(false);
      stopRef.current = null;
      void ctx.close();
    };
    stopRef.current = () => {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
    };
    osc.start(t0);
    osc.stop(end + 0.05);
    setPlaying(true);
  };

  return (
    <div>
      <label htmlFor="fsk-text" className="label block">
        Type a message, hear it
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="fsk-text"
          name="fsk-text"
          value={text}
          maxLength={8}
          disabled={playing}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setText(e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, ""))}
          className="h-10 min-w-0 flex-1 border border-line bg-bg px-3 font-mono text-sm tracking-widest text-ink outline-offset-2 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={play}
          disabled={!text}
          aria-label={playing ? "Stop sound" : "Play sound"}
          className="label h-10 w-20 border border-ink !text-ink transition-[background-color,color,transform] duration-200 hover:bg-ink hover:!text-bg active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
        >
          {playing ? "Stop" : "Play"}
        </button>
      </div>

      <figure className="mt-5">
        <div className="relative overflow-hidden">
          <motion.div
            aria-hidden
            className="absolute inset-0 origin-left bg-accent/15"
            initial={false}
            animate={{ scaleX: playing ? 1 : 0 }}
            transition={playing ? { duration: total, ease: "linear" } : { duration: 0.2 }}
          />
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="relative h-28 w-full text-accent-text"
            role="img"
            aria-label={`Frequency-shift keyed waveform spelling ${text || "nothing"}`}
          >
            <path d={buildPath(text)} fill="none" stroke="currentColor" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <figcaption
          className="label mt-2 grid text-center"
          style={{ gridTemplateColumns: `repeat(${Math.max(text.length, 1)}, minmax(0, 1fr))` }}
        >
          {[...text].map((ch, i) => (
            <span key={i}>{ch === " " ? " " : ch}</span>
          ))}
        </figcaption>
        <p className="label mt-3 normal-case tracking-normal">
          Each character is its own tone. Sound plays quietly through your speakers.
        </p>
      </figure>
    </div>
  );
}
