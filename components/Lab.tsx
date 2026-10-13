"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import ZigbeeToy from "@/components/lab/ZigbeeToy";
import BudgetToy from "@/components/lab/BudgetToy";
import RamToy from "@/components/lab/RamToy";
import VectorToy from "@/components/lab/VectorToy";
import AllocatorToy from "@/components/lab/AllocatorToy";
import LinkGame from "@/components/lab/LinkGame";
import BudgetGame from "@/components/lab/BudgetGame";
import RamGame from "@/components/lab/RamGame";
import VectorGame from "@/components/lab/VectorGame";
import AllocatorGame from "@/components/lab/AllocatorGame";
import { useBest } from "@/lib/best";
import { useView } from "@/components/ViewProvider";
import { copy, type View } from "@/data/views";

const toys = [
  {
    id: "link",
    name: "Flaky radio link",
    where: "Enphase",
    title: "Send data over a link that drops packets",
    blurb:
      "Devices in a mesh talk over small radio frames. Cut the link quality and watch retries, acknowledgements and a bounded give-up keep the sender from buffering forever.",
    gameTitle: "Time your transmissions",
    gameBlurb:
      "The signal quality swings like a real radio. Transmit when it is strong. Every frame gets six tries, and the whole message gets twelve transmissions.",
    gameNote:
      "Simulation. The signal is generated and frames are 8 bytes here so the demo stays readable.",
    note: "Simulation. Frames are 8 bytes here so the demo stays readable.",
  },
  {
    id: "budget",
    name: "10 ms budget",
    where: "Visa",
    title: "Score a transaction inside 10 milliseconds",
    blurb:
      "Real-time fraud scoring has a hard latency budget. Toggle the design choices and see which ones fit and which ones blow it.",
    gameTitle: "Catch the most fraud inside 10 ms",
    gameBlurb:
      "Every design choice adds fraud coverage and latency. Pick the best set that still answers in time.",
    gameNote: "Illustrative timings and fraud coverage, not Visa measurements.",
    note: "Illustrative timings, not Visa measurements.",
  },
  {
    id: "ram",
    name: "RAM squeeze",
    where: "Enphase",
    title: "Take a device from 98% RAM to 82%",
    blurb:
      "A deployed fleet was one burst away from running out of memory. Apply the kinds of changes that gave the headroom back.",
    gameTitle: "Hold the line at 98% RAM",
    gameBlurb:
      "Overhead keeps creeping back and bursts of data need room. Free the orange blocks before memory runs out.",
    gameNote:
      "98% before and 82% after are real. The creeping overhead and the bursts are a simulation.",
    note: "98% before and 82% after are real. How the 16 points split across the four changes is illustrative.",
  },
  {
    id: "vector",
    name: "Vector search",
    where: "VecScale",
    title: "Shard a corpus, search it, merge the results",
    blurb:
      "Shard the corpus, search some shards, merge the local top-k into a global ranking, then score it against the exact answer. Move the query and trade recall for speed.",
    gameTitle: "Find the neighbors, scan as little as you can",
    gameBlurb:
      "For each query, choose how many shards to search. Find enough of the true neighbors, then score for every point you did not scan.",
    gameNote:
      "A 224-point 2D toy of the idea behind VecScale, my distributed vector search project.",
    note: "A 224-point 2D toy of the idea behind VecScale, my distributed vector search project.",
  },
  {
    id: "allocator",
    name: "Resource allocator",
    where: "Disaster Response",
    title: "Allocate scarce supplies when depots fail",
    blurb:
      "Higher-severity sites are served first from the nearest depot. Take a depot offline and watch the fallback reroute supplies.",
    gameTitle: "Triage three crises",
    gameBlurb:
      "Depots go down and supply runs short. Rank the sites in the order they should be supplied.",
    gameNote:
      "Sites, people and supplies are made up. Priority stands in for the score the CNN and TabNet pipeline predicts.",
    note: "Severity stands in for the priority score the CNN and TabNet pipeline predicts.",
  },
] as const;

type ToyId = (typeof toys)[number]["id"];

type Mode = "challenge" | "free";

