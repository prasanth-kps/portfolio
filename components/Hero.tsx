"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Magnetic from "@/components/Magnetic";
import ViewSwitch from "@/components/ViewSwitch";
import { useView } from "@/components/ViewProvider";
import { copy, type HeadlineWord } from "@/data/views";
import { layers, resumeFor, type Layer } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

function Headline({ lines }: { lines: HeadlineWord[][] }) {
  let n = 0;
  return (
    <h1 className="text-[clamp(2.6rem,6vw,5.9rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.map((w) => {
            const delay = 0.15 + n++ * 0.07;
            return (
              <Fragment key={w.text + n}>
                <span className="inline-block overflow-hidden pb-[0.14em] align-bottom">
                  <motion.span
                    className={`inline-block ${w.accent ? "text-accent" : ""}`}
                    initial={{ y: "115%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay, ease: EASE }}
                  >
                    {w.text}
                  </motion.span>
                </span>{" "}
              </Fragment>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

function Stack({ initial, list }: { initial: number; list: Layer[] }) {
  const [active, setActive] = useState(initial);
  const [tracing, setTracing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const layer = list[active];

  useEffect(() => () => clearTimeout(timer.current), []);

  // Any manual interaction cancels a running trace.
  const select = (i: number) => {
    clearTimeout(timer.current);
    setTracing(false);
    setActive(i);
  };

  // Walks a signal from the lowest layer up to the model, the way data actually travels.
  const trace = () => {
    if (tracing) return select(active);
    setTracing(true);
    let i = list.length - 1;
    const step = () => {
      setActive(i);
      if (i === 0) {
        timer.current = setTimeout(() => setTracing(false), 1200);
        return;
      }
      i -= 1;
      timer.current = setTimeout(step, 700);
    };
    step();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
    select(next);
    rows.current[next]?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
      className="border border-line bg-surface"
    >
      <div className="flex items-center justify-between border-b border-line pl-5">
        <p className="label">Layers I have worked across</p>
        <button
          type="button"
          onClick={trace}
          className="label h-11 border-l border-line px-4 !text-ink transition-colors duration-200 hover:bg-ink hover:!text-bg"
        >
          {tracing ? "Stop" : "Trace upward"}
        </button>
      </div>
      <ul onKeyDown={onKeyDown}>
        {list.map((l, i) => {
          const on = i === active;
          return (
            <li key={l.id} className="border-b border-line last:border-b-0">
              <button
                type="button"
                ref={(el) => {
                  rows.current[i] = el;
                }}
                aria-pressed={on}
                onMouseEnter={() => select(i)}
                onFocus={() => select(i)}
                onClick={() => select(i)}
                className="group relative flex h-[3.4rem] w-full items-center justify-between px-5 text-left"
              >
                <motion.span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1 origin-top bg-accent"
                  initial={false}
                  animate={{ scaleY: on ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                />
                <span
                  className={`font-display text-[1.7rem] font-semibold tracking-tight transition-[transform,color] duration-300 ${
                    on
                      ? "translate-x-2 text-ink"
                      : "text-muted group-hover:text-ink"
                  }`}
                >
                  {l.name}
                </span>
                <span className="label">{l.where}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div
        className="min-h-[7.2rem] border-t border-line bg-ink px-5 py-4 text-bg"
        aria-live="polite"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <p className="text-[0.95rem] leading-snug">{layer.detail}</p>
            <p className="mt-3 font-mono text-xs tracking-wide text-bg/60">
              {layer.tech}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const { view } = useView();
  const c = copy[view];
  const list = c.layers.map((id) => layers.find((l) => l.id === id)!);
  return (
    <section
      id="top"
      className="mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col justify-center px-5 pb-12 pt-24 md:px-10"
    >
      <motion.p
        key={`eyebrow-${view}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="label mb-6"
      >
        {c.eyebrow}
      </motion.p>

      <Headline key={`headline-${view}`} lines={c.headline} />

      <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
          className="flex flex-col gap-9 lg:col-span-5"
        >
          <p
            key={`sub-${view}`}
            className="max-w-[34ch] text-xl leading-snug text-muted md:text-[1.4rem]"
          >
            {c.sub}
          </p>
          <div className="flex flex-wrap gap-3">
            <Magnetic>
            <a
              href="#projects"
              className="inline-flex h-12 items-center bg-ink px-7 font-mono text-sm uppercase tracking-wider text-bg transition-[background-color,color,transform] duration-200 hover:bg-accent hover:text-[#14181a] active:translate-y-px"
            >
              Projects
            </a>
            </Magnetic>
            <Magnetic>
            <a
              href={resumeFor(view).href}
              title={`Open the ${resumeFor(view).name} resume`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center border border-ink px-7 font-mono text-sm uppercase tracking-wider transition-[background-color,color,transform] duration-200 hover:bg-ink hover:text-bg active:translate-y-px"
            >
              Resume
            </a>
            </Magnetic>
          </div>
          <div className="lg:hidden">
            <p className="label mb-2">View this site as</p>
            <ViewSwitch />
          </div>
        </motion.div>

        <div className="lg:col-span-7">
          <Stack key={`stack-${view}`} initial={c.defaultLayer} list={list} />
        </div>
      </div>
    </section>
  );
}
