"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import Emblem from "@/components/Emblem";
import Reveal from "@/components/Reveal";
import StageConnector from "@/components/StageConnector";
import { useView } from "@/components/ViewProvider";
import { bulletsFor, experiences, skillsFor } from "@/data/experience";
import { copy } from "@/data/views";
import type { EmblemScene } from "@/lib/sceneDrawers";

const EASE = [0.16, 1, 0.3, 1] as const;

// Each job has a small diagram of the work.
const EMBLEM: Record<string, EmblemScene> = {
  qualcomm: "chip",
  enphase: "solar",
  visa: "payments",
  oqlo: "cloud",
};

export default function Experience() {
  const { view } = useView();
  const c = copy[view];
  const list = c.experienceOrder.map((id) => experiences.find((e) => e.id === id)!);
  const track = useRef<HTMLDivElement>(null);
  // The line fills as the reader moves down the jobs.
  const { scrollYProgress } = useScroll({ target: track, offset: ["start 0.65", "end 0.55"] });

  // The job crossing the middle of the screen drives the sticky stage on the left.
  const [active, setActive] = useState(list[0].id);
  useEffect(() => {
    const els = copy[view].experienceOrder
      .map((id) => document.getElementById(`exp-${id}`))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setActive(en.target.id.replace("exp-", ""))),
      { rootMargin: "-40% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [view]);
  const shown = list.some((e) => e.id === active) ? active : list[0].id;
  const shownJob = list.find((e) => e.id === shown)!;

  return (
    <section id="experience" className="relative border-t border-line">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-24 md:px-10 md:py-32 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 className="text-[clamp(2.4rem,4.4vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]">
              Where I have shipped
            </h2>
            <p className="mt-6 max-w-[32ch] text-muted">{c.experienceBlurb}</p>

            {/* Stage: a frameless diagram of the job being read, swapping as you scroll. */}
            <div data-stage className="mt-10 hidden max-w-[400px] lg:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={shown}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <Emblem scene={EMBLEM[shown]} label={`Diagram of the work at ${shownJob.company}`} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div ref={track} className="relative lg:col-span-8">
          <span aria-hidden className="absolute bottom-0 top-0 hidden w-px bg-line md:block" style={{ left: "10.75rem" }} />
          <motion.span
            aria-hidden
            className="absolute bottom-0 top-0 hidden w-px origin-top bg-accent md:block"
            style={{ left: "10.75rem", scaleY: scrollYProgress }}
          />
          <AnimatePresence>
            {list.map((e, i) => (
              <Reveal
                as="article"
                layout
                exit
                id={`exp-${e.id}`}
                key={e.company}
                delay={i * 0.04}
                className="group grid gap-5 border-t border-line py-10 first:border-t-0 first:pt-0 md:grid-cols-[9.5rem_1fr] md:gap-10 lg:first:pt-2"
              >
                <div className="label relative md:pt-3 md:after:absolute md:after:-right-[1.65rem] md:after:top-[1.05rem] md:after:h-2 md:after:w-2 md:after:bg-ink">
                  <p data-date>{e.period}</p>
                  <p className="mt-1 opacity-70">{e.type}</p>
                </div>
                <div>
                  <h3 className="text-[clamp(2rem,3.6vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.035em] transition-colors duration-300 group-hover:text-accent-text">
                    {e.company}
                  </h3>
                  <p className="label mt-3">
                    {e.role}, {e.location}
                  </p>

                  {/* On small screens the diagram sits inline, since the sticky stage is hidden. */}
                  <div className="mt-6 max-w-[380px] lg:hidden">
                    <Emblem scene={EMBLEM[e.id]} label={`Diagram of the work at ${e.company}`} />
                  </div>

                  {/* Text swaps with a soft fade when the view changes. */}
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <ul className="sq-list mt-7 space-y-3.5 text-[1.02rem] leading-relaxed text-muted">
                      {bulletsFor(e, view).map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                    <p className="mt-7 font-mono text-xs leading-relaxed tracking-wide text-ink/70">
                      {skillsFor(e, view).join(" / ")}
                    </p>
                  </motion.div>
                </div>
              </Reveal>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <StageConnector activeId={shown} />
    </section>
  );
}
