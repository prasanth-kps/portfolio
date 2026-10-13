// A small force layout for the skills constellation. Pure functions over typed arrays,
// so it can be run and measured outside React.

export interface Tpl {
  id: string;
  kind: "hub" | "skill";
  hubKind?: "experience" | "project";
  label: string;
  href?: string;
  w: number;
  h: number;
  mass: number;
  // A skill used in more than one place. It sits between the two sides and shows no label at rest.
  shared?: boolean;
}

export interface Sim {
  // Home positions: hubs sit in their own territory, jobs on one side and projects on the other.
  // Skills drift toward the middle of the hubs they belong to.
  ax: Float32Array;
  ay: Float32Array;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  fixed: boolean[];
  alpha: number;
  wide: boolean;
  raf: number;
  dragging: boolean;
}

// Deterministic jitter so the layout is the same on every load.
export const hash = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export const FORCES = {
  hubCharge: 4000,
  skillCharge: 1500,
  linkLength: 80,
  linkStrength: 0.02,
  anchor: 0.04,
  anchorSkill: 0.003,
  // Shared skills form a column down the middle: pulled hard onto it, loosely along it.
  anchorShared: 0.06,
  anchorSharedAlong: 0.006,
  // How far in from each edge the jobs and the projects sit, as a share of the width.
  inset: 0.17,
  sharedLink: 0.2,
  collide: 0.4,
  damping: 0.82,
  decay: 0.99,
};

export function createSim(
  nodes: Tpl[],
  adj: Set<number>[],
  hubCount: number,
  w: number,
  h: number,
): Sim {
  const n = nodes.length;
  const s: Sim = {
    ax: new Float32Array(n),
    ay: new Float32Array(n),
    x: new Float32Array(n),
    y: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    fixed: new Array(n).fill(false),
    alpha: 0,
    wide: true,
    raf: 0,
    dragging: false,
  };
  const exps = nodes
    .slice(0, hubCount)
    .filter((x) => x.hubKind === "experience").length;
  const projs = hubCount - exps;
  // Wide boxes put jobs on the left and projects on the right. Tall ones put jobs on top.
  const wide = w >= h * 1.05;
  s.wide = wide;
  // Narrower boxes need the two sides further apart so the labels do not collide.
  const inset = FORCES.inset + (w < 900 ? 0.04 : 0);
  const place = (i: number, k: number, count: number, band: number) => {
    const along = count === 1 ? 0.5 : 0.12 + (0.76 * k) / (count - 1);
    // Alternate three offsets across the band so neighbours never line up.
    const across = band + 0.065 * ((k % 3) - 1);
    s.ax[i] = (wide ? across : along) * w;
    s.ay[i] = (wide ? along : across) * h;
    // Start close to the middle so the settle reads as an expansion.
    s.x[i] = w / 2 + (s.ax[i] - w / 2) * 0.25;
    s.y[i] = h / 2 + (s.ay[i] - h / 2) * 0.25;
  };
  for (let i = 0; i < hubCount; i += 1) {
    if (nodes[i].hubKind === "experience") place(i, i, exps, inset);
    else place(i, i - exps, projs, 1 - inset);
  }
  for (let i = hubCount; i < n; i += 1) {
    const hubs = [...adj[i]];
    const cx = hubs.reduce((a, hh) => a + s.x[hh], 0) / hubs.length;
    const cy = hubs.reduce((a, hh) => a + s.y[hh], 0) / hubs.length;
    s.ax[i] = hubs.reduce((a, hh) => a + s.ax[hh], 0) / hubs.length;
    s.ay[i] = hubs.reduce((a, hh) => a + s.ay[hh], 0) / hubs.length;
    // Shared skills line up in the middle, level with the hubs they connect.
    if (nodes[i].shared) {
      if (wide) s.ax[i] = w / 2;
      else s.ay[i] = h / 2;
    }
    s.x[i] = cx + (hash(i) - 0.5) * 60;
    s.y[i] = cy + (hash(i + 99) - 0.5) * 60;
  }
  return s;
}

