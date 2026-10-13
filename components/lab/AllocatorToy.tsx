"use client";
import { useMemo, useState } from "react";
import { Btn, svgPoint } from "./ui";

const W = 400;
const H = 300;
const UNITS_PER_SEVERITY = 8;
const MAX_SITES = 10;

interface Depot {
  id: string;
  x: number;
  y: number;
  supply: number;
}
interface Site {
  id: number;
  x: number;
  y: number;
  sev: number;
}
interface Leg {
  depot: string;
  amt: number;
  fallback: boolean;
}

const DEPOTS: Depot[] = [
  { id: "A", x: 58, y: 66, supply: 60 },
  { id: "B", x: 338, y: 84, supply: 60 },
  { id: "C", x: 196, y: 246, supply: 60 },
];

const START_SITES: Site[] = [
  { id: 1, x: 120, y: 140, sev: 5 },
  { id: 2, x: 290, y: 170, sev: 3 },
  { id: 3, x: 230, y: 70, sev: 4 },
  { id: 4, x: 90, y: 230, sev: 2 },
  { id: 5, x: 330, y: 245, sev: 3 },
];

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

// Highest severity first. Each site draws from its nearest online depot, then the next nearest.
function allocate(sites: Site[], down: Set<string>) {
  const left = Object.fromEntries(
    DEPOTS.map((d) => [d.id, down.has(d.id) ? 0 : d.supply]),
  );
  const result = new Map<
    number,
    { need: number; served: number; legs: Leg[] }
  >();
  let reroutes = 0;
  [...sites]
    .sort((a, b) => b.sev - a.sev || a.id - b.id)
    .forEach((s) => {
      const need = s.sev * UNITS_PER_SEVERITY;
      let remaining = need;
      const legs: Leg[] = [];
      const byDistance = [...DEPOTS].sort((a, b) => dist(a, s) - dist(b, s));
      byDistance.forEach((d, idx) => {
        const take = Math.min(remaining, left[d.id]);
        if (take > 0) {
          left[d.id] -= take;
          remaining -= take;
          // Fallback means the nearest depot (even if offline) could not supply this site.
          const fb = idx > 0;
          if (fb) reroutes += 1;
          legs.push({ depot: d.id, amt: take, fallback: fb });
        }
      });
      result.set(s.id, { need, served: need - remaining, legs });
    });
  return { result, left, reroutes };
}

