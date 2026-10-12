"use client";
import { useMemo, useState } from "react";
import { Slider, svgPoint } from "./ui";

const W = 400;
const H = 300;
const SHARDS = 8;

// Seeded so the corpus is identical on every load.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pt = { x: number; y: number };
const d2 = (a: Pt, b: Pt) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Corpus of 224 points in 8 loose clusters, then split into 8 shards with a few k-means steps.
const { POINTS, CENTROIDS, MEMBERS } = (() => {
  const rand = mulberry32(7);
  const seeds: Pt[] = [
    { x: 70, y: 60 }, { x: 190, y: 45 }, { x: 330, y: 70 }, { x: 55, y: 170 },
    { x: 200, y: 150 }, { x: 340, y: 175 }, { x: 110, y: 255 }, { x: 290, y: 250 },
  ];
  const points: Pt[] = [];
  for (const c of seeds) {
    for (let i = 0; i < 28; i += 1) {
      const m = Math.sqrt(-2 * Math.log(rand() || 1e-6));
      const a = 2 * Math.PI * rand();
      points.push({ x: clamp(c.x + m * Math.cos(a) * 24, 8, W - 8), y: clamp(c.y + m * Math.sin(a) * 22, 8, H - 8) });
    }
  }
  let centroids = seeds.map((s) => ({ ...s }));
  let assign: number[] = [];
  for (let iter = 0; iter < 8; iter += 1) {
    assign = points.map((p) => {
      let best = 0;
      centroids.forEach((c, i) => {
        if (d2(p, c) < d2(p, centroids[best])) best = i;
      });
      return best;
    });
    centroids = centroids.map((c, i) => {
      const own = points.filter((_, j) => assign[j] === i);
      if (!own.length) return c;
      return { x: own.reduce((a, p) => a + p.x, 0) / own.length, y: own.reduce((a, p) => a + p.y, 0) / own.length };
    });
  }
  const members: number[][] = Array.from({ length: SHARDS }, () => []);
  assign.forEach((s, i) => members[s].push(i));
  return { POINTS: points, CENTROIDS: centroids, MEMBERS: members };
})();

const SHARD_OF = (() => {
  const m = new Array<number>(POINTS.length).fill(0);
  MEMBERS.forEach((list, sh) => list.forEach((i) => (m[i] = sh)));
  return m;
})();

export default function VectorToy() {
  const [query, setQuery] = useState<Pt>({ x: 262, y: 128 });
  const [k, setK] = useState(6);
  const [probe, setProbe] = useState(2);

  const r = useMemo(() => {
    const exact = POINTS.map((p, i) => ({ i, d: d2(p, query) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, k)
      .map((o) => o.i);

    const routed = CENTROIDS.map((c, s) => ({ s, d: d2(c, query) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, probe)
      .map((o) => o.s);

    // Each searched shard returns its own top-k. The merge keeps the best k overall.
    let scanned = 0;
    const merged: { i: number; d: number }[] = [];
    for (const s of routed) {
      scanned += MEMBERS[s].length;
      MEMBERS[s]
        .map((i) => ({ i, d: d2(POINTS[i], query) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, k)
        .forEach((o) => merged.push(o));
    }
    const approx = merged.sort((a, b) => a.d - b.d).slice(0, k).map((o) => o.i);
    const hits = approx.filter((i) => exact.includes(i)).length;
    return { exact: new Set(exact), approx: new Set(approx), routed: new Set(routed), scanned, hits };
  }, [query, k, probe]);

  const recall = Math.round((r.hits / k) * 100);
  const pct = Math.round((r.scanned / POINTS.length) * 100);

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons === 1 || e.type === "pointerdown") setQuery(svgPoint(e, W, H));
  };
  const key = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 24 : 10;
    const dx = e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0;
    const dy = e.key === "ArrowDown" ? step : e.key === "ArrowUp" ? -step : 0;
    if (!dx && !dy) return;
    e.preventDefault();
    setQuery((q) => ({ x: clamp(q.x + dx, 0, W), y: clamp(q.y + dy, 0, H) }));
  };

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,17rem)_1fr]">
      <div className="space-y-6">
        <Slider id="vs-k" label="Neighbors wanted (k)" value={k} min={1} max={10} onChange={setK} />
        <Slider
          id="vs-probe"
          label="Shards searched"
          value={probe}
          min={1}
          max={SHARDS}
          readout={`${probe} of ${SHARDS}`}
          onChange={setProbe}
        />
        <div>
          <p className={`font-display text-6xl font-semibold leading-none tracking-[-0.05em] tabular-nums ${recall < 100 ? "text-accent-text" : ""}`}>
            {recall}%
          </p>
          <p className="label mt-2">recall@{k}</p>
        </div>
        <p aria-live="polite" className="text-[0.95rem] leading-snug text-muted">
          Scanning {r.scanned} of {POINTS.length} points ({pct}%) found {r.hits} of the {k} true neighbors.
          {recall < 100 ? " Search more shards to recover the rest." : " Every true neighbor found."}
        </p>
      </div>

      <div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="aspect-[4/3] w-full cursor-crosshair touch-none border border-line bg-bg"
          tabIndex={0}
          role="application"
          aria-label="Vector search canvas. Click or drag to place the query. Arrow keys move it."
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            move(e);
          }}
          onPointerMove={move}
          onKeyDown={key}
        >
          {CENTROIDS.map((c, s) => (
            <path
              key={s}
              d={`M${c.x - 5},${c.y} h10 M${c.x},${c.y - 5} v10`}
              strokeWidth="1"
              className={r.routed.has(s) ? "stroke-ink" : "stroke-muted"}
              opacity={r.routed.has(s) ? 0.9 : 0.4}
            />
          ))}
          {POINTS.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={r.approx.has(i) ? 4.5 : 2.6}
              className={r.approx.has(i) ? "fill-accent" : "fill-ink"}
              opacity={r.approx.has(i) ? 1 : r.routed.has(SHARD_OF[i]) ? 0.55 : 0.18}
            />
          ))}
          {[...r.exact].map((i) => (
            <circle key={`e${i}`} cx={POINTS[i].x} cy={POINTS[i].y} r="8" fill="none" strokeWidth="1.5" className="stroke-accent-text" />
          ))}
          <circle cx={query.x} cy={query.y} r="6" strokeWidth="2" className="fill-bg stroke-ink" />
          <circle cx={query.x} cy={query.y} r="1.8" className="fill-ink" />
        </svg>
        <p className="label mt-3 flex flex-wrap gap-x-6 gap-y-1 normal-case tracking-normal">
          <span>Filled orange: what the search returned</span>
          <span>Ring: true nearest neighbors</span>
          <span>Click or drag to move the query</span>
        </p>
      </div>
    </div>
  );
}

