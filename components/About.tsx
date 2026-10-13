"use client";
import { useMemo, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Reveal from "@/components/Reveal";
import { useView } from "@/components/ViewProvider";
import { copy } from "@/data/views";

interface W {
  t: string;
  accent?: boolean;
}

// "[like this]" marks accent words. Words light up as you read down the page.
function parse(text: string): W[] {
  const out: W[] = [];
  for (const m of text.matchAll(/\[([^\]]+)\]|(\S+)/g)) {
    if (m[1]) m[1].split(/\s+/).forEach((t) => out.push({ t, accent: true }));
    else out.push({ t: m[2] });
  }
  return out;
}

function Word({ w, i, count, progress, still }: { w: W; i: number; count: number; progress: MotionValue<number>; still: boolean }) {
  const start = i / count;
  const opacity = useTransform(progress, [start, Math.min(start + 0.08, 1)], [0.18, 1]);
  return (
    <motion.span style={{ opacity: still ? 1 : opacity }} className={w.accent ? "text-accent-text" : ""}>
      {w.t}{" "}
    </motion.span>
  );
}

export default function About() {
  const { view } = useView();
  const c = copy[view];
  const words = useMemo(() => parse(c.about), [c.about]);
  const ref = useRef<HTMLParagraphElement>(null);
  const still = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });

  return (
    <section id="about" className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
      <motion.p
        ref={ref}
        key={view}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-[24ch] font-display text-[clamp(2rem,4.6vw,4.4rem)] font-medium leading-[1.12] tracking-[-0.035em] md:max-w-[28ch]"
      >
        {words.map((w, i) => (
          <Word key={i} w={w} i={i} count={words.length} progress={scrollYProgress} still={still} />
        ))}
      </motion.p>

      <dl key={`facts-${view}`} className="mt-20 grid gap-10 border-t border-line pt-10 md:grid-cols-3 md:gap-0">
        {c.facts.map((f, i) => (
          <Reveal key={f.figure} delay={i * 0.08} className="md:border-l md:border-line md:px-8 md:first:border-l-0 md:first:pl-0">
            <dt className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{f.figure}</dt>
            <dd className="mt-3 max-w-[26ch] text-[0.95rem] leading-snug text-muted">{f.text}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
