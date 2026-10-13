// Emblems for the Experience section: one frameless isometric scene per job. Each is drawn on a
// fixed 360 by 220 canvas (the caller scales it), loops seamlessly, and uses only the site's ink
// and accent colors, shaded to read as solid objects. Decorative.

export const EMBLEM_W = 360;
export const EMBLEM_H = 220;

export type EmblemScene = "chip" | "solar" | "payments" | "cloud";

export interface Colors {
  ink: string;
  accent: string;
  // True when the page is dark, so faces are shaded light-on-dark instead of dark-on-light.
  dark: boolean;
  // The page background, for knockouts such as label backgrounds.
  bg: string;
}

type Pt = [number, number];
type Ctx = CanvasRenderingContext2D;
type Proj = (x: number, y: number, z: number) => Pt;

const TAU = Math.PI * 2;
const COS = 0.8660254;
const SIN = 0.5;
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => v * v * (3 - 2 * v);

// Deterministic pseudo-random in [0, 1).
const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

// Isometric projection: x runs right and down, y runs left and down, z runs up.
const makeProj =
  (ox: number, oy: number, s: number): Proj =>
  (x, y, z) => [ox + (x - y) * COS * s, oy + (x + y) * SIN * s - z * s];

// Point at fraction u (0 to 1) of the way along a polyline, by length.
function along(pts: Pt[], u: number): Pt {
  const lens: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    lens.push(l);
    total += l;
  }
  let d = clamp01(u) * total;
  for (let i = 0; i < lens.length; i += 1) {
    if (d <= lens[i] || i === lens.length - 1) {
      const f = lens[i] ? Math.min(1, d / lens[i]) : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
    }
    d -= lens[i];
  }
  return pts[pts.length - 1];
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function poly(ctx: Ctx, pts: Pt[]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

function fillPoly(ctx: Ctx, pts: Pt[], color: string, alpha: number) {
  poly(ctx, pts);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.fill();
}

function line(ctx: Ctx, pts: Pt[], color: string, alpha: number, width = 1) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = alpha;
  ctx.stroke();
}

// Face brightness. On a light page the top is lightest and the sides get darker; on a dark page
// the top catches the light and the sides fall away.
const shade = (c: Colors) =>
  c.dark ? { top: 0.2, left: 0.11, right: 0.055, edge: 0.55 } : { top: 0.04, left: 0.09, right: 0.16, edge: 0.5 };

// A solid box with three shaded faces and crisp edges. `lit` paints the top in the accent color.
function box(ctx: Ctx, P: Proj, x: number, y: number, z: number, w: number, d: number, h: number, c: Colors, lit = 0) {
  const t = shade(c);
  const A = P(x, y, z + h);
  const B = P(x + w, y, z + h);
  const C = P(x + w, y + d, z + h);
  const D = P(x, y + d, z + h);
  const E = P(x + w, y, z);
  const F = P(x + w, y + d, z);
  const G = P(x, y + d, z);
  fillPoly(ctx, [B, C, F, E], c.ink, t.right);
  fillPoly(ctx, [D, C, F, G], c.ink, t.left);
  fillPoly(ctx, [A, B, C, D], c.ink, t.top);
  if (lit > 0) fillPoly(ctx, [A, B, C, D], c.accent, 0.92 * lit);
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 0.9;
  ctx.globalAlpha = t.edge;
  ctx.beginPath();
  ctx.moveTo(...A);
  ctx.lineTo(...B);
  ctx.lineTo(...C);
  ctx.lineTo(...D);
  ctx.closePath();
  ctx.moveTo(...B);
  ctx.lineTo(...E);
  ctx.lineTo(...F);
  ctx.lineTo(...G);
  ctx.lineTo(...D);
  ctx.moveTo(...C);
  ctx.lineTo(...F);
  ctx.stroke();
}

// A soft contact shadow under an object, built from a few widening footprints.
function shadow(ctx: Ctx, P: Proj, x: number, y: number, w: number, d: number, c: Colors) {
  for (let i = 3; i >= 1; i -= 1) {
    const g = i * 0.28;
    fillPoly(ctx, [P(x - g, y - g, 0), P(x + w + g, y - g, 0), P(x + w + g, y + d + g, 0), P(x - g, y + d + g, 0)], c.ink, c.dark ? 0.05 : 0.035);
  }
}

// A quiet dotted floor so objects sit somewhere.
function floor(ctx: Ctx, P: Proj, x0: number, x1: number, y0: number, y1: number, c: Colors) {
  ctx.fillStyle = c.ink;
  ctx.globalAlpha = 0.16;
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 1) {
    for (let y = y0; y <= y1; y += 1) {
      const [sx, sy] = P(x, y, 0);
      ctx.rect(sx - 0.5, sy - 0.5, 1, 1);
    }
  }
  ctx.fill();
}

