"use client";
import { useMemo, useState } from "react";
import { Btn, ResultCard, ScoreBar } from "./ui";
import { recordBest, useBest } from "@/lib/best";

const W = 400;
const H = 300;
const SUPPLY = 40;

interface Depot {
  id: string;
  x: number;
  y: number;
}
interface Site {
  id: number;
  x: number;
  y: number;
  people: number;
  need: number;
}
interface Scenario {
  title: string;
  story: string;
  down: string[];
  sites: Site[];
}

const DEPOTS: Depot[] = [
  { id: "A", x: 58, y: 66 },
  { id: "B", x: 338, y: 84 },
  { id: "C", x: 196, y: 246 },
];

const s = (
  id: number,
  x: number,
  y: number,
  people: number,
  need: number,
): Site => ({ id, x, y, people, need });

const SCENARIOS: Scenario[] = [
  {
    title: "Flood",
    story: "All three depots are open, but the sites need more than they hold.",
    down: [],
    sites: [
      s(1, 120, 140, 12, 28),
      s(2, 290, 170, 38, 16),
      s(3, 230, 70, 14, 32),
      s(4, 90, 230, 26, 12),
      s(5, 330, 245, 10, 28),
      s(6, 200, 158, 34, 24),
    ],
  },
  {
    title: "Depot B floods",
    story: "Depot B is underwater. A third of the supply is gone.",
    down: ["B"],
    sites: [
      s(1, 70, 120, 9, 24),
      s(2, 250, 60, 30, 16),
      s(3, 310, 150, 12, 32),
      s(4, 150, 220, 36, 16),
      s(5, 255, 235, 28, 12),
      s(6, 120, 60, 14, 20),
    ],
  },
  {
    title: "Two depots lost",
    story: "Only depot B still stands. Almost nobody can be fully served.",
    down: ["A", "C"],
    sites: [
      s(1, 330, 120, 10, 20),
      s(2, 260, 200, 38, 28),
      s(3, 120, 100, 34, 16),
      s(4, 60, 200, 8, 12),
      s(5, 190, 140, 22, 16),
    ],
  },
];

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

interface Leg {
  depot: string;
  amt: number;
  fallback: boolean;
}

// Serve sites in the order given. Each draws from its nearest depot that still has stock.
function allocate(sc: Scenario, order: number[]) {
  const left = Object.fromEntries(
    DEPOTS.map((d) => [d.id, sc.down.includes(d.id) ? 0 : SUPPLY]),
  );
  const ranked = [
    ...order,
    ...sc.sites.map((x) => x.id).filter((id) => !order.includes(id)),
  ];
  const out = new Map<number, { served: number; legs: Leg[] }>();
  for (const id of ranked) {
    const site = sc.sites.find((x) => x.id === id)!;
    let remaining = site.need;
    const legs: Leg[] = [];
    [...DEPOTS]
      .sort((a, b) => dist(a, site) - dist(b, site))
      .forEach((d, idx) => {
        const take = Math.min(remaining, left[d.id]);
        if (take > 0) {
          left[d.id] -= take;
          remaining -= take;
          legs.push({ depot: d.id, amt: take, fallback: idx > 0 });
        }
      });
    out.set(id, { served: site.need - remaining, legs });
  }
  const helped = sc.sites.reduce(
    (a, x) => a + (x.people * out.get(x.id)!.served) / x.need,
    0,
  );
  return { out, left, helped };
}

function permutations(ids: number[]): number[][] {
  if (ids.length <= 1) return [ids];
  return ids.flatMap((id, i) =>
    permutations([...ids.slice(0, i), ...ids.slice(i + 1)]).map((rest) => [
      id,
      ...rest,
    ]),
  );
}

// Best possible people helped per scenario, found by trying every ranking.
const BEST = SCENARIOS.map((sc) =>
  Math.round(
    Math.max(
      ...permutations(sc.sites.map((x) => x.id)).map(
        (o) => allocate(sc, o).helped,
      ),
    ),
  ),
);
const BEST_TOTAL = BEST.reduce((a, b) => a + b, 0);