export default function AllocatorToy() {
  const [sites, setSites] = useState<Site[]>(START_SITES);
  const [down, setDown] = useState<Set<string>>(new Set());
  const [nextId, setNextId] = useState(6);

  const { result, left, reroutes } = useMemo(
    () => allocate(sites, down),
    [sites, down],
  );
  const need = sites.reduce((a, s) => a + s.sev * UNITS_PER_SEVERITY, 0);
  const served = [...result.values()].reduce((a, r) => a + r.served, 0);

  const addAt = (x: number, y: number) => {
    if (sites.length >= MAX_SITES) return;
    setSites((s) => [...s, { id: nextId, x, y, sev: 3 }]);
    setNextId((n) => n + 1);
  };
  const addRandom = () =>
    addAt(30 + Math.random() * (W - 60), 30 + Math.random() * (H - 60));
  const bump = (id: number, by: number) =>
    setSites((all) =>
      all.flatMap((s) => {
        if (s.id !== id) return [s];
        const sev = s.sev + by;
        return sev < 1 ? [] : [{ ...s, sev: Math.min(5, sev) }];
      }),
    );
  const toggleDepot = (id: string) =>
    setDown((d) => {
      const n = new Set(d);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,19rem)]">
      <div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="aspect-[4/3] w-full cursor-crosshair border border-line bg-bg"
          role="group"
          aria-label="Disaster map. Click empty space to add a site."
          onClick={(e) => {
            const p = svgPoint(e, W, H);
            addAt(p.x, p.y);
          }}
        >
          {sites.flatMap((s) =>
            (result.get(s.id)?.legs ?? []).map((l) => {
              const d = DEPOTS.find((x) => x.id === l.depot)!;
              return (
                <line
                  key={`${s.id}-${l.depot}`}
                  x1={d.x}
                  y1={d.y}
                  x2={s.x}
                  y2={s.y}
                  strokeWidth={1 + l.amt / 8}
                  strokeDasharray={l.fallback ? "5 4" : undefined}
                  className={l.fallback ? "stroke-accent-text" : "stroke-ink"}
                  opacity="0.55"
                />
              );
            }),
          )}

          {sites.map((s) => {
            const r = result.get(s.id)!;
            const full = r.served >= r.need;
            const none = r.served === 0;
            return (
              <g
                key={s.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  bump(s.id, s.sev === 5 ? -5 : 1);
                }}
              >
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={5 + s.sev * 1.6}
                  strokeWidth="2"
                  strokeDasharray={none ? "3 3" : undefined}
                  className={`${full ? "fill-ink stroke-ink" : none ? "fill-bg stroke-accent-text" : "fill-accent stroke-accent-text"}`}
                />
              </g>
            );
          })}

          {DEPOTS.map((d) => {
            const off = down.has(d.id);
            return (
              <g key={d.id}>
                <rect
                  x={d.x - 10}
                  y={d.y - 10}
                  width="20"
                  height="20"
                  strokeWidth="2"
                  className={
                    off ? "fill-bg stroke-muted" : "fill-bg stroke-ink"
                  }
                />
                <text
                  x={d.x}
                  y={d.y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="var(--font-geist-mono)"
                  className={off ? "fill-muted" : "fill-ink"}
                >
                  {d.id}
                </text>
                <text
                  x={d.x}
                  y={d.y + 26}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="var(--font-geist-mono)"
                  className="fill-muted"
                >
                  {off ? "DOWN" : `${left[d.id]}/${d.supply}`}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="label mt-3 normal-case tracking-normal">
          Click the map to add a site. Click a site to raise its severity. Solid
          lines are nearest-depot supply, dashed orange lines are fallback.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="label">Depots (click to take offline)</p>
          <div className="mt-2 flex gap-2">
            {DEPOTS.map((d) => (
              <button
                key={d.id}
                type="button"
                aria-pressed={down.has(d.id)}
                onClick={() => toggleDepot(d.id)}
                className={`label h-10 flex-1 border transition-colors duration-200 ${
                  down.has(d.id)
                    ? "border-accent bg-accent/15 !text-accent-text"
                    : "border-line !text-ink hover:border-ink"
                }`}
              >
                {d.id} {down.has(d.id) ? "down" : "online"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p
            className={`font-display text-6xl font-semibold leading-none tracking-[-0.05em] tabular-nums ${
              served < need ? "text-accent-text" : ""
            }`}
          >
            {need ? Math.round((served / need) * 100) : 100}%
          </p>
          <p
            aria-live="polite"
            className="label mt-2 normal-case tracking-normal"
          >
            {served} of {need} units delivered. {reroutes} fallback{" "}
            {reroutes === 1 ? "route" : "routes"}.
          </p>
          {served < need && (
            <p className="mt-2 text-[0.92rem] leading-snug text-muted">
              Supply ran short, so the lowest-severity sites went unserved
              first.
            </p>
          )}
        </div>

        <ul className="border-t border-line">
          {sites.map((s, i) => {
            const r = result.get(s.id)!;
            return (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 border-b border-line py-2 font-mono text-[0.8rem]"
              >
                <span className="tabular-nums">Site {i + 1}</span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Lower severity of site ${i + 1}`}
                    onClick={() => bump(s.id, -1)}
                    className="h-7 w-7 border border-line hover:border-ink"
                  >
                    {s.sev === 1 ? "×" : "-"}
                  </button>
                  <span className="w-14 text-center tabular-nums">
                    sev {s.sev}
                  </span>
                  <button
                    type="button"
                    aria-label={`Raise severity of site ${i + 1}`}
                    onClick={() => bump(s.id, 1)}
                    disabled={s.sev === 5}
                    className="h-7 w-7 border border-line hover:border-ink disabled:opacity-30"
                  >
                    +
                  </button>
                </span>
                <span
                  className={`w-16 text-right tabular-nums ${r.served < r.need ? "text-accent-text" : ""}`}
                >
                  {r.served}/{r.need}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex gap-2">
          <Btn onClick={addRandom} disabled={sites.length >= MAX_SITES}>
            Add site
          </Btn>
          <Btn
            onClick={() => {
              setSites(START_SITES);
              setDown(new Set());
              setNextId(6);
            }}
            variant="line"
          >
            Reset
          </Btn>
        </div>
      </div>
    </div>
  );
}
