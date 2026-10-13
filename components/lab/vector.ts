// Shared by the free-play toy and the game: a seeded 2D corpus split into shards.
export const W = 400;
export const H = 300;
export const SHARDS = 8;

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

export type Pt = { x: number; y: number };
export const d2 = (a: Pt, b: Pt) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
export const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

// Corpus of 224 points in 8 loose clusters, then split into 8 shards with a few k-means steps.
export const { POINTS, CENTROIDS, MEMBERS } = (() => {
  const rand = mulberry32(7);
  const seeds: Pt[] = [
    { x: 70, y: 60 },
    { x: 190, y: 45 },
    { x: 330, y: 70 },
    { x: 55, y: 170 },
    { x: 200, y: 150 },
    { x: 340, y: 175 },
    { x: 110, y: 255 },
    { x: 290, y: 250 },
  ];
  const points: Pt[] = [];
  for (const c of seeds) {
    for (let i = 0; i < 28; i += 1) {
      const m = Math.sqrt(-2 * Math.log(rand() || 1e-6));
      const a = 2 * Math.PI * rand();
      points.push({
        x: clamp(c.x + m * Math.cos(a) * 24, 8, W - 8),
        y: clamp(c.y + m * Math.sin(a) * 22, 8, H - 8),
      });
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
      return {
        x: own.reduce((a, p) => a + p.x, 0) / own.length,
        y: own.reduce((a, p) => a + p.y, 0) / own.length,
      };
    });
  }
  const members: number[][] = Array.from({ length: SHARDS }, () => []);
  assign.forEach((s, i) => members[s].push(i));
  return { POINTS: points, CENTROIDS: centroids, MEMBERS: members };
})();

export const SHARD_OF = (() => {
  const m = new Array<number>(POINTS.length).fill(0);
  MEMBERS.forEach((list, sh) => list.forEach((i) => (m[i] = sh)));
  return m;
})();

export interface SearchResult {
  exact: Set<number>;
  approx: Set<number>;
  routed: Set<number>;
  scanned: number;
  hits: number;
}

// Search the `probe` nearest shards, merge their local top-k, and compare with the exact answer.
export function search(query: Pt, k: number, probe: number): SearchResult {
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
  const approx = merged
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
    .map((o) => o.i);
  const hits = approx.filter((i) => exact.includes(i)).length;
  return {
    exact: new Set(exact),
    approx: new Set(approx),
    routed: new Set(routed),
    scanned,
    hits,
  };
}
