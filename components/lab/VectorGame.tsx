"use client";
import { useMemo, useState } from "react";
import { Btn, ResultCard, ScoreBar, Slider } from "./ui";
import { VectorMap } from "./VectorToy";
import { POINTS, SHARDS, search, type Pt } from "./vector";
import { recordBest, useBest } from "@/lib/best";

const K = 6;
const NEED = 5; // true neighbors to find out of K for a round to count

// Easy ones first. The later queries sit between clusters, where too few shards lose neighbors.
const QUERIES: Pt[] = [
  { x: 110, y: 255 },
  { x: 330, y: 60 },
  { x: 30, y: 110 },
  { x: 150, y: 90 },
  { x: 250, y: 180 },
];

const pointsFor = (hits: number, scanned: number) =>
  hits >= NEED ? 100 - Math.round((scanned / POINTS.length) * 100) : 0;

// What a perfect player would score on each query, found by trying every probe count.
const BEST_ROUND = QUERIES.map((q) =>
  Math.max(
    ...Array.from({ length: SHARDS }, (_, i) => i + 1).map((p) => {
      const r = search(q, K, p);
      return pointsFor(r.hits, r.scanned);
    }),
  ),
);
const BEST_TOTAL = BEST_ROUND.reduce((a, b) => a + b, 0);

export default function VectorGame() {
  const [round, setRound] = useState(0);
  const [probe, setProbe] = useState(2);
  const [shown, setShown] = useState(false);
  const [earned, setEarned] = useState<number[]>([]);
  const best = useBest("vector");

  const query = QUERIES[round];
  const r = useMemo(() => search(query, K, probe), [query, probe]);
  const total = earned.reduce((a, b) => a + b, 0);
  const finished = earned.length === QUERIES.length && shown;
  const here = pointsFor(r.hits, r.scanned);

  const submit = () => {
    const next = [...earned, here];
    setEarned(next);
    setShown(true);
    if (next.length === QUERIES.length)
      recordBest(
        "vector",
        next.reduce((a, b) => a + b, 0),
      );
  };
  const next = () => {
    setRound((n) => n + 1);
    setShown(false);
  };
  const restart = () => {
    setRound(0);
    setProbe(2);
    setShown(false);
    setEarned([]);
  };

  return (
    <div className="space-y-6">
      <ScoreBar
        goal={`Find at least ${NEED} of the ${K} true neighbors for each query. Every point you did not scan scores.`}
        score={total}
        best={best}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,17rem)_1fr]">
        <div className="space-y-6">
          <p className="label tabular-nums">
            Query {Math.min(round + 1, QUERIES.length)} of {QUERIES.length}
          </p>
          <Slider
            id="vg-probe"
            label="Shards to search"
            value={probe}
            min={1}
            max={SHARDS}
            readout={`${probe} of ${SHARDS}`}
            onChange={(v) => !shown && setProbe(v)}
          />
          <p className="text-[0.92rem] leading-snug text-muted">
            The crosses mark each shard. The ones you will search are drawn
            dark. Searching fewer is cheaper but can miss neighbors across a
            shard border.
          </p>

          {!shown ? (
            <Btn onClick={submit}>Search</Btn>
          ) : (
            <div aria-live="polite" className="space-y-3">
              <p className="font-display text-5xl font-semibold leading-none tracking-[-0.05em] tabular-nums">
                +{earned[round]}
              </p>
              <p className="text-[0.95rem] leading-snug">
                Found {r.hits} of {K} by scanning {r.scanned} of {POINTS.length}{" "}
                points.
                {r.hits < NEED ? ` That is under ${NEED}, so no points.` : ""}
              </p>
              {round < QUERIES.length - 1 && (
                <Btn onClick={next}>Next query</Btn>
              )}
            </div>
          )}
        </div>

        <div>
          <VectorMap query={query} r={r} reveal={shown} interactive={false} />
          <p className="label mt-3 flex flex-wrap gap-x-6 gap-y-1 normal-case tracking-normal">
            <span>Circle with dot: the query</span>
            <span>
              Revealed after you search: filled orange is returned, rings are
              the true neighbors
            </span>
          </p>
        </div>
      </div>

      {finished && (
        <ResultCard
          win={total >= BEST_TOTAL * 0.85}
          headline={
            total >= BEST_TOTAL
              ? "Perfect run"
              : total >= BEST_TOTAL * 0.85
                ? "Sharp routing"
                : "Room to tune"
          }
          detail={`You scored ${total} of a possible ${BEST_TOTAL}. Round by round: ${earned.join(", ")}.`}
          real="Distributed vector search makes this exact trade: send each query to a few shards, merge their local top results, and accept a little lost recall for a lot less work."
          score={total}
          best={best}
          onAgain={restart}
        />
      )}
    </div>
  );
}