function Toy({ id, mode }: { id: ToyId; mode: Mode }) {
  if (mode === "challenge") {
    switch (id) {
      case "link":
        return <LinkGame />;
      case "budget":
        return <BudgetGame />;
      case "ram":
        return <RamGame />;
      case "vector":
        return <VectorGame />;
      case "allocator":
        return <AllocatorGame />;
    }
  }
  switch (id) {
    case "link":
      return <ZigbeeToy />;
    case "budget":
      return <BudgetToy />;
    case "ram":
      return <RamToy />;
    case "vector":
      return <VectorToy />;
    case "allocator":
      return <AllocatorToy />;
  }
}

function BestTag({ id }: { id: ToyId }) {
  const best = useBest(id);
  return best === null ? null : (
    <span className="label mt-1 block text-accent-text">Played</span>
  );
}

export default function Lab() {
  const { view } = useView();
  // Remount per view so the first tab of the new order is selected.
  return <LabInner key={view} view={view} />;
}

function LabInner({ view }: { view: View }) {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<Mode>("challenge");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = copy[view].labOrder.map((id) => toys.find((t) => t.id === id)!);
  const toy = list[active];

  const onKeyDown = (e: React.KeyboardEvent) => {
    const fwd = e.key === "ArrowDown" || e.key === "ArrowRight";
    const back = e.key === "ArrowUp" || e.key === "ArrowLeft";
    if (!fwd && !back) return;
    e.preventDefault();
    const next = (active + (fwd ? 1 : -1) + list.length) % list.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="lab" className="border-t border-line">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32"
      >
        <h2 className="max-w-[16ch] text-[clamp(2.4rem,4.4vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]">
          Try the work
        </h2>
        <p className="mt-6 max-w-[48ch] text-muted">
          Five small games built from problems I have solved. Beat your best, or
          switch to free play and just poke at them.
        </p>

        <div className="mt-14 grid gap-px border border-line bg-line lg:grid-cols-12">
          <div
            role="tablist"
            aria-label="Interactive demos"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="flex overflow-x-auto bg-bg lg:col-span-3 lg:flex-col lg:overflow-visible"
          >
            {list.map((t, i) => {
              const on = i === active;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={on}
                  aria-controls="lab-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`group relative shrink-0 border-b border-line px-5 py-4 text-left transition-colors duration-200 last:border-b-0 lg:shrink lg:py-5 ${
                    on ? "bg-surface" : "hover:bg-surface/60"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute inset-y-0 left-0 w-1 origin-top bg-accent transition-transform duration-300 ${
                      on ? "scale-y-100" : "scale-y-0"
                    }`}
                  />
                  <span
                    className={`block whitespace-nowrap font-display text-xl font-semibold leading-tight tracking-tight transition-transform duration-300 lg:whitespace-normal ${
                      on ? "translate-x-1.5" : "text-muted group-hover:text-ink"
                    }`}
                  >
                    {t.name}
                  </span>
                  <span className="label mt-1 block">{t.where}</span>
                  <BestTag id={t.id} />
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id="lab-panel"
            aria-labelledby={`tab-${toy.id}`}
            className="bg-surface p-6 md:p-9 lg:col-span-9"
          >
            <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
              <h3 className="max-w-[26ch] text-[clamp(1.7rem,2.6vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
                {mode === "challenge" ? toy.gameTitle : toy.title}
              </h3>
              <div
                role="group"
                aria-label="Mode"
                className="flex shrink-0 border border-line"
              >
                {(["challenge", "free"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    onClick={() => setMode(m)}
                    className={`label h-9 px-4 transition-colors duration-200 ${
                      mode === m
                        ? "bg-ink !text-bg"
                        : "!text-ink hover:bg-sunken"
                    }`}
                  >
                    {m === "challenge" ? "Challenge" : "Free play"}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-4 max-w-[62ch] text-[0.98rem] leading-relaxed text-muted">
              {mode === "challenge" ? toy.gameBlurb : toy.blurb}
            </p>
            <div className="mt-9">
              <Toy key={`${toy.id}-${mode}`} id={toy.id} mode={mode} />
            </div>
            <p className="label mt-9 border-t border-line pt-4 normal-case tracking-normal">
              {mode === "challenge" ? toy.gameNote : toy.note}
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
