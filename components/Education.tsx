"use client";
import Reveal from "@/components/Reveal";
import { useView } from "@/components/ViewProvider";
import { education } from "@/data/site";

export default function Education() {
  const { view } = useView();

  return (
    <section id="education" className="border-t border-line">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <h2 className="max-w-[16ch] text-[clamp(2.4rem,4.4vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]">
          Where I studied
        </h2>

        <div key={view} className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-0">
          {education.map((e, i) => {
            const v = view === "general" ? undefined : e.views?.[view];
            const courses = v?.courses ?? e.courses;
            const extras = v?.extras ?? e.extras;
            return (
              <Reveal
                key={e.school}
                delay={i * 0.08}
                className="lg:border-l lg:border-line lg:px-10 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
              >
                <p className="label">{e.period}</p>
                <h3 className="mt-4 text-[clamp(1.9rem,3vw,2.7rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
                  {e.school}
                </h3>
                <p className="mt-3 text-lg">{e.degree}</p>
                <p className="text-muted">{e.field}</p>

                <p className="label mt-8">Coursework</p>
                <p className="mt-2 font-mono text-[0.82rem] leading-relaxed tracking-wide">{courses.join(" / ")}</p>

                {extras.length > 0 && (
                  <ul className="sq-list mt-7 space-y-2.5 text-[0.98rem] leading-relaxed text-muted">
                    {extras.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
