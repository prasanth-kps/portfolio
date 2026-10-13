"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import ViewSwitch from "@/components/ViewSwitch";
import { useView } from "@/components/ViewProvider";
import { resumeFor } from "@/data/site";

const links = [
  { label: "About", id: "about" },
  { label: "Experience", id: "experience" },
  { label: "Projects", id: "projects" },
  { label: "Lab", id: "lab" },
  { label: "Skills", id: "skills" },
  { label: "Contact", id: "contact" },
];

export default function Navbar() {
  const { view } = useView();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const sentinel = useRef<HTMLDivElement>(null);

  // Reading progress. Spring keeps the bar from jittering on trackpads.
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  // Border appears once the page leaves the top. IntersectionObserver, no scroll listener.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Highlight the section currently crossing the middle of the viewport.
  useEffect(() => {
    const targets = links.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} aria-hidden className="absolute left-0 top-0 h-8 w-px" />
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b bg-bg/90 backdrop-blur-sm transition-colors duration-300 ${
          stuck || open ? "border-line" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-10">
          <a href="#top" className="whitespace-nowrap font-display text-lg font-semibold tracking-tight" translate="no">
            Prasanth Kasa
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                aria-current={active === l.id ? "true" : undefined}
                className={`label px-3 py-2 transition-colors duration-200 hover:text-ink ${
                  active === l.id ? "!text-ink" : ""
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Open command menu"
              onClick={() => window.dispatchEvent(new Event("open-command"))}
              className="label hidden h-9 items-center border border-line px-3 transition-colors duration-200 hover:border-ink hover:!text-ink xl:inline-flex"
            >
              ⌘K
            </button>
            <ViewSwitch className="hidden lg:inline-flex" />
            <ThemeToggle />
            <a
              href={resumeFor(view).href}
              title={`Open the ${resumeFor(view).name} resume`}
              target="_blank"
              rel="noopener noreferrer"
              className="label hidden h-9 items-center bg-ink px-4 !text-bg transition-colors duration-200 hover:bg-accent hover:!text-[#14181a] active:translate-y-px xl:inline-flex"
            >
              Resume
            </a>
            <button
              type="button"
              className="label inline-flex h-9 items-center border border-line px-3 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {open && (
          <nav id="mobile-menu" aria-label="Mobile" className="border-t border-line bg-bg px-5 pb-6 pt-4 lg:hidden">
            <ViewSwitch className="mb-2 inline-flex" />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new Event("open-command"));
              }}
              className="block w-full border-b border-line py-4 text-left font-display text-2xl font-semibold tracking-tight"
            >
              Search
            </button>
            {[...links, { label: "Resume", id: "" }].map((l) => (
              <a
                key={l.label}
                href={l.id ? `#${l.id}` : resumeFor(view).href}
                onClick={() => setOpen(false)}
                className="block border-b border-line py-4 font-display text-2xl font-semibold tracking-tight"
              >
                {l.label}
              </a>
            ))}
          </nav>
        )}

        <motion.div
          aria-hidden
          style={{ scaleX: progress }}
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent"
        />
      </header>
    </>
  );
}
