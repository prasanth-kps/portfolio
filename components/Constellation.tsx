"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";
import { mentions, sourcesFor, visibleSkills } from "@/lib/skillMatch";
import type { View } from "@/data/views";
import {
  createSim,
  FORCES,
  stepSim,
  type Sim,
  type Tpl,
} from "@/lib/forceLayout";

// Jobs and projects are the hubs. Skills orbit the hubs they were used in.
export default function Constellation({ view }: { view: View }) {
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const sim = useRef<Sim | null>(null);
  const nodeEls = useRef<(SVGGElement | null)[]>([]);
  const edgeEls = useRef<(SVGLineElement | null)[]>([]);
  const size = useRef({ w: 0, h: 0 });
  const drag = useRef<{
    i: number;
    pid: number;
    sx: number;
    sy: number;
    moved: boolean;
  } | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);

  const graph = useMemo(() => {
    const sources = sourcesFor(view);
    const nodes: Tpl[] = sources.map((s) => ({
      id: s.id,
      kind: "hub",
      hubKind: s.kind,
      label: s.short,
      href: s.href,
      w: s.short.length * 8.6 + 30,
      h: 30,
      mass: 3.2,
    }));
    const edges: [number, number][] = [];
    for (const skill of visibleSkills(view)) {
      const hubs = sources
        .map((s, i) => (mentions(s.text, skill) ? i : -1))
        .filter((i) => i >= 0);
      if (!hubs.length) continue; // skills with no featured project live in the List layout
      const idx = nodes.length;
      // Skills used in several places are ringed dots, collected in a column between jobs and projects.
      const shared = hubs.length > 1;
      const w = skill.length * 6.4 + 12;
      nodes.push({
        id: skill,
        kind: "skill",
        label: skill,
        w,
        h: 30,
        mass: 1,
        shared,
      });
      hubs.forEach((h) => edges.push([h, idx]));
    }
    const adj: Set<number>[] = nodes.map(() => new Set<number>());
    edges.forEach(([a, b]) => {
      adj[a].add(b);
      adj[b].add(a);
    });
    return { nodes, edges, adj, hubCount: sources.length };
  }, [view]);

  const apply = useCallback(() => {
    const s = sim.current;
    if (!s) return;
    graph.nodes.forEach((_, i) =>
      nodeEls.current[i]?.setAttribute(
        "transform",
        `translate(${s.x[i].toFixed(1)},${s.y[i].toFixed(1)})`,
      ),
    );
    graph.edges.forEach(([a, b], k) => {
      const el = edgeEls.current[k];
      if (!el) return;
      el.setAttribute("x1", s.x[a].toFixed(1));
      el.setAttribute("y1", s.y[a].toFixed(1));
      el.setAttribute("x2", s.x[b].toFixed(1));
      el.setAttribute("y2", s.y[b].toFixed(1));
    });
  }, [graph]);

  const step = useCallback(() => {
    const s = sim.current;
    if (!s) return;
    stepSim(
      s,
      graph.nodes,
      graph.edges,
      graph.hubCount,
      size.current.w,
      size.current.h,
    );
  }, [graph]);

  // The frame callback lives in a ref so it can schedule itself.
  const frame = useRef<() => void>(() => {});
  useEffect(() => {
    frame.current = () => {
      const s = sim.current;
      if (!s) return;
      step();
      apply();
      s.alpha *= FORCES.decay;
      s.raf =
        s.alpha > 0.015 || s.dragging
          ? requestAnimationFrame(() => frame.current())
          : 0;
    };
  }, [step, apply]);

  const kick = useCallback((alpha: number) => {
    const s = sim.current;
    if (!s) return;
    s.alpha = Math.max(s.alpha, alpha);
    if (!s.raf) s.raf = requestAnimationFrame(() => frame.current());
  }, []);

  // Measure the container.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setDims({ w: el.clientWidth, h: el.clientHeight }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build the simulation once there is a size. Hubs start on a ring, skills near their hubs.
  useLayoutEffect(() => {
    if (!dims.w) return;
    const prev = size.current;
    size.current = dims;
    const existing = sim.current;
    if (existing && prev.w) {
      // Resize: scale positions so nothing ends up outside.
      for (let i = 0; i < existing.x.length; i += 1) {
        existing.x[i] *= dims.w / prev.w;
        existing.y[i] *= dims.h / prev.h;
        existing.ax[i] *= dims.w / prev.w;
        existing.ay[i] *= dims.h / prev.h;
      }
      apply();
      return;
    }
    const s = createSim(graph.nodes, graph.adj, graph.hubCount, dims.w, dims.h);
    sim.current = s;
    if (reduced) {
      // No settling animation: lay it out instantly.
      s.alpha = 1;
      for (let t = 0; t < 420; t += 1) {
        step();
        s.alpha *= FORCES.decay;
      }
      s.alpha = 0;
    }
    apply();
  }, [dims, graph, reduced, step, apply]);

  // Let it settle when it first scrolls into view, so the arrival is visible.
  useEffect(() => {
    const el = wrap.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          kick(1);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [kick, reduced]);

  useEffect(
    () => () => {
      const s = sim.current;
      if (s?.raf) cancelAnimationFrame(s.raf);
    },
    [],
  );

  // Shared skills draw last so their labels sit above everything else when shown.
  const drawOrder = useMemo(
    () =>
      graph.nodes
        .map((_, i) => i)
        .sort(
          (a, b) =>
            Number(!!graph.nodes[a].shared) - Number(!!graph.nodes[b].shared),
        ),
    [graph],
  );

  const focus = hover ?? pinned;
  const near = useMemo(
    () => (focus === null ? null : new Set([focus, ...graph.adj[focus]])),
    [focus, graph],
  );

  const toLocal = (e: React.PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent<SVGGElement>, i: number) => {
    const s = sim.current;
    if (!s) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      i,
      pid: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      moved: false,
    };
    s.fixed[i] = true;
    s.dragging = true;
  };
  const move = (e: React.PointerEvent<SVGGElement>) => {
    const d = drag.current;
    const s = sim.current;
    if (!d || !s || d.pid !== e.pointerId) return;
    if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 4) d.moved = true;
    const p = toLocal(e);
    s.x[d.i] = Math.min(size.current.w - 10, Math.max(10, p.x));
    s.y[d.i] = Math.min(size.current.h - 10, Math.max(10, p.y));
    kick(0.35);
  };
  const up = (e: React.PointerEvent<SVGGElement>) => {
    const d = drag.current;
    const s = sim.current;
    if (!d || !s || d.pid !== e.pointerId) return;
    s.fixed[d.i] = false;
    s.dragging = false;
    if (!d.moved) setPinned((p) => (p === d.i ? null : d.i));
    drag.current = null;
    kick(0.2);
  };

  const info = useMemo(() => {
    if (focus === null) return null;
    const n = graph.nodes[focus];
    const links = [...graph.adj[focus]].map((i) => graph.nodes[i]);
    return { n, links };
  }, [focus, graph]);

  return (
    <div className="mt-14">
      <div
        ref={wrap}
        className="relative h-[30rem] touch-pan-y overflow-hidden border border-line bg-bg md:h-[38rem]"
      >
        <svg
          ref={svg}
          width="100%"
          height="100%"
          viewBox={`0 0 ${dims.w || 1} ${dims.h || 1}`}
          role="group"
          aria-label="Skills constellation. Jobs and projects are large labels, skills are dots around them. Drag nodes, hover to see connections."
        >
          <g>
            {graph.edges.map(([a, b], k) => {
              const lit = focus !== null && (a === focus || b === focus);
              const tether = !graph.nodes[b].shared;
              return (
                <line
                  key={k}
                  ref={(el) => {
                    edgeEls.current[k] = el;
                  }}
                  className={lit ? "stroke-accent" : "stroke-ink"}
                  strokeWidth={lit ? 1.6 : 1}
                  opacity={
                    lit
                      ? 0.9
                      : focus === null
                        ? tether
                          ? 0.2
                          : 0
                        : tether
                          ? 0.04
                          : 0
                  }
                  style={{ transition: "opacity 0.2s" }}
                />
              );
            })}
          </g>

          <g>
            {drawOrder.map((i) => {
              const nd = graph.nodes[i];
              const dim = near !== null && !near.has(i);
              const hot = near !== null && near.has(i);
              const hub = nd.kind === "hub";
              return (
                <g
                  key={nd.id}
                  ref={(el) => {
                    nodeEls.current[i] = el;
                  }}
                  opacity={dim ? 0.14 : 1}
                  style={{
                    transition: "opacity 0.2s",
                    cursor: "grab",
                    touchAction: "none",
                    outline: "none",
                  }}
                  onPointerDown={(e) => down(e, i)}
                  onPointerMove={move}
                  onPointerUp={up}
                  onPointerCancel={up}
                  onPointerEnter={(e) =>
                    e.pointerType === "mouse" && setHover(i)
                  }
                  onPointerLeave={() => setHover(null)}
                  {...(hub
                    ? {
                        tabIndex: 0,
                        role: "button",
                        "aria-pressed": pinned === i,
                        "aria-label": `${nd.label}, ${graph.adj[i].size} skills`,
                        onFocus: () => setHover(i),
                        onBlur: () => setHover(null),
                        onKeyDown: (e: React.KeyboardEvent) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setPinned((p) => (p === i ? null : i));
                          }
                        },
                      }
                    : { "aria-hidden": true })}
                >
                  {hub ? (
                    <>
                      <rect
                        x={-nd.w / 2}
                        y={-nd.h / 2}
                        width={nd.w}
                        height={nd.h}
                        strokeWidth={1.5}
                        className={
                          hot
                            ? "fill-accent stroke-accent"
                            : nd.hubKind === "experience"
                              ? "fill-ink stroke-ink"
                              : "fill-bg stroke-ink"
                        }
                      />
                      <text
                        textAnchor="middle"
                        dy="0.35em"
                        fontSize={14}
                        className={`font-display font-semibold ${hot ? "fill-[#14181a]" : nd.hubKind === "experience" ? "fill-bg" : "fill-ink"}`}
                        style={{
                          letterSpacing: "-0.02em",
                          pointerEvents: "none",
                        }}
                      >
                        {nd.label}
                      </text>
                    </>
                  ) : (
                    <>
                      {/* Generous invisible hit area so the small dot and its label are easy to grab. */}
                      <rect
                        x={-Math.max(nd.w, 24) / 2}
                        y={-12}
                        width={Math.max(nd.w, 24)}
                        height={34}
                        fill="transparent"
                      />
                      {nd.shared ? (
                        <circle
                          r={hot ? 6 : 4.5}
                          strokeWidth={1.5}
                          className={
                            hot
                              ? "fill-accent stroke-accent"
                              : "fill-bg stroke-ink"
                          }
                        />
                      ) : (
                        <circle
                          r={hot ? 5 : 3.5}
                          className={hot ? "fill-accent" : "fill-ink"}
                        />
                      )}
                      {
                        <text
                          y={16}
                          textAnchor="middle"
                          fontSize={11}
                          className={`stroke-bg font-mono ${hot ? "fill-accent-text" : "fill-ink"}`}
                          style={{
                            pointerEvents: "none",
                            paintOrder: "stroke",
                            strokeWidth: 4,
                            strokeLinejoin: "round",
                          }}
                        >
                          {nd.label}
                        </text>
                      }
                    </>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div
        aria-live="polite"
        className="mt-px flex min-h-14 flex-wrap items-center gap-x-5 gap-y-2 bg-ink px-5 py-3 text-bg"
      >
        {!info ? (
          <p className="label !text-bg/70">
            Hover a job or project to light up its skills, click to pin it. The
            middle column holds skills used in more than one place.
          </p>
        ) : info.n.kind === "skill" ? (
          <>
            <p className="font-mono text-sm">{info.n.label}</p>
            <p className="label !text-bg/60">used in</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {info.links.map((l) => (
                <li key={l.id}>
                  <a
                    href={l.href}
                    className="link-u font-display text-lg font-semibold tracking-tight"
                  >
                    {l.label} ↑
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <a
              href={info.n.href}
              className="link-u font-display text-lg font-semibold tracking-tight"
            >
              {info.n.label} ↑
            </a>
            <p className="label !text-bg/60">{info.links.length} skills</p>
            <p className="font-mono text-xs text-bg/80">
              {info.links
                .slice(0, 8)
                .map((l) => l.label)
                .join(", ")}
              {info.links.length > 8 ? ", …" : ""}
            </p>
          </>
        )}
        {pinned !== null && (
          <button
            type="button"
            onClick={() => setPinned(null)}
            className="label ml-auto !text-bg/80 hover:!text-bg"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
