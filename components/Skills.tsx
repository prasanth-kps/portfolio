"use client";
import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Reveal from "@/components/Reveal";
import { skillCategories } from "@/data/skills";
import { useView } from "@/components/ViewProvider";
import Constellation from "@/components/Constellation";
import { copy } from "@/data/views";
import { mentions, sourcesFor } from "@/lib/skillMatch";

interface Place {
  label: string;
  href: string;
}

export default function Skills() {
  // Hover, focus and tap all select a skill. It stays selected until cleared or another is picked,
  // so the links in the bar are reachable after the pointer leaves the skill.
  const [active, setActive] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "map">("list");
  const { view } = useView();

  const ordered = copy[view].skillOrder.map((name) =>
    skillCategories.find((c) => c.category === name)!,
  );

  const places = useMemo<Place[]>(
    () =>
      active ? sourcesFor(view).filter((s) => mentions(s.text, active)) : [],
    [active, view],
  );

  return (
    <section id="skills" className="border-t border-line bg-surface">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-[14ch] text-[clamp(2.4rem,4.4vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]">
            What I work with
          </h2>
          <div
            role="group"
            aria-label="Skills layout"
            className="hidden border border-line sm:inline-flex"
          >
            {(["list", "map"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={`label h-9 px-4 transition-colors duration-200 ${
                  mode === m ? "bg-ink !text-bg" : "hover:!text-ink"
                }`}
              >
                {m === "map" ? "Constellation" : "List"}
              </button>
            ))}
          </div>
        </div>

        {mode === "map" ? (
          <div className="hidden sm:block">
            <Constellation key={view} view={view} />
          </div>
        ) : (
          <>
            <div
              className={`mt-14 grid gap-px border border-line bg-line md:grid-cols-2 ${ordered.length % 3 === 0 ? "lg:grid-cols-3" : ""}`}
            >
              <AnimatePresence>
                {ordered.map((c, i) => (
                  <Reveal
                    key={c.category}
                    layout
                    exit
                    delay={i * 0.05}
                    className={`bg-surface p-7 md:p-8 ${ordered.length % 3 !== 0 && ordered.length % 2 === 1 && i === ordered.length - 1 ? "md:col-span-2" : ""}`}
                  >
                    <h3 className="text-2xl font-semibold tracking-[-0.03em]">
                      {c.category}
                    </h3>
                    <p className="mt-2 text-[0.95rem] leading-snug text-muted">
                      {c.note}
                    </p>
                    <ul className="mt-5 -mx-1.5 flex flex-wrap gap-y-0.5 font-mono text-[0.82rem] tracking-wide">
                      {c.skills
                        .filter(
                          (s) =>
                            view === "general" || !c.hide?.[view]?.includes(s),
                        )
                        .map((s) => {
                          const on = active === s;
                          return (
                            <li key={s}>
                              <button
                                type="button"
                                aria-pressed={on}
                                onPointerEnter={(e) =>
                                  e.pointerType === "mouse" && setActive(s)
                                }
                                onFocus={() => setActive(s)}
                                onClick={() => setActive(s)}
                                className={`px-1.5 py-1 transition-[background-color,color] duration-150 ${
                                  on
                                    ? "bg-ink text-bg"
                                    : "hover:text-accent-text"
                                }`}
                              >
                                {s}
                              </button>
                            </li>
                          );
                        })}
                    </ul>
                  </Reveal>
                ))}
              </AnimatePresence>
            </div>

            <div
              aria-live="polite"
              className="sticky bottom-4 mt-6 flex min-h-14 flex-wrap items-center gap-x-5 gap-y-2 bg-ink px-5 py-3 text-bg"
            >
              {!active ? (
                <p className="label !text-bg/70">
                  Hover or tap any skill to see where I used it.
                </p>
              ) : (
                <>
                  <p className="font-mono text-sm">{active}</p>
                  {places.length ? (
                    <>
                      <p className="label !text-bg/60">used in</p>
                      <ul className="flex flex-wrap gap-x-5 gap-y-1">
                        {places.map((p) => (
                          <li key={p.href}>
                            <a
                              href={p.href}
                              className="link-u font-display text-lg font-semibold tracking-tight"
                            >
                              {p.label} ↑
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="label !text-bg/60">
                      not tied to a featured project
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setActive(null)}
                    className="label ml-auto !text-bg/80 hover:!text-bg"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
