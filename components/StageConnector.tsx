"use client";
import { useCallback, useEffect, useRef } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";

const RETRACT = 0.22; // seconds for the old trace to draw back into the diagram
const GAP = 0.4; // seconds before the new trace starts drawing, so the diagram has swapped first
const DRAW = 0.65; // seconds for the new trace to draw out to the new date

const easeIn = (u: number) => u * u;
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);

// A thin trace from the sticky diagram, down the gutter between the columns, to the date of the
// job being read. It follows the page as you scroll. When the active job changes, the old trace
// draws back into the diagram and a new one draws out to the new date, with a dot riding its tip.
// Drawn straight onto the DOM, so scrolling never re-renders React.
export default function StageConnector({ activeId }: { activeId: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const dotA = useRef<SVGCircleElement>(null);
  const dotB = useRef<SVGCircleElement>(null);
  const progress = useRef(1); // how much of the trace is drawn, 0 to 1
  const retracting = useRef(false);
  const frozen = useRef(""); // the old trace's path while it draws back
  const lastD = useRef("");
  const raf = useRef(0);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  const geometry = useCallback(() => {
    const sec = document.getElementById("experience")?.getBoundingClientRect();
    const st = document.querySelector("[data-stage]")?.getBoundingClientRect();
    const date = document.querySelector(`#exp-${activeId} [data-date]`)?.getBoundingClientRect();
    if (!sec || !st || !date || st.width === 0) return null;
    const onScreen = date.top > 80 && date.bottom < window.innerHeight - 24 && st.bottom > 0 && st.top < window.innerHeight;
    return {
      ax: st.right - sec.left - 14,
      ay: st.top - sec.top + st.height * 0.46,
      cx: st.right - sec.left + 32,
      tx: date.left - sec.left - 12,
      ty: date.top - sec.top + date.height / 2,
      onScreen,
    };
  }, [activeId]);

  const render = useCallback(() => {
    const g = geometry();
    const el = svg.current;
    const p = path.current;
    if (!el || !p) return;
    if (!g) {
      el.style.opacity = "0";
      return;
    }
    const dy = g.ty - g.ay;
    const r = Math.min(8, Math.abs(dy) / 2);
    const s = Math.sign(dy) || 1;
    const live =
      Math.abs(dy) < 1
        ? `M${g.ax},${g.ay} H${g.tx}`
        : `M${g.ax},${g.ay} H${g.cx - r} Q${g.cx},${g.ay} ${g.cx},${g.ay + s * r} V${g.ty - s * r} Q${g.cx},${g.ty} ${g.cx + r},${g.ty} H${g.tx}`;
    lastD.current = live;

    p.setAttribute("d", retracting.current && frozen.current ? frozen.current : live);
    const len = p.getTotalLength();
    const shown = len * progress.current;
    p.style.strokeDasharray = `${shown} ${len + 2}`;
    const tip = p.getPointAtLength(shown);
    dotA.current?.setAttribute("cx", String(g.ax));
    dotA.current?.setAttribute("cy", String(g.ay));
    dotB.current?.setAttribute("cx", String(tip.x));
    dotB.current?.setAttribute("cy", String(tip.y));
    dotB.current?.setAttribute("opacity", progress.current > 0.02 ? "1" : "0");
    el.style.opacity = g.onScreen ? "1" : "0";
  }, [geometry]);

  // On a job change: retract the old trace, pause while the diagram swaps, then draw the new one.
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    if (reduced) {
      retracting.current = false;
      progress.current = 1;
      render();
      return;
    }
    const first = lastD.current === "";
    frozen.current = lastD.current;
    const t0 = performance.now();
    function tick(now: number) {
      const t = (now - t0) / 1000;
      if (!first && t < RETRACT) {
        retracting.current = true;
        progress.current = 1 - easeIn(t / RETRACT);
      } else if (t < GAP) {
        retracting.current = false;
        progress.current = 0;
      } else {
        retracting.current = false;
        progress.current = easeOut(Math.min(1, (t - GAP) / DRAW));
      }
      render();
      if (t < GAP + DRAW) raf.current = requestAnimationFrame(tick);
    }
    // Hold the old trace exactly as it was until its retract begins, so there is no one-frame jump.
    retracting.current = !first;
    progress.current = first ? 0 : 1;
    render();
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [activeId, reduced, render]);

  useMotionValueEvent(scrollY, "change", render);
  useEffect(() => {
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [render]);

  return (
    <svg
      ref={svg}
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible text-accent opacity-0 transition-opacity duration-300 lg:block"
    >
      <path ref={path} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <circle ref={dotA} r="2.6" fill="currentColor" />
      <circle ref={dotB} r="2.6" fill="currentColor" opacity="0" />
    </svg>
  );
}
