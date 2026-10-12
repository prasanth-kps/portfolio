"use client";
import { useRef, useState } from "react";
import ZigbeeToy from "@/components/lab/ZigbeeToy";
import BudgetToy from "@/components/lab/BudgetToy";
import RamToy from "@/components/lab/RamToy";
import VectorToy from "@/components/lab/VectorToy";
import AllocatorToy from "@/components/lab/AllocatorToy";
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
    note: "Simulation. Frames are 8 bytes here so the demo stays readable.",
  },
  {
    id: "budget",
    name: "10 ms budget",
    where: "Visa",
    title: "Score a transaction inside 10 milliseconds",
    blurb:
      "Real-time fraud scoring has a hard latency budget. Toggle the design choices and see which ones fit and which ones blow it.",
    note: "Illustrative timings, not Visa measurements.",
  },
  {
    id: "ram",
    name: "RAM squeeze",
    where: "Enphase",
    title: "Take a device from 98% RAM to 82%",
    blurb:
      "A deployed fleet was one burst away from running out of memory. Apply the kinds of changes that gave the headroom back.",
    note: "98% before and 82% after are real. How the 16 points split across the four changes is illustrative.",
  },
  {
    id: "vector",
    name: "Vector search",
    where: "VecScale",
    title: "Shard a corpus, search it, merge the results",
    blurb:
      "Shard the corpus, search some shards, merge the local top-k into a global ranking, then score it against the exact answer. Move the query and trade recall for speed.",
    note: "A 224-point 2D toy of the idea behind VecScale, my distributed vector search project.",
  },
  {
    id: "allocator",
    name: "Resource allocator",
    where: "Disaster Response",
    title: "Allocate scarce supplies when depots fail",
    blurb:
      "Higher-severity sites are served first from the nearest depot. Take a depot offline and watch the fallback reroute supplies.",
    note: "Severity stands in for the priority score the CNN and TabNet pipeline predicts.",
  },
] as const;

type ToyId = (typeof toys)[number]["id"];

function Toy({ id }: { id: ToyId }) {
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

export default function Lab() {
  const { view } = useView();
  // Remount per view so the first tab of the new order is selected.
  return <LabInner key={view} view={view} />;
}

function LabInner({ view }: { view: View }) {
  const [active, setActive] = useState(0);
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
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <h2 className="max-w-[16ch] text-[clamp(2.4rem,4.4vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]">
          Try the work
        </h2>
        <p className="mt-6 max-w-[48ch] text-muted">
          Five small working models of problems I have solved. Poke them.
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
            <h3 className="max-w-[26ch] text-[clamp(1.7rem,2.6vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
              {toy.title}
            </h3>
            <p className="mt-4 max-w-[62ch] text-[0.98rem] leading-relaxed text-muted">{toy.blurb}</p>
            <div className="mt-9">
              <Toy key={toy.id} id={toy.id} />
            </div>
            <p className="label mt-9 border-t border-line pt-4 normal-case tracking-normal">{toy.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
