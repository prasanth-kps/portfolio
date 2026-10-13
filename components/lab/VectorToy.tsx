"use client";
import { useMemo, useState } from "react";
import { Slider, svgPoint } from "./ui";
import {
  CENTROIDS,
  H,
  POINTS,
  SHARDS,
  SHARD_OF,
  W,
  clamp,
  search,
  type Pt,
  type SearchResult,
} from "./vector";

export default function VectorToy() {
  const [query, setQuery] = useState<Pt>({ x: 262, y: 128 });
  const [k, setK] = useState(6);
  const [probe, setProbe] = useState(2);

  const r = useMemo(() => search(query, k, probe), [query, k, probe]);

  const recall = Math.round((r.hits / k) * 100);
  const pct = Math.round((r.scanned / POINTS.length) * 100);

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons === 1 || e.type === "pointerdown")
      setQuery(svgPoint(e, W, H));
  };
  const key = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 24 : 10;
    const dx =
      e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0;
    const dy = e.key === "ArrowDown" ? step : e.key === "ArrowUp" ? -step : 0;
    if (!dx && !dy) return;
    e.preventDefault();
    setQuery((q) => ({ x: clamp(q.x + dx, 0, W), y: clamp(q.y + dy, 0, H) }));
  };

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,17rem)_1fr]">
      <div className="space-y-6">
        <Slider
          id="vs-k"
          label="Neighbors wanted (k)"
          value={k}
          min={1}
          max={10}
          onChange={setK}
        />
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
          <p
            className={`font-display text-6xl font-semibold leading-none tracking-[-0.05em] tabular-nums ${recall < 100 ? "text-accent-text" : ""}`}
          >
            {recall}%
          </p>
          <p className="label mt-2">recall@{k}</p>
        </div>
        <p
          aria-live="polite"
          className="text-[0.95rem] leading-snug text-muted"
        >
          Scanning {r.scanned} of {POINTS.length} points ({pct}%) found {r.hits}{" "}
          of the {k} true neighbors.
          {recall < 100
            ? " Search more shards to recover the rest."
            : " Every true neighbor found."}
        </p>
      </div>

      <div>
        <VectorMap
          query={query}
          r={r}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            move(e);
          }}
          onPointerMove={move}
          onKeyDown={key}
        />
        <p className="label mt-3 flex flex-wrap gap-x-6 gap-y-1 normal-case tracking-normal">
          <span>Filled orange: what the search returned</span>
          <span>Ring: true nearest neighbors</span>
          <span>Click or drag to move the query</span>
        </p>
      </div>
    </div>
  );
}

// The corpus map. `reveal` false hides which points were returned and which were true neighbors.
export function VectorMap({
  query,
  r,
  reveal = true,
  interactive = true,
  onPointerDown,
  onPointerMove,
  onKeyDown,
}: {
  query: Pt;
  r: SearchResult;
  reveal?: boolean;
  interactive?: boolean;
  onPointerDown?: (e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerMove?: (e: React.PointerEvent<SVGSVGElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<SVGSVGElement>) => void;
}) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`aspect-[4/3] w-full touch-none border border-line bg-bg ${interactive ? "cursor-crosshair" : ""}`}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "application" : "img"}
      aria-label={
        interactive
          ? "Vector search canvas. Click or drag to place the query. Arrow keys move it."
          : "Map of 224 points in 8 shards with the query marked"
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onKeyDown={onKeyDown}
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
      {POINTS.map((p, i) => {
        const hit = reveal && r.approx.has(i);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hit ? 4.5 : 2.6}
            className={hit ? "fill-accent" : "fill-ink"}
            opacity={hit ? 1 : r.routed.has(SHARD_OF[i]) ? 0.55 : 0.18}
          />
        );
      })}
      {reveal &&
        [...r.exact].map((i) => (
          <circle
            key={`e${i}`}
            cx={POINTS[i].x}
            cy={POINTS[i].y}
            r="8"
            fill="none"
            strokeWidth="1.5"
            className="stroke-accent-text"
          />
        ))}
      <circle
        cx={query.x}
        cy={query.y}
        r="6"
        strokeWidth="2"
        className="fill-bg stroke-ink"
      />
      <circle cx={query.x} cy={query.y} r="1.8" className="fill-ink" />
    </svg>
  );
}