// A light trail: a bright head with a fading tail along a path.
function comet(ctx: Ctx, pts: Pt[], u: number, c: Colors, size = 2.6, tail = 11) {
  for (let k = tail; k >= 1; k -= 1) {
    const [x, y] = along(pts, u - k * 0.011);
    const f = 1 - k / tail;
    ctx.fillStyle = c.accent;
    ctx.globalAlpha = 0.5 * f;
    ctx.beginPath();
    ctx.arc(x, y, size * (0.35 + 0.6 * f), 0, TAU);
    ctx.fill();
  }
  const [hx, hy] = along(pts, u);
  ctx.fillStyle = c.accent;
  ctx.globalAlpha = 0.28;
  ctx.beginPath();
  ctx.arc(hx, hy, size * 2.2, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(hx, hy, size, 0, TAU);
  ctx.fill();
}

function check(ctx: Ctx, x: number, y: number, s: number, c: Colors, alpha: number) {
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 1.7;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.5, y);
  ctx.lineTo(x - s * 0.1, y + s * 0.4);
  ctx.lineTo(x + s * 0.6, y - s * 0.45);
  ctx.stroke();
}

function lock(ctx: Ctx, x: number, y: number, c: Colors, alpha: number) {
  ctx.fillStyle = c.accent;
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 1.3;
  ctx.globalAlpha = alpha;
  ctx.fillRect(x - 3.6, y - 1, 7.2, 5.4);
  ctx.beginPath();
  ctx.arc(x, y - 1, 2.5, Math.PI, 0);
  ctx.stroke();
}

function text(ctx: Ctx, s: string, x: number, y: number, size: number, c: Colors, alpha: number, align: CanvasTextAlign = "start") {
  ctx.font = `600 ${size}px ${MONO}`;
  ctx.textAlign = align;
  ctx.fillStyle = c.ink;
  ctx.globalAlpha = alpha;
  ctx.fillText(s, x, y);
  ctx.textAlign = "start";
}