export function stepSim(
  s: Sim,
  nodes: Tpl[],
  edges: [number, number][],
  hubCount: number,
  w: number,
  h: number,
) {
  const n = nodes.length;
  const a = s.alpha;
  const F = FORCES;

  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      let dx = s.x[j] - s.x[i];
      let dy = s.y[j] - s.y[i];
      let d2 = dx * dx + dy * dy;
      if (d2 < 0.01) {
        dx = hash(i + j) - 0.5;
        dy = hash(i * j + 1) - 0.5;
        d2 = dx * dx + dy * dy + 0.01;
      }
      const d = Math.sqrt(d2);
      const hubby = nodes[i].kind === "hub" || nodes[j].kind === "hub";
      const f = ((hubby ? F.hubCharge : F.skillCharge) / Math.max(d2, 400)) * a;
      let fx = (dx / d) * f;
      let fy = (dy / d) * f;
      // Labels are wide boxes, so resolve overlap along the axis with the least penetration.
      const ox = (nodes[i].w + nodes[j].w) / 2 + 6 - Math.abs(dx);
      const oy = (nodes[i].h + nodes[j].h) / 2 + 4 - Math.abs(dy);
      if (ox > 0 && oy > 0) {
        if (ox < oy) fx += Math.sign(dx || 1) * ox * F.collide;
        else fy += Math.sign(dy || 1) * oy * F.collide;
      }
      if (!s.fixed[i]) {
        s.vx[i] -= fx / nodes[i].mass;
        s.vy[i] -= fy / nodes[i].mass;
      }
      if (!s.fixed[j]) {
        s.vx[j] += fx / nodes[j].mass;
        s.vy[j] += fy / nodes[j].mass;
      }
    }
  }

  for (const [ia, ib] of edges) {
    const dx = s.x[ib] - s.x[ia];
    const dy = s.y[ib] - s.y[ia];
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    // Shared skills sit in their own column, so their links only tug on them lightly.
    const pull = nodes[ib].shared ? F.sharedLink : 1;
    const f = (d - F.linkLength) * F.linkStrength * (0.45 + a) * pull;
    const fx = (dx / d) * f;
    const fy = (dy / d) * f;
    if (!s.fixed[ia]) {
      s.vx[ia] += fx / nodes[ia].mass;
      s.vy[ia] += fy / nodes[ia].mass;
    }
    if (!s.fixed[ib]) {
      s.vx[ib] -= fx / nodes[ib].mass;
      s.vy[ib] -= fy / nodes[ib].mass;
    }
  }

  for (let i = 0; i < n; i += 1) {
    if (s.fixed[i]) {
      s.vx[i] = 0;
      s.vy[i] = 0;
      continue;
    }
    if (i >= hubCount && nodes[i].shared) {
      const across = F.anchorShared;
      const along = F.anchorSharedAlong;
      s.vx[i] += (s.ax[i] - s.x[i]) * (s.wide ? across : along);
      s.vy[i] += (s.ay[i] - s.y[i]) * (s.wide ? along : across);
    } else {
      const k = i < hubCount ? F.anchor : F.anchorSkill;
      s.vx[i] += (s.ax[i] - s.x[i]) * k;
      s.vy[i] += (s.ay[i] - s.y[i]) * k;
    }
    // Soft walls keep things off the border without piling up on it.
    const mx = nodes[i].w / 2 + 24;
    if (s.x[i] < mx) s.vx[i] += (mx - s.x[i]) * 0.02;
    if (s.x[i] > w - mx) s.vx[i] -= (s.x[i] - (w - mx)) * 0.02;
    if (s.y[i] < 36) s.vy[i] += (36 - s.y[i]) * 0.02;
    if (s.y[i] > h - 36) s.vy[i] -= (s.y[i] - (h - 36)) * 0.02;
    s.vx[i] *= F.damping;
    s.vy[i] *= F.damping;
    s.x[i] = Math.min(
      w - nodes[i].w / 2 - 6,
      Math.max(nodes[i].w / 2 + 6, s.x[i] + s.vx[i]),
    );
    s.y[i] = Math.min(h - 18, Math.max(18, s.y[i] + s.vy[i]));
  }
}
