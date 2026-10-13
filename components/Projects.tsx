"use client";
import { AnimatePresence } from "framer-motion";
import Reveal from "@/components/Reveal";
import ProjectTile from "@/components/ProjectTile";
import { useView } from "@/components/ViewProvider";
import { projectFor, projects } from "@/data/projects";
import { copy } from "@/data/views";

// Bento rhythm by position: one wide tile, one narrow, then pairs of equal tiles.
const SPANS = [
  "lg:col-span-4",
  "lg:col-span-2",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-3",
];

export default function Projects() {
  const { view } = useView();
  const list = copy[view].projectOrder.map((id) => projectFor(projects.find((p) => p.id === id)!, view));

  return (
    <section id="projects" className="border-t border-line">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <h2 className="max-w-[16ch] text-[clamp(2.4rem,4.4vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]">
          Things I have built
        </h2>

        <Reveal className="mt-14 grid gap-px border border-line bg-line lg:grid-cols-6">
          <AnimatePresence>
            {list.map((p, i) => (
              <ProjectTile key={p.id} p={p} span={SPANS[i]} wide={i === 0} />
            ))}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
