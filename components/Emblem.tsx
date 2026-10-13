"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { drawEmblem, EMBLEM_CAPTIONS, EMBLEM_H, EMBLEM_W, type EmblemScene } from "@/lib/sceneDrawers";

// The still frame shown for reduced motion and whenever the emblem is off screen.
const REST = 2.4;

// A small looping diagram of one job, drawn straight onto the page with softly faded edges.
// It only animates while it is on screen.
export default function Emblem({ scene, label }: { scene: EmblemScene; label: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = cv.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let start = 0;
    let visible = false;
    let scale = 1;
    let dpr = 1;

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      // A dark page gets light-on-dark shading. The page background is a hex color.
      const bg = cs.getPropertyValue("--bg").trim().replace("#", "");
      const lum = bg.length === 6 ? (parseInt(bg.slice(0, 2), 16) * 299 + parseInt(bg.slice(2, 4), 16) * 587 + parseInt(bg.slice(4, 6), 16) * 114) / 1000 : 255;
      return {
        ink: cs.getPropertyValue("--ink").trim() || "#888",
        accent: cs.getPropertyValue("--accent").trim() || "#d4501e",
        dark: lum < 128,
        bg: "#" + bg,
      };
    };
    let colors = readColors();

    const draw = (t: number) => {
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
      ctx.clearRect(0, 0, EMBLEM_W, EMBLEM_H);
      drawEmblem(ctx, scene, t, colors);
    };
    const rest = () => draw(REST);
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      scale = r.width / EMBLEM_W;
    };
    const loop = (now: number) => {
      if (!start) start = now;
      draw(REST + (now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    const refresh = () => {
      colors = readColors();
      if (!visible || reduced) rest();
    };

    fit();
    rest();

    const ro = new ResizeObserver(() => {
      fit();
      if (!visible || reduced) rest();
    });
    ro.observe(canvas);
    const mo = new MutationObserver(refresh);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", refresh);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible && !reduced) {
          start = 0;
          raf = requestAnimationFrame(loop);
        } else {
          rest();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
      mq.removeEventListener("change", refresh);
    };
  }, [scene, reduced]);

  // Feather every edge so the drawing dissolves into the page instead of ending at a box.
  const mask = "radial-gradient(ellipse 80% 84% at 50% 50%, #000 58%, transparent 100%)";

  return (
    <figure className="m-0">
      <canvas
        ref={cv}
        role="img"
        aria-label={label}
        className="block w-full"
        style={{ aspectRatio: `${EMBLEM_W} / ${EMBLEM_H}`, maskImage: mask, WebkitMaskImage: mask }}
      />
      <figcaption className="label mt-1">{EMBLEM_CAPTIONS[scene]}</figcaption>
    </figure>
  );
}
