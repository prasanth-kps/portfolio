"use client";
import Reveal from "@/components/Reveal";
import { useView } from "@/components/ViewProvider";
import { bulletsFor, experiences, skillsFor } from "@/data/experience";
import { copy } from "@/data/views";

export default function Experience() {
  const { view } = useView();
  const c = copy[view];
  const list = c.experienceOrder.map((id) => experiences.find((e) => e.id === id)!);

  return (
    <section id="experience" className="border-t border-line">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-24 md:px-10 md:py-32 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 className="text-[clamp(2.4rem,4.4vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]">
              Where I have shipped
            </h2>
            <p className="mt-6 max-w-[32ch] text-muted">{c.experienceBlurb}</p>
          </div>
        </div>

        <div key={view} className="lg:col-span-8">
          {list.map((e, i) => (
            <Reveal
              as="article"
              id={`exp-${e.id}`}
              key={e.company}
              delay={i * 0.04}
              className="group grid gap-5 border-t border-line py-10 first:border-t-0 first:pt-0 md:grid-cols-[9.5rem_1fr] md:gap-10 lg:first:pt-2"
            >
              <div className="label md:pt-3">
                <p>{e.period}</p>
                <p className="mt-1 opacity-70">{e.type}</p>
              </div>
              <div>
                <h3 className="text-[clamp(2rem,3.6vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.035em] transition-colors duration-300 group-hover:text-accent-text">
                  {e.company}
                </h3>
                <p className="label mt-3">
                  {e.role}, {e.location}
                </p>
                <ul className="sq-list mt-7 space-y-3.5 text-[1.02rem] leading-relaxed text-muted">
                  {bulletsFor(e, view).map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                <p className="mt-7 font-mono text-xs leading-relaxed tracking-wide text-ink/70">
                  {skillsFor(e, view).join(" / ")}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
