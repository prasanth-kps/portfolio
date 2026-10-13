"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import FskDemo from "@/components/FskDemo";
import Pipeline from "@/components/Pipeline";
import type { Project } from "@/data/projects";

const tones: Record<string, { box: string; text: string; style?: React.CSSProperties }> = {
  aura: { box: "tone-invert bg-ink text-bg", text: "text-bg/75" },
  nofi: { box: "bg-surface", text: "text-muted" },
  "disaster-response": {
    box: "",
    text: "text-ink/75",
    style: { background: "color-mix(in oklab, var(--accent) 14%, var(--bg))" },
  },
  vecscale: { box: "dot-grid bg-bg", text: "text-muted" },
  rpm: { box: "bg-surface", text: "text-muted" },
  crawler: { box: "tone-invert bg-ink text-bg", text: "text-bg/75" },
};

export default function ProjectTile({ p, span, wide }: { p: Project; span: string; wide: boolean }) {
  const tone = tones[p.id];
  const spot = useRef<HTMLDivElement>(null);

  // Spotlight follows the mouse by moving a layer with transform. No React state, no re-render.
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || !spot.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    spot.current.style.transform = `translate3d(${e.clientX - r.left - 200}px, ${e.clientY - r.top - 200}px, 0)`;
  };

  return (
    <motion.article
      id={`project-${p.id}`}
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.45, layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
      onPointerMove={onMove}
      className={`group relative isolate flex flex-col overflow-hidden p-7 transition-[translate] duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 md:p-9 ${tone.box} ${span}`}
      style={tone.style}
    >
      <div
        ref={spot}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 -z-10 h-[400px] w-[400px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 26%, transparent) 0%, transparent 65%)" }}
      />

      <div className="flex items-start justify-between gap-4">
        <p className="label">{p.badge}</p>
        <p className="label flex gap-4">
          {p.github && (
            <a href={p.github} target="_blank" rel="noopener noreferrer" className="link-u hover:!text-current">
              Code ↗
            </a>
          )}
          {p.demo && (
            <a href={p.demo} target="_blank" rel="noopener noreferrer" className="link-u hover:!text-current">
              Live ↗
            </a>
          )}
        </p>
      </div>

      <h3 className="mt-10 text-[clamp(1.9rem,3vw,2.8rem)] font-semibold leading-[1] tracking-[-0.035em]">{p.title}</h3>
      <p className="label mt-3">{p.subtitle}</p>

      <div className="my-8 flex-1">{p.id === "nofi" ? <FskDemo /> : <Pipeline rows={p.flow} large={wide} invert={tone.box.includes("tone-invert")} />}</div>

      <p className={`max-w-[58ch] text-[0.98rem] leading-relaxed ${tone.text}`}>{p.description}</p>
      <p className="mt-6 font-mono text-xs leading-relaxed tracking-wide opacity-70">{p.tags.join(" / ")}</p>
    </motion.article>
  );
}
