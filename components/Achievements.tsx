"use client";
import Reveal from "@/components/Reveal";
import { useView } from "@/components/ViewProvider";
import { achievements } from "@/data/site";
import { copy } from "@/data/views";

export default function Achievements() {
  const { view } = useView();
  const list = copy[view].achievements.map((id) => achievements.find((a) => a.id === id)!);

  return (
    <section id="achievements" className="border-t border-line bg-sunken">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <h2 className="max-w-[16ch] text-[clamp(2.4rem,4.4vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]">
          Ranks &amp; recognition
        </h2>

        <dl
          key={view}
          className={`mt-14 grid gap-12 sm:grid-cols-2 lg:gap-0 ${list.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}
        >
          {list.map((a, i) => (
            <Reveal
              key={a.title}
              delay={i * 0.07}
              className="lg:border-l lg:border-line lg:px-8 lg:first:border-l-0 lg:first:pl-0"
            >
              <dd className="font-display text-[clamp(3.2rem,5.4vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-accent-text [font-variant-numeric:tabular-nums]">
                {a.figure}
              </dd>
              <dt className="mt-5 text-lg font-semibold">{a.title}</dt>
              <dd className="mt-2 max-w-[28ch] text-[0.95rem] leading-snug text-muted">{a.note}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