export default function AllocatorGame() {
  const [round, setRound] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [shown, setShown] = useState(false);
  const [earned, setEarned] = useState<number[]>([]);
  const best = useBest("allocator");

  const sc = SCENARIOS[round];
  const a = useMemo(() => allocate(sc, order), [sc, order]);
  const total = earned.reduce((x, y) => x + y, 0);
  const finished = earned.length === SCENARIOS.length && shown;

  const toggle = (id: number) => {
    if (shown) return;
    setOrder((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  };
  const dispatch = () => {
    const got = Math.round(a.helped);
    const next = [...earned, got];
    setEarned(next);
    setShown(true);
    if (next.length === SCENARIOS.length)
      recordBest(
        "allocator",
        next.reduce((x, y) => x + y, 0),
      );
  };
  const nextRound = () => {
    setRound((n) => n + 1);
    setOrder([]);
    setShown(false);
  };
  const restart = () => {
    setRound(0);
    setOrder([]);
    setShown(false);
    setEarned([]);
  };

  return (
    <div className="space-y-6">
      <ScoreBar
        goal="Rank the sites by who to supply first. Each site draws from its nearest depot with stock left. Help as many people as you can."
        score={total}
        best={best}
        fmt={(n) => `${n} people`}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
        <div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="aspect-[4/3] w-full border border-line bg-bg"
            role="group"
            aria-label="Disaster map. Select sites in the order they should be supplied."
          >
            {sc.sites.flatMap((site) =>
              (a.out.get(site.id)?.legs ?? []).map((l) => {
                const d = DEPOTS.find((x) => x.id === l.depot)!;
                return (
                  <line
                    key={`${site.id}-${l.depot}`}
                    x1={d.x}
                    y1={d.y}
                    x2={site.x}
                    y2={site.y}
                    strokeWidth={1 + l.amt / 8}
                    strokeDasharray={l.fallback ? "5 4" : undefined}
                    className={l.fallback ? "stroke-accent-text" : "stroke-ink"}
                    opacity="0.5"
                  />
                );
              }),
            )}

            {sc.sites.map((site) => {
              const rank = order.indexOf(site.id) + 1;
              const got = a.out.get(site.id)!.served;
              const r = 7 + Math.sqrt(site.people) * 1.5;
              const full = got >= site.need;
              const none = got === 0;
              return (
                <g
                  key={site.id}
                  tabIndex={shown ? -1 : 0}
                  role="button"
                  aria-label={`Site ${site.id}, ${site.people} people, needs ${site.need} units. ${rank ? `Ranked ${rank}.` : "Not ranked."}`}
                  className={shown ? "" : "cursor-pointer outline-none"}
                  onClick={() => toggle(site.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(site.id);
                    }
                  }}
                >
                  <circle
                    cx={site.x}
                    cy={site.y}
                    r={r}
                    strokeWidth="2"
                    strokeDasharray={none ? "3 3" : undefined}
                    className={
                      full
                        ? "fill-ink stroke-ink"
                        : none
                          ? "fill-bg stroke-accent-text"
                          : "fill-accent stroke-accent-text"
                    }
                  />
                  {rank > 0 && (
                    <text
                      x={site.x}
                      y={site.y + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="700"
                      fontFamily="var(--font-geist-mono)"
                      className={full ? "fill-bg" : "fill-ink"}
                    >
                      {rank}
                    </text>
                  )}
                  <text
                    x={site.x}
                    y={site.y + r + 11}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontFamily="var(--font-geist-mono)"
                    className="fill-muted"
                  >
                    {site.people} people, {site.need}u
                  </text>
                </g>
              );
            })}

            {DEPOTS.map((d) => {
              const off = sc.down.includes(d.id);
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
                    y={d.y - 15}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="var(--font-geist-mono)"
                    className="fill-muted"
                  >
                    {off ? "DOWN" : `${a.left[d.id]}/${SUPPLY}`}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="label mt-3 normal-case tracking-normal">
            Select sites in order of priority. Solid lines are nearest-depot
            supply, dashed orange lines are fallback. Selecting a ranked site
            removes its rank.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <p className="label tabular-nums">
              Crisis {round + 1} of {SCENARIOS.length}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold tracking-tight">
              {sc.title}
            </p>
            <p className="mt-1 text-[0.92rem] leading-snug text-muted">
              {sc.story}
            </p>
          </div>

          {!shown ? (
            <div className="space-y-3">
              <p aria-live="polite" className="font-mono text-sm tabular-nums">
                {order.length} of {sc.sites.length} ranked
              </p>
              <div className="flex gap-2">
                <Btn onClick={dispatch} disabled={order.length === 0}>
                  Dispatch
                </Btn>
                <Btn
                  onClick={() => setOrder([])}
                  variant="line"
                  disabled={order.length === 0}
                >
                  Clear
                </Btn>
              </div>
            </div>
          ) : (
            <div aria-live="polite" className="space-y-3">
              <p className="font-display text-5xl font-semibold leading-none tracking-[-0.05em] tabular-nums">
                +{earned[round]}
              </p>
              <p className="text-[0.95rem] leading-snug">
                People helped. The best ranking here helps {BEST[round]}.
              </p>
              {round < SCENARIOS.length - 1 && (
                <Btn onClick={nextRound}>Next crisis</Btn>
              )}
            </div>
          )}
        </div>
      </div>

      {finished && (
        <ResultCard
          win={total >= BEST_TOTAL * 0.9}
          headline={
            total >= BEST_TOTAL
              ? "Perfect triage"
              : total >= BEST_TOTAL * 0.9
                ? "Strong triage"
                : "Lives left on the table"
          }
          detail={`You helped ${total} people. The best possible across all three crises is ${BEST_TOTAL}. Round by round: ${earned.join(", ")}.`}
          real="In the disaster response project a model predicts the priority score from images and tables. This is the step after it: spend scarce supplies in priority order and reroute when a depot fails."
          score={total}
          best={best}
          fmt={(n) => `${n} people`}
          onAgain={restart}
        />
      )}
    </div>
  );
}