// ---------------------------------------------------------------------------------------------
// Qualcomm: a neural-network model whose operators are routed to the GPU or the NPU.
// ---------------------------------------------------------------------------------------------
function chip(ctx: Ctx, t: number, c: Colors) {
  // The model: a layered graph with a pulse of activation passing through it.
  const layers = [3, 4, 4, 3];
  const lx0 = 36;
  const lx = (i: number) => lx0 + i * 38;
  const ly = (i: number, n: number, k: number) => 82 + (k - (n - 1) / 2) * 24 + (i % 2 ? 0 : 0);
  const wave = (t * 0.85) % 6;
  ctx.lineWidth = 1;
  for (let i = 0; i < layers.length - 1; i += 1) {
    for (let a = 0; a < layers[i]; a += 1) {
      for (let b = 0; b < layers[i + 1]; b += 1) {
        const active = clamp01(1 - Math.abs(wave - i - 0.5) / 0.7);
        line(ctx, [[lx(i), ly(i, layers[i], a)], [lx(i + 1), ly(i + 1, layers[i + 1], b)]], c.ink, 0.13 + 0.3 * active, 0.9);
      }
    }
  }
  const nodePos: Pt[][] = layers.map((n, i) => Array.from({ length: n }, (_, k) => [lx(i), ly(i, n, k)] as Pt));
  nodePos.forEach((layer, i) =>
    layer.forEach(([x, y], k) => {
      const active = clamp01(1 - Math.abs(wave - i) / 0.8);
      if (active > 0) {
        ctx.fillStyle = c.accent;
        ctx.globalAlpha = 0.22 * active;
        ctx.beginPath();
        ctx.arc(x, y, 11 * (0.7 + 0.3 * active), 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = c.bg;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(x, y, 5.6, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.arc(x, y, 5.6, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = c.accent;
      ctx.globalAlpha = active * 0.95;
      ctx.beginPath();
      ctx.arc(x, y, 3.4, 0, TAU);
      ctx.fill();
      void k;
    }),
  );
  text(ctx, "MODEL", lx(0) - 5, 28, 8.5, c, 0.7);
  line(ctx, [[lx(0) - 5, 33], [lx(3) + 5, 33]], c.ink, 0.25, 1);

  // A router that decides where each operator runs.
  const R: Pt = [196, 82];
  nodePos[3].forEach(([x, y]) => line(ctx, [[x + 6, y], R], c.ink, 0.22, 1));
  fillPoly(ctx, [[R[0], R[1] - 9], [R[0] + 9, R[1]], [R[0], R[1] + 9], [R[0] - 9, R[1]]], c.accent, 0.2);
  poly(ctx, [[R[0], R[1] - 9], [R[0] + 9, R[1]], [R[0], R[1] + 9], [R[0] - 9, R[1]]]);
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 1.3;
  ctx.globalAlpha = 0.9;
  ctx.stroke();

  // The chip, small, with a GPU block and an NPU block.
  const P = makeProj(280, 130, 12);
  const zs = 0.42;
  const zd = 0.92;
  shadow(ctx, P, -3.4, -3.4, 6.8, 6.8, c);
  box(ctx, P, -3.4, -3.4, 0, 6.8, 6.8, zs, c);
  ctx.fillStyle = c.ink;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  for (let i = 0; i < 11; i += 1) {
    const o = -3.4 + 0.45 + i * 0.58;
    const a = P(o, 3.4, zs / 2);
    const b = P(3.4, o, zs / 2);
    ctx.rect(a[0] - 0.8, a[1] - 0.8, 1.6, 1.6);
    ctx.rect(b[0] - 0.8, b[1] - 0.8, 1.6, 1.6);
  }
  ctx.fill();
  box(ctx, P, -2.5, -2.5, zs, 5, 5, zd - zs, c);

  type Region = { x: number; y: number; cols: number; rows: number; size: number; gap: number };
  const gpu: Region = { x: -2.15, y: -2.15, cols: 5, rows: 3, size: 0.42, gap: 0.1 };
  const npu: Region = { x: -2.15, y: 0.32, cols: 3, rows: 2, size: 0.76, gap: 0.12 };
  const core = (r: Region, i: number) => ({ x: r.x + (i % r.cols) * (r.size + r.gap), y: r.y + Math.floor(i / r.cols) * (r.size + r.gap) });
  const frame = (r: Region) => {
    const w = r.cols * r.size + (r.cols - 1) * r.gap + 0.2;
    const d = r.rows * r.size + (r.rows - 1) * r.gap + 0.2;
    line(ctx, [P(r.x - 0.1, r.y - 0.1, zd), P(r.x + w - 0.1, r.y - 0.1, zd), P(r.x + w - 0.1, r.y + d - 0.1, zd), P(r.x - 0.1, r.y + d - 0.1, zd), P(r.x - 0.1, r.y - 0.1, zd)], c.ink, 0.4, 1);
  };
  // The NPU block is tinted in the accent color so it reads at a glance, the GPU block stays neutral.
  const tint = (r: Region, color: string, a: number) => {
    const w = r.cols * r.size + (r.cols - 1) * r.gap + 0.2;
    const d = r.rows * r.size + (r.rows - 1) * r.gap + 0.2;
    fillPoly(ctx, [P(r.x - 0.1, r.y - 0.1, zd), P(r.x + w - 0.1, r.y - 0.1, zd), P(r.x + w - 0.1, r.y + d - 0.1, zd), P(r.x - 0.1, r.y + d - 0.1, zd)], color, a);
  };
  tint(gpu, c.ink, 0.07);
  tint(npu, c.accent, 0.2);
  frame(gpu);
  frame(npu);
  line(ctx, [P(1.0, -2.2, zd), P(2.25, -2.2, zd), P(2.25, 2.2, zd), P(1.0, 2.2, zd), P(1.0, -2.2, zd)], c.ink, 0.28);
  // Labels sit in clear space beside the chip, on solid pills, joined to their block by a leader.
  const tag = (label: string, x: number, y: number, hot: boolean) => {
    ctx.font = `700 9.5px ${MONO}`;
    const w = ctx.measureText(label).width + 12;
    roundRect(ctx, x - w / 2, y - 8, w, 16, 8);
    ctx.fillStyle = c.bg;
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.strokeStyle = hot ? c.accent : c.ink;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = hot ? 0.95 : 0.6;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = hot ? c.accent : c.ink;
    ctx.globalAlpha = 1;
    ctx.fillText(label, x, y + 3.4);
    ctx.textAlign = "start";
  };
  const gpuAnchor = P(-0.7, -2.15, zd);
  line(ctx, [gpuAnchor, [gpuAnchor[0], gpuAnchor[1] - 26]], c.ink, 0.5, 1);
  tag("GPU", gpuAnchor[0], gpuAnchor[1] - 34, false);
  const npuAnchor = P(-2.15, 1.7, zd);
  line(ctx, [npuAnchor, [npuAnchor[0] - 22, npuAnchor[1] + 26]], c.accent, 0.8, 1);
  tag("NPU", npuAnchor[0] - 26, npuAnchor[1] + 34, true);

  // Operators leave the router, take the bus, dip into a core, and come out the other side.
  const D = 3.4;
  const lit = new Map<string, number>();
  const trails: { pts: Pt[]; u: number }[] = [];
  let result = 0;
  const entry = P(-5.4, 0, zs);
  for (let k = 0; k < 5; k += 1) {
    const raw = (t - k * 0.68) / D;
    if (raw < 0) continue;
    const lap = Math.floor(raw);
    const u = raw - lap;
    const toGpu = hash(lap * 3 + k) > 0.4;
    const r = toGpu ? gpu : npu;
    const idx = Math.floor(hash(lap * 5 + k * 11) * r.cols * r.rows);
    const cc = core(r, idx);
    const cx = cc.x + r.size / 2;
    const cy = cc.y + r.size / 2;
    const pts: Pt[] = [
      R,
      [R[0] + 12, R[1]],
      [entry[0] - 10, entry[1]],
      entry,
      P(-2.5, 0, zs),
      P(-2.5, 0, zd),
      P(cx, 0, zd),
      P(cx, cy, zd),
      P(cx, 0, zd),
      P(2.5, 0, zd),
      P(2.5, 0, zs),
      P(6.2, 0, zs),
    ];
    trails.push({ pts, u });
    const key = `${toGpu ? "g" : "n"}${idx}`;
    if (u > 0.5 && u < 0.7) lit.set(key, Math.max(lit.get(key) ?? 0, 1 - Math.abs(u - 0.6) / 0.1));
    if (u > 0.93) result = Math.max(result, (u - 0.93) / 0.07);
  }
  line(ctx, [R, [R[0] + 12, R[1]], [entry[0] - 10, entry[1]], entry, P(-2.5, 0, zs), P(-2.5, 0, zd), P(2.5, 0, zd), P(2.5, 0, zs), P(6.2, 0, zs)], c.ink, 0.34, 1.2);

  [
    [gpu, "g"],
    [npu, "n"],
  ].forEach(([r, key]) => {
    const reg = r as Region;
    for (let i = 0; i < reg.cols * reg.rows; i += 1) {
      const cc = core(reg, i);
      const v = lit.get(`${key}${i}`) ?? 0;
      if (v > 0) box(ctx, P, cc.x, cc.y, zd, reg.size, reg.size, 0.18 * v, c, v);
      else line(ctx, [P(cc.x, cc.y, zd), P(cc.x + reg.size, cc.y, zd), P(cc.x + reg.size, cc.y + reg.size, zd), P(cc.x, cc.y + reg.size, zd), P(cc.x, cc.y, zd)], c.ink, 0.3);
    }
  });
  box(ctx, P, 6.0, -0.4, zs, 0.8, 0.8, 0.22, c, result);
  trails.forEach(({ pts, u }) => comet(ctx, pts, u, c, 2.3, 9));
}

// ---------------------------------------------------------------------------------------------
// Enphase: a big solar array under the sun. Wiring and the battery are supporting details.
// ---------------------------------------------------------------------------------------------
function solar(ctx: Ctx, t: number, c: Colors) {
  const P = makeProj(204, 140, 17);

  // The sun, its rays, and soft shafts of light falling on the array.
  const sx = 50;
  const sy = 42;
  const sweep = (t * 0.3) % 1.5;
  for (let k = 0; k < 4; k += 1) {
    const tx = P(-3.4 + k * 2.1, -1.6, 1.6);
    ctx.fillStyle = c.accent;
    ctx.globalAlpha = 0.07 + 0.05 * Math.sin(t * 1.3 + k);
    ctx.beginPath();
    ctx.moveTo(sx + 6, sy + 8);
    ctx.lineTo(sx + 18, sy - 2);
    ctx.lineTo(tx[0] + 22, tx[1]);
    ctx.lineTo(tx[0] - 22, tx[1] + 6);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = c.accent;
  ctx.globalAlpha = 0.13;
  ctx.beginPath();
  ctx.arc(sx, sy, 34, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.arc(sx, sy, 15, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  for (let k = 0; k < 16; k += 1) {
    const a = t * 0.22 + (k * TAU) / 16;
    ctx.moveTo(sx + Math.cos(a) * 21, sy + Math.sin(a) * 21);
    ctx.lineTo(sx + Math.cos(a) * (k % 2 ? 27 : 33), sy + Math.sin(a) * (k % 2 ? 27 : 33));
  }
  ctx.stroke();

  floor(ctx, P, -7, 7, -5, 5, c);
  shadow(ctx, P, -4.2, -3.6, 8.4, 5.4, c);

  // Two rows of four tilted panels on posts. The back row sits higher and further away.
  const pw = 1.8;
  const pd = 1.3;
  const rows = [
    { y0: -3.0, z: 1.0 },
    { y0: -0.9, z: 0.55 },
  ];
  const inverters: Pt[] = [];
  rows.forEach((row, ri) => {
    for (let i = 0; i < 4; i += 1) {
      const x0 = -3.9 + i * (pw + 0.22);
      const lo = row.z; // front (lower) edge
      const hi = row.z + 0.9; // back (higher) edge
      const q: Pt[] = [P(x0, row.y0 + pd, lo), P(x0 + pw, row.y0 + pd, lo), P(x0 + pw, row.y0, hi), P(x0, row.y0, hi)];
      // Posts under the panel.
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.3;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      for (const px of [x0 + 0.25, x0 + pw - 0.25]) {
        ctx.moveTo(...P(px, row.y0 + pd - 0.1, lo));
        ctx.lineTo(...P(px, row.y0 + pd - 0.1, 0));
      }
      ctx.stroke();
      // Thickness along the lower edge, then the glass.
      fillPoly(ctx, [q[0], q[1], P(x0 + pw, row.y0 + pd, lo - 0.14), P(x0, row.y0 + pd, lo - 0.14)], c.ink, shade(c).right);
      fillPoly(ctx, q, c.ink, c.dark ? 0.13 : 0.075);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      poly(ctx, q);
      ctx.stroke();
      // Cells.
      ctx.lineWidth = 0.6;
      ctx.globalAlpha = 0.24;
      ctx.beginPath();
      for (let g = 1; g < 5; g += 1) {
        const f = g / 5;
        ctx.moveTo(...P(x0 + pw * f, row.y0 + pd, lo));
        ctx.lineTo(...P(x0 + pw * f, row.y0, hi));
      }
      for (let g = 1; g < 3; g += 1) {
        const f = g / 3;
        ctx.moveTo(...P(x0, row.y0 + pd - pd * f, lo + (hi - lo) * f));
        ctx.lineTo(...P(x0 + pw, row.y0 + pd - pd * f, lo + (hi - lo) * f));
      }
      ctx.stroke();
      // A sweep of sunlight across the array.
      const gl = clamp01(1 - Math.abs(sweep - (i * (pw + 0.22) + pw / 2 + ri * 0.6) / 9) / 0.17);
      if (gl > 0) fillPoly(ctx, q, c.accent, 0.34 * ease(gl));
      if (ri === 1) inverters.push(P(x0 + pw / 2, row.y0 + pd + 0.15, 0.05));
    }
  });

  // Microinverters on the ground below the front row, wired to a small battery.
  const bx = 4.6;
  const wireY = 1.6;
  const wire = (i: number): Pt[] => {
    const x = -3.9 + i * (pw + 0.22) + pw / 2;
    return [P(x, 0.55, 0.05), P(x, wireY, 0.05), P(bx + 0.4, wireY, 0.05), P(bx + 0.4, 0.5, 0.05)];
  };
  for (let i = 0; i < 4; i += 1) line(ctx, wire(i), c.ink, 0.34, 1.1);
  inverters.forEach((_, i) => {
    const x = -3.9 + i * (pw + 0.22) + pw / 2;
    box(ctx, P, x - 0.18, 0.4, 0, 0.36, 0.28, 0.14, c, 1);
  });
  ctx.setLineDash([2, 3]);
  for (let i = 0; i < 3; i += 1) line(ctx, [P(-3.9 + i * 2.02 + pw / 2 + 0.3, 0.55, 0.14), P(-3.9 + (i + 1) * 2.02 + pw / 2 - 0.3, 0.55, 0.14)], c.accent, 0.15 + 0.5 * Math.pow(Math.sin(t * 2.2 + i * 1.4), 2), 1);
  ctx.setLineDash([]);
  box(ctx, P, bx, -0.1, 0, 0.8, 1.0, 1.1, c);
  const level = 0.08 + 0.92 * ease(clamp01((t % 6) / 5));
  for (let b = 0; b < 4; b += 1) {
    const zb = 0.14 + b * 0.24;
    fillPoly(ctx, [P(bx + 0.1, 0.9, zb), P(bx + 0.7, 0.9, zb), P(bx + 0.7, 0.9, zb + 0.15), P(bx + 0.1, 0.9, zb + 0.15)], c.accent, level > (b + 0.5) / 4 ? 0.9 : 0.12);
  }
  for (let i = 0; i < 4; i += 1) {
    for (let k = 0; k < 2; k += 1) comet(ctx, wire(i), (t * 0.32 + i * 0.17 + k * 0.5) % 1, c, 2, 8);
  }
}

// ---------------------------------------------------------------------------------------------
// Visa: a transaction card, tapped on a terminal, cleared in a flash.
// ---------------------------------------------------------------------------------------------
function payments(ctx: Ctx, t: number, c: Colors) {
  const loop = 4.4;
  const ph = (t % loop) / loop; // 0..1
  const approach = ease(clamp01(ph / 0.28)) * (1 - ease(clamp01((ph - 0.78) / 0.2)));
  const tapped = clamp01((ph - 0.36) / 0.08) * (1 - clamp01((ph - 0.9) / 0.1));

  // Soft shadows to ground the card and the terminal.
  const ground = (x: number, y: number, rx: number, ry: number, a: number) => {
    for (let i = 3; i >= 1; i -= 1) {
      ctx.fillStyle = c.ink;
      ctx.globalAlpha = a * (c.dark ? 1.4 : 1) * 0.5;
      ctx.beginPath();
      ctx.ellipse(x, y, rx * (1 + i * 0.12), ry * (1 + i * 0.16), 0, 0, TAU);
      ctx.fill();
    }
  };
  const cx = 140 + approach * 40;
  const cy = 100 - approach * 6 + Math.sin(t * 1.5) * 1.6;
  ground(cx - 6, 176, 78, 9, 0.05);
  ground(300, 176, 30, 6, 0.05);

  // The terminal: a body, a screen that lights when the tap clears, and a keypad.
  ctx.save();
  ctx.translate(300, 112);
  ctx.rotate(0.06);
  roundRect(ctx, -26, -58, 52, 112, 7);
  ctx.fillStyle = c.ink;
  ctx.globalAlpha = c.dark ? 0.1 : 0.06;
  ctx.fill();
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 1.3;
  ctx.globalAlpha = 0.6;
  ctx.stroke();
  roundRect(ctx, -19, -50, 38, 34, 4);
  ctx.fillStyle = c.accent;
  ctx.globalAlpha = 0.12 + 0.6 * tapped;
  ctx.fill();
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  if (tapped > 0) check(ctx, 0, -33, 11, c, tapped);
  ctx.fillStyle = c.ink;
  ctx.globalAlpha = 0.4;
  for (let r = 0; r < 4; r += 1) for (let k = 0; k < 3; k += 1) {
    ctx.beginPath();
    ctx.arc(-11 + k * 11, -4 + r * 12, 2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // Contactless waves leaving the card toward the terminal.
  const wx = cx + 82;
  for (let k = 0; k < 3; k += 1) {
    const w = (ph * 3.2 + k / 3) % 1;
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1.3;
    ctx.globalAlpha = (1 - w) * 0.6 * clamp01(approach * 3);
    ctx.beginPath();
    ctx.arc(wx - 8, cy, 8 + w * 38, -0.6, 0.6);
    ctx.stroke();
  }

  // The card itself: a tilted body with an edge, and every detail a real card has.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.2 + Math.sin(t * 0.9) * 0.025 + approach * 0.12);
  const W = 176;
  const H = 112;
  // Edge thickness.
  roundRect(ctx, -W / 2 + 3, -H / 2 + 5, W, H, 10);
  ctx.fillStyle = c.ink;
  ctx.globalAlpha = c.dark ? 0.2 : 0.22;
  ctx.fill();
  // Face.
  roundRect(ctx, -W / 2, -H / 2, W, H, 10);
  const face = ctx.createLinearGradient(-W / 2, -H / 2, W / 2, H / 2);
  face.addColorStop(0, c.ink);
  face.addColorStop(1, c.ink);
  ctx.fillStyle = face;
  ctx.globalAlpha = c.dark ? 0.1 : 0.06;
  ctx.fill();
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 1.4;
  ctx.globalAlpha = 0.65;
  ctx.stroke();
  // A band of accent across the lower card, like a printed design.
  ctx.save();
  roundRect(ctx, -W / 2, -H / 2, W, H, 10);
  ctx.clip();
  ctx.fillStyle = c.accent;
  ctx.globalAlpha = 0.16;
  ctx.beginPath();
  ctx.moveTo(-W / 2, H / 2 - 38);
  ctx.lineTo(W / 2, H / 2 - 62);
  ctx.lineTo(W / 2, H / 2);
  ctx.lineTo(-W / 2, H / 2);
  ctx.closePath();
  ctx.fill();
  // The shine passing over the card.
  const sh = ((t * 0.32) % 1.6) * (W + 80) - 80 - W / 2;
  ctx.fillStyle = c.dark ? c.ink : "#fff";
  ctx.globalAlpha = c.dark ? 0.14 : 0.5;
  ctx.beginPath();
  ctx.moveTo(sh, -H / 2);
  ctx.lineTo(sh + 26, -H / 2);
  ctx.lineTo(sh + 6, H / 2);
  ctx.lineTo(sh - 20, H / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // EMV chip.
  roundRect(ctx, -W / 2 + 18, -H / 2 + 28, 32, 25, 4);
  ctx.fillStyle = c.accent;
  ctx.globalAlpha = 0.92;
  ctx.fill();
  ctx.strokeStyle = c.bg;
  ctx.lineWidth = 0.9;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(-W / 2 + 18, -H / 2 + 40.5);
  ctx.lineTo(-W / 2 + 50, -H / 2 + 40.5);
  ctx.moveTo(-W / 2 + 34, -H / 2 + 28);
  ctx.lineTo(-W / 2 + 34, -H / 2 + 53);
  ctx.moveTo(-W / 2 + 18, -H / 2 + 34);
  ctx.lineTo(-W / 2 + 29, -H / 2 + 34);
  ctx.moveTo(-W / 2 + 39, -H / 2 + 34);
  ctx.lineTo(-W / 2 + 50, -H / 2 + 34);
  ctx.moveTo(-W / 2 + 18, -H / 2 + 47);
  ctx.lineTo(-W / 2 + 29, -H / 2 + 47);
  ctx.moveTo(-W / 2 + 39, -H / 2 + 47);
  ctx.lineTo(-W / 2 + 50, -H / 2 + 47);
  ctx.stroke();
  // Contactless symbol.
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;
  for (let k = 0; k < 4; k += 1) {
    ctx.beginPath();
    ctx.arc(-W / 2 + 62, -H / 2 + 40.5, 6 + k * 5, -0.7, 0.7);
    ctx.stroke();
  }
  // Card number, name and expiry.
  ctx.fillStyle = c.ink;
  ctx.globalAlpha = 0.6;
  for (let g = 0; g < 4; g += 1) for (let d = 0; d < 4; d += 1) {
    ctx.beginPath();
    ctx.arc(-W / 2 + 20 + g * 36 + d * 7, 12, 1.9, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 0.4;
  roundRect(ctx, -W / 2 + 18, 31, 64, 5, 2.5);
  ctx.fill();
  roundRect(ctx, -W / 2 + 18, 40, 26, 4, 2);
  ctx.fill();
  // A hologram and a brand-neutral mark.
  const holo = ctx.createLinearGradient(W / 2 - 52, -H / 2 + 14, W / 2 - 20, -H / 2 + 34);
  holo.addColorStop(0, c.accent);
  holo.addColorStop(0.5, c.ink);
  holo.addColorStop(1, c.accent);
  roundRect(ctx, W / 2 - 50, -H / 2 + 14, 32, 22, 5);
  ctx.fillStyle = holo;
  ctx.globalAlpha = 0.3;
  ctx.fill();
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 0.9;
  ctx.globalAlpha = 0.4;
  ctx.stroke();
  ctx.fillStyle = c.accent;
  ctx.globalAlpha = 0.85;
  for (let k = 0; k < 3; k += 1) {
    ctx.beginPath();
    ctx.moveTo(W / 2 - 52 + k * 11, H / 2 - 12);
    ctx.lineTo(W / 2 - 44 + k * 11, H / 2 - 12);
    ctx.lineTo(W / 2 - 50 + k * 11, H / 2 - 28);
    ctx.lineTo(W / 2 - 58 + k * 11, H / 2 - 28);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // The tap: a packet jumps to the terminal, then the clearing time appears.
  if (ph > 0.26 && ph < 0.4) comet(ctx, [[cx + 84, cy], [cx + 84 + (300 - cx - 110) * 0.5, cy - 14], [292, 78]], (ph - 0.26) / 0.14, c, 2.6, 9);
  text(ctx, "<10 ms", 300, 186, 9, c, 0.75 * clamp01((ph - 0.4) / 0.1) * (1 - clamp01((ph - 0.9) / 0.1)), "center");
}

// ---------------------------------------------------------------------------------------------
// Oqlo.ai: a big cloud that scales out and pushes encrypted commands to a fleet of devices.
// ---------------------------------------------------------------------------------------------
const CLOUD_PATH = "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z";

function cloud(ctx: Ctx, t: number, c: Colors) {
  const s = 8.2;
  const cx = 180;
  const cy = 76;
  const path = new Path2D(CLOUD_PATH);

  // The cloud body: filled with depth, then clipped lighting, then a crisp outline.
  ctx.save();
  ctx.translate(cx - 12 * s, cy - 12 * s);
  ctx.scale(s, s);
  const fill = ctx.createLinearGradient(0, 4, 0, 20);
  fill.addColorStop(0, c.ink);
  fill.addColorStop(1, c.ink);
  ctx.fillStyle = fill;
  ctx.globalAlpha = c.dark ? 0.09 : 0.05;
  ctx.fill(path);
  ctx.clip(path);
  const lowShade = ctx.createRadialGradient(17, 21, 0, 17, 21, 14);
  lowShade.addColorStop(0, c.ink);
  lowShade.addColorStop(1, "transparent");
  ctx.fillStyle = lowShade;
  ctx.globalAlpha = c.dark ? 0.1 : 0.16;
  ctx.fillRect(-2, 0, 30, 26);
  const highlight = ctx.createRadialGradient(8, 7, 0, 8, 7, 11);
  highlight.addColorStop(0, c.accent);
  highlight.addColorStop(1, "transparent");
  ctx.fillStyle = highlight;
  ctx.globalAlpha = 0.14;
  ctx.fillRect(-2, 0, 30, 26);
  ctx.restore();
  ctx.save();
  ctx.translate(cx - 12 * s, cy - 12 * s);
  ctx.scale(s, s);
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 1.5 / s;
  ctx.globalAlpha = 0.65;
  ctx.stroke(path);
  ctx.restore();

  // Container instances spawn inside the cloud as it scales out, then it settles and restarts.
  const phase = (t % 7.5) / 7.5;
  const count = 2 + Math.floor(clamp01(phase / 0.74) * 4);
  const PI = makeProj(cx - 6, cy + 2, 13);
  const grid: [number, number][] = [
    [-2.2, -1.1],
    [0, -1.1],
    [2.2, -1.1],
    [-1.1, 1.1],
    [1.1, 1.1],
    [3.3, 1.1],
  ];
  for (let i = 0; i < Math.min(count, 6); i += 1) {
    const born = 0.04 + (i / 6) * 0.74;
    const pop = ease(clamp01((phase - born) / 0.06));
    const [gx, gy] = grid[i];
    ctx.globalAlpha = pop;
    box(ctx, PI, gx - 0.7, gy - 0.7, (1 - pop) * 1.4, 1.4, 1.4, 0.75, c, 0.4 + 0.6 * Math.pow(Math.sin(t * 2 + i), 2) * pop);
  }
  ctx.globalAlpha = 1;

  // Encryption badge at the top right of the cloud.
  const bx = cx + 62;
  const by = cy - 40;
  ctx.fillStyle = c.accent;
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.arc(bx, by, 16, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.arc(bx, by, 11, 0, TAU);
  ctx.fill();
  ctx.fillStyle = c.bg;
  ctx.strokeStyle = c.bg;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.95;
  ctx.fillRect(bx - 4, by - 1, 8, 6);
  ctx.beginPath();
  ctx.arc(bx, by - 1, 2.8, Math.PI, 0);
  ctx.stroke();
  text(ctx, "AES-256", bx + 20, by + 3, 8, c, 0.65);

  // The device fleet below, receiving padlocked commands from the cloud.
  const devs = 6;
  const hub: Pt = [cx, cy + 50];
  const dev = (i: number): Pt => [60 + (i * 240) / (devs - 1), 188 + Math.abs(i - 2.5) * 1.4];
  ctx.setLineDash([2, 4]);
  for (let i = 0; i < devs; i += 1) line(ctx, [hub, [dev(i)[0], dev(i)[1] - 17]], c.ink, 0.2, 1);
  ctx.setLineDash([]);
  const period = 3.6;
  for (let i = 0; i < devs; i += 1) {
    const [x, y] = dev(i);
    const u = (((t - i * 0.5) % period) + period) % period / period;
    const arrived = u >= 0.5 && u < 0.8 ? 1 - Math.abs(u - 0.62) / 0.18 : 0;
    roundRect(ctx, x - 8, y - 15, 16, 28, 3);
    ctx.fillStyle = c.ink;
    ctx.globalAlpha = c.dark ? 0.1 : 0.05;
    ctx.fill();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.fillStyle = c.accent;
    ctx.globalAlpha = 0.14 + 0.8 * clamp01(arrived);
    ctx.fillRect(x - 5, y - 11, 10, 16);
    if (u < 0.5) {
      const p = along([hub, [x, y - 17]], u / 0.5);
      ctx.fillStyle = c.accent;
      ctx.globalAlpha = 0.28;
      ctx.beginPath();
      ctx.arc(p[0], p[1] - 3, 7.5, 0, TAU);
      ctx.fill();
      lock(ctx, p[0], p[1] - 4, c, 1);
    } else if (u >= 0.64 && u < 0.9) {
      const p = along([[x, y - 17], hub], (u - 0.64) / 0.26);
      ctx.fillStyle = c.ink;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 2.1, 0, TAU);
      ctx.fill();
    }
  }
}

export const EMBLEM_CAPTIONS: Record<EmblemScene, string> = {
  chip: "Model graph / GPU + NPU routing",
  solar: "Solar array / microinverters",
  payments: "Card tap / transaction scoring",
  cloud: "Cloud / encrypted device commands",
};

// Draws one frame. The context must already be scaled so that 1 unit is 1 emblem pixel.
export function drawEmblem(ctx: Ctx, scene: EmblemScene, t: number, c: Colors) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (scene === "chip") chip(ctx, t, c);
  else if (scene === "solar") solar(ctx, t, c);
  else if (scene === "payments") payments(ctx, t, c);
  else cloud(ctx, t, c);
  ctx.globalAlpha = 1;
}
