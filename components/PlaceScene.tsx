"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import type { Scene } from "@/lib/places";

const DURATION = 4800;

// Deterministic pseudo-random in [0, 1) so foam and sand grains stay put between frames.
const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

interface P {
  x: number;
  y: number;
  r: number;
  v: number;
  a: number;
  ph: number;
}

// A short, quiet scene drawn behind the content of one card. Uses the site's own colors
// (ink and the single accent), never photos or emoji. Decorative only.
export default function PlaceScene({
  scene,
  invert,
  band,
  onDone,
}: {
  scene: Scene;
  invert?: boolean;
  // Vertical slice of the card the scene plays in, so it appears around the place name.
  band: { top: number; height: number };
  onDone: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      const t = setTimeout(onDone, 1800);
      return () => clearTimeout(t);
    }
    const canvas = cv.current;
    const host = wrap.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = host.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.scale(dpr, dpr);

    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue(invert ? "--bg" : "--ink").trim() || "#888";
    const accent = css.getPropertyValue(invert ? "--inv-accent" : "--accent").trim() || "#d4501e";
    // Snow caps and glints use the page background so they read as white against the dark pines.
    const snowCap = css.getPropertyValue(invert ? "--ink" : "--bg").trim() || "#fff";

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const count = (div: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round((W * H) / div)));

    // Particles for the scenes that have them.
    const parts: P[] = [];
    if (scene === "snow") for (let i = 0; i < count(6500, 40, 110); i += 1) parts.push({ x: rnd(0, W), y: rnd(-H, H), r: i % 6 === 0 ? rnd(3.2, 4.6) : rnd(1, 2.4), v: rnd(16, 42), a: rnd(8, 22), ph: rnd(0, 6.28) });
    const cloudBase = H * 0.27;
    const ground = H * 0.9;
    if (scene === "rain") for (let i = 0; i < count(7500, 36, 100); i += 1) parts.push({ x: rnd(0, W), y: rnd(cloudBase, ground), r: rnd(9, 16), v: rnd(340, 540), a: 0, ph: 0 });
    const ripples: { x: number; at: number }[] = [];

    let raf = 0;
    let start = 0;
    let last = 0;

    const frame = (now: number) => {
      if (!start) {
        start = now;
        last = now;
      }
      const el = now - start;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = el / 1000;
      // Ease in, hold, ease out.
      const env = Math.max(0, Math.min(1, el / 600, (DURATION - el) / 1000));

      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = env;

      if (scene === "snow") {
        // A winter hillside: layered drifts that slowly pile up, snow-capped pines, flakes and crystals.
        const gy = H * 0.82;
        const grow = Math.min(1, el / 3000) * 9;
        const drift = (x: number, base: number, amp: number, k: number, ph: number) => base - grow + Math.sin(x * k + ph) * amp;

        const hill = (base: number, amp: number, k: number, ph: number, fill: number, line: number) => {
          ctx.fillStyle = ink;
          ctx.globalAlpha = env * fill;
          ctx.beginPath();
          ctx.moveTo(0, H);
          for (let x = 0; x <= W; x += 8) ctx.lineTo(x, drift(x, base, amp, k, ph));
          ctx.lineTo(W, H);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = ink;
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = env * line;
          ctx.beginPath();
          for (let x = 0; x <= W; x += 8) {
            const y = drift(x, base, amp, k, ph);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        };
        hill(gy - 22, 11, 0.011, 1, 0.08, 0.22);

        // Snow-capped pines on the back drift.
        const pine = (x: number, scale: number) => {
          const base = drift(x, gy - 22, 11, 0.011, 1) + 4;
          const tiers = [
            { w: 36, h: 24, y: 0 },
            { w: 28, h: 22, y: -17 },
            { w: 19, h: 20, y: -33 },
          ];
          ctx.fillStyle = ink;
          ctx.globalAlpha = env * 0.4;
          ctx.fillRect(x - 2.5 * scale, base - 6 * scale, 5 * scale, 8 * scale);
          tiers.forEach((tr) => {
            const bw = (tr.w / 2) * scale;
            const top = base - 6 * scale + tr.y * scale - tr.h * scale;
            const bot = base - 6 * scale + tr.y * scale;
            ctx.globalAlpha = env * 0.4;
            ctx.fillStyle = ink;
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x + bw, bot);
            ctx.lineTo(x - bw, bot);
            ctx.closePath();
            ctx.fill();
            // Snow resting on the tier.
            ctx.globalAlpha = env * 0.95;
            ctx.fillStyle = snowCap;
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x + bw * 0.62, top + (bot - top) * 0.62);
            ctx.lineTo(x + bw * 0.2, top + (bot - top) * 0.52);
            ctx.lineTo(x - bw * 0.25, top + (bot - top) * 0.62);
            ctx.lineTo(x - bw * 0.62, top + (bot - top) * 0.6);
            ctx.closePath();
            ctx.fill();
          });
        };
        pine(W * 0.14, 1.75);
        pine(W * 0.27, 1.2);
        pine(W * 0.88, 1.5);

        hill(gy + 6, 8, 0.017, 3, 0.12, 0.32);

        // Sun glinting on the snow.
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.2;
        for (let k = 0; k < 7; k += 1) {
          const gx = hash(k * 7 + 3) * W;
          const gyy = drift(gx, gy + 6, 8, 0.017, 3) + 10 + hash(k + 40) * 22;
          const tw = Math.pow(Math.sin(t * 2.4 + k * 1.7), 2);
          const len = 2 + tw * 4;
          ctx.globalAlpha = env * 0.8 * tw;
          ctx.beginPath();
          ctx.moveTo(gx - len, gyy);
          ctx.lineTo(gx + len, gyy);
          ctx.moveTo(gx, gyy - len);
          ctx.lineTo(gx, gyy + len);
          ctx.stroke();
        }

        // Falling snow: dots, and the bigger flakes drawn as six-armed crystals.
        ctx.fillStyle = ink;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1;
        for (const p of parts) {
          p.y += p.v * dt;
          if (p.y > H + 6) p.y = -6;
          const fx = p.x + Math.sin(t * 0.9 + p.ph) * p.a;
          if (p.r > 3) {
            ctx.globalAlpha = env * 0.5;
            const L = p.r * 1.7;
            const spin = t * 0.4 + p.ph;
            ctx.beginPath();
            for (let arm = 0; arm < 3; arm += 1) {
              const ang = spin + (arm * Math.PI) / 3;
              const dx = Math.cos(ang) * L;
              const dy = Math.sin(ang) * L;
              ctx.moveTo(fx - dx, p.y - dy);
              ctx.lineTo(fx + dx, p.y + dy);
              for (const sgn of [-1, 1]) {
                const bx = fx + dx * 0.55 * sgn;
                const by = p.y + dy * 0.55 * sgn;
                const ba = ang + 0.9;
                ctx.moveTo(bx, by);
                ctx.lineTo(bx + Math.cos(ba) * L * 0.3 * sgn, by + Math.sin(ba) * L * 0.3 * sgn);
                const bb = ang - 0.9;
                ctx.moveTo(bx, by);
                ctx.lineTo(bx + Math.cos(bb) * L * 0.3 * sgn, by + Math.sin(bb) * L * 0.3 * sgn);
              }
            }
            ctx.stroke();
          } else {
            ctx.globalAlpha = env * 0.55;
            ctx.beginPath();
            ctx.arc(fx, p.y, p.r, 0, 6.283);
            ctx.fill();
          }
        }
      } else if (scene === "rain") {
        // Clouds drift across the top. Each is a union of circles with an even underside.
        ctx.fillStyle = ink;
        [
          { x0: 0.06, y: 0.15, s: 1.15, v: 7 },
          { x0: 0.44, y: 0.09, s: 0.85, v: 10 },
          { x0: 0.76, y: 0.18, s: 1.0, v: 6 },
        ].forEach((c) => {
          const r = 28 * c.s;
          const span = W + r * 9;
          const cx = ((c.x0 * W + t * c.v) % span) - r * 3.5;
          const cy = H * c.y;
          ctx.globalAlpha = env * 0.17;
          ctx.beginPath();
          [
            [-1.4, 0.8],
            [-0.2, 1.15],
            [1.2, 1.35],
            [2.5, 1.0],
            [3.6, 0.75],
          ].forEach(([dx, k]) => {
            const x = cx + dx * r;
            const y = cy + (0.9 - k) * r;
            ctx.moveTo(x + k * r, y);
            ctx.arc(x, y, k * r, 0, 6.283);
          });
          ctx.fill();
        });

        // Rain falls from the cloud base and lands as small ripples.
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1;
        ctx.globalAlpha = env * 0.26;
        ctx.beginPath();
        for (const p of parts) {
          p.y += p.v * dt;
          if (p.y > ground) {
            if (ripples.length < 18) ripples.push({ x: p.x, at: el });
            p.y = cloudBase + rnd(0, 20);
            p.x = rnd(0, W);
          }
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.r * 0.18, p.y + p.r);
        }
        ctx.stroke();

        ctx.globalAlpha = env * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, ground);
        ctx.lineTo(W, ground);
        ctx.stroke();
        for (let i = ripples.length - 1; i >= 0; i -= 1) {
          const age = (el - ripples[i].at) / 700;
          if (age >= 1) {
            ripples.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = env * (1 - age) * 0.4;
          ctx.beginPath();
          ctx.ellipse(ripples[i].x, ground + 2, 2 + age * 12, 1 + age * 3, 0, 0, 6.283);
          ctx.stroke();
        }
      } else if (scene === "beach") {
        const horizon = H * 0.28;
        const shore = H * 0.56 + Math.sin(t * 1.3) * 8; // the water surges up and back down the sand
        const sunX = W * 0.76;
        const R = Math.min(H * 0.085, 34);

        // Sea: a soft tone from the horizon down to the shoreline.
        const sea = ctx.createLinearGradient(0, horizon, 0, shore);
        sea.addColorStop(0, ink);
        sea.addColorStop(1, "transparent");
        ctx.globalAlpha = env * 0.08;
        ctx.fillStyle = sea;
        ctx.fillRect(0, horizon, W, shore - horizon);

        // Horizon.
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1;
        ctx.globalAlpha = env * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, horizon);
        ctx.lineTo(W, horizon);
        ctx.stroke();

        // Sun sitting on the horizon, with a glow, short rays and a shimmering reflection.
        const halo = ctx.createRadialGradient(sunX, horizon, 0, sunX, horizon, R * 4);
        halo.addColorStop(0, accent);
        halo.addColorStop(1, "transparent");
        ctx.globalAlpha = env * 0.22;
        ctx.fillStyle = halo;
        ctx.fillRect(sunX - R * 4, horizon - R * 4, R * 8, R * 4);
        ctx.fillStyle = accent;
        ctx.globalAlpha = env * 0.48;
        ctx.beginPath();
        ctx.arc(sunX, horizon, R, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.3;
        ctx.globalAlpha = env * 0.5;
        ctx.beginPath();
        for (let k = 0; k < 9; k += 1) {
          const ang = Math.PI + ((k + 0.5) * Math.PI) / 9;
          const flick = 3 * Math.sin(t * 2 + k);
          ctx.moveTo(sunX + Math.cos(ang) * (R + 6), horizon + Math.sin(ang) * (R + 6));
          ctx.lineTo(sunX + Math.cos(ang) * (R + 13 + flick), horizon + Math.sin(ang) * (R + 13 + flick));
        }
        ctx.stroke();
        const reach = shore - horizon - 16;
        for (let k = 0; k < 7; k += 1) {
          const wide = 30 - k * 3.5 + Math.sin(t * 2.4 + k * 1.3) * 5;
          ctx.globalAlpha = env * 0.4 * (1 - k / 8);
          ctx.fillRect(sunX - wide / 2 + Math.sin(t * 1.2 + k) * 4, horizon + 12 + (k * reach) / 7, wide, 1.8);
        }

        // Wave crests: rows of scallops that swell toward the shore.
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.3;
        for (let i = 0; i < 4; i += 1) {
          const ph = (t * 0.1 + i / 4) % 1;
          const y0 = horizon + Math.pow(ph, 1.5) * (shore - horizon - 14);
          const w = 12 + ph * 14;
          const drift = (t * (8 + ph * 10)) % w;
          ctx.globalAlpha = env * 0.3 * Math.sin(ph * Math.PI);
          ctx.beginPath();
          for (let x = -w - drift; x < W + w; x += w) {
            ctx.moveTo(x, y0);
            ctx.quadraticCurveTo(x + w / 2, y0 + w * 0.34, x + w, y0);
          }
          ctx.stroke();
        }

        // Wet sand, then the bumpy foam edge where the water reaches the beach.
        ctx.fillStyle = ink;
        ctx.globalAlpha = env * 0.04;
        ctx.fillRect(0, shore, W, 18);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = env * 0.36;
        ctx.beginPath();
        for (let x = 0; x < W + 14; x += 14) {
          ctx.moveTo(x, shore);
          ctx.arc(x + 7, shore, 7, Math.PI, 2 * Math.PI);
        }
        ctx.stroke();
        ctx.fillStyle = ink;
        ctx.globalAlpha = env * 0.26;
        for (let x = 5; x < W; x += 11) {
          ctx.beginPath();
          ctx.arc(x, shore - 11 - hash(x) * 5, 0.9 + hash(x + 5), 0, 6.283);
          ctx.fill();
        }

        // A broad sand beach: warm tone, soft dune ridges, shells and a scatter of grains.
        const sandTop = shore + 18;
        ctx.fillStyle = accent;
        ctx.globalAlpha = env * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 8) ctx.lineTo(x, sandTop + Math.sin(x * 0.012 + 0.6) * 5);
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1;
        ctx.globalAlpha = env * 0.3;
        for (let k = 0; k < 3; k += 1) {
          ctx.beginPath();
          for (let x = 0; x <= W; x += 10) {
            const y = sandTop + 36 + k * 38 + Math.sin(x * 0.009 + k * 1.9) * 7;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.fillStyle = accent;
        ctx.globalAlpha = env * 0.38;
        for (let g = 0; g < 170; g += 1) {
          ctx.beginPath();
          ctx.arc(hash(g) * W, sandTop + 6 + hash(g + 77) * Math.max(4, H - sandTop - 14), 0.9, 0, 6.283);
          ctx.fill();
        }
        ctx.globalAlpha = env * 0.55;
        for (let k = 0; k < 5; k += 1) {
          const sx = hash(k * 11 + 5) * W;
          const sy = sandTop + 24 + hash(k + 60) * Math.max(10, H - sandTop - 40);
          ctx.beginPath();
          ctx.arc(sx, sy, 3.4, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
        }

        // A palm leaning over the beach, swaying in the breeze.
        const sway = Math.sin(t * 0.9) * 4;
        const px = W * 0.13;
        const py = H * 0.9;
        const tx = px + 30 + sway;
        const ty = py - H * 0.42;
        ctx.strokeStyle = ink;
        ctx.fillStyle = ink;
        ctx.lineCap = "round";
        ctx.globalAlpha = env * 0.48;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(px - 14, py - H * 0.22, tx, ty);
        ctx.stroke();
        for (let k = 0; k < 7; k += 1) {
          const ang = Math.PI * (1.08 + (k * 0.84) / 6) + Math.sin(t * 0.9 + k) * 0.05;
          const len = 44 + (k % 2) * 10;
          const ex = tx + Math.cos(ang) * len;
          const ey = ty + Math.sin(ang) * len * 0.8 + 16 * Math.abs(Math.cos(ang));
          const nx = -Math.sin(ang);
          const ny = Math.cos(ang);
          const mx = tx + Math.cos(ang) * len * 0.5;
          const my = ty + Math.sin(ang) * len * 0.5 - 12;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.quadraticCurveTo(mx + nx * 7, my + ny * 7, ex, ey);
          ctx.quadraticCurveTo(mx - nx * 7, my - ny * 7, tx, ty);
          ctx.fill();
        }
        ctx.lineCap = "butt";

        // Two gulls gliding past.
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.3;
        ctx.globalAlpha = env * 0.42;
        [0, 1].forEach((g) => {
          const sx = ((t * 28 + g * W * 0.52) % (W + 80)) - 40;
          const sy = H * 0.14 + g * H * 0.08 + Math.sin(t * 0.9 + g * 2) * 6;
          const flap = Math.sin(t * 5 + g) * 4;
          const size = g ? 7 : 9;
          ctx.beginPath();
          ctx.moveTo(sx - size, sy + flap);
          ctx.quadraticCurveTo(sx - size / 2, sy - size * 0.55 - flap, sx, sy);
          ctx.quadraticCurveTo(sx + size / 2, sy - size * 0.55 - flap, sx + size, sy + flap);
          ctx.stroke();
        });
      } else if (scene === "sun") {
        // A sun rises through the card, with slowly turning rays and rings that drift outward.
        const prog = Math.min(1, el / (DURATION * 0.7));
        const rise = 1 - Math.pow(1 - prog, 3);
        const R = Math.min(H * 0.11, 44);
        const cx = W * 0.78;
        const cy = H * 0.78 - rise * H * 0.48;

        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 4.2);
        halo.addColorStop(0, accent);
        halo.addColorStop(1, "transparent");
        ctx.globalAlpha = env * 0.24;
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = accent;
        ctx.strokeStyle = accent;
        ctx.globalAlpha = env * 0.2;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, 6.283);
        ctx.fill();
        ctx.globalAlpha = env * 0.75;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        const rays = 14;
        const rot = t * 0.3;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = env * 0.55;
        ctx.beginPath();
        for (let k = 0; k < rays; k += 1) {
          const ang = rot + (k * 6.283) / rays;
          const outer = R + (k % 2 ? 20 : 27);
          ctx.moveTo(cx + Math.cos(ang) * (R + 9), cy + Math.sin(ang) * (R + 9));
          ctx.lineTo(cx + Math.cos(ang) * outer, cy + Math.sin(ang) * outer);
        }
        ctx.stroke();

        ctx.lineWidth = 1;
        for (let k = 0; k < 2; k += 1) {
          const ph = (t * 0.45 + k * 0.5) % 1;
          ctx.globalAlpha = env * (1 - ph) * 0.3;
          ctx.beginPath();
          ctx.arc(cx, cy, R + 34 + ph * 70, 0, 6.283);
          ctx.stroke();
        }
      } else {
        // A station with a long platform, and a steam train pulling through.
        const u = Math.min(H * 0.15, 50);
        const rail = H * 0.78;
        const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

        // Platform canopy with pillars, lamps and the station board.
        const canopy = rail - 3.3 * u;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = env * 0.3;
        ctx.beginPath();
        ctx.moveTo(0, canopy);
        ctx.lineTo(W, canopy);
        for (let x = 40; x < W; x += 110) {
          ctx.moveTo(x, canopy);
          ctx.lineTo(x, rail - 1.2 * u);
        }
        ctx.stroke();
        ctx.fillStyle = accent;
        ctx.globalAlpha = env * 0.7;
        for (let x = 95; x < W; x += 110) {
          ctx.beginPath();
          ctx.arc(x, canopy + 8, 2.6, 0, 6.283);
          ctx.fill();
        }
        const bx = W * 0.4;
        ctx.strokeStyle = ink;
        ctx.globalAlpha = env * 0.45;
        ctx.strokeRect(bx, canopy + 10, 74, 18);
        ctx.fillStyle = ink;
        ctx.font = `600 10px ${mono}`;
        ctx.textAlign = "center";
        ctx.fillText("KHARAGPUR", bx + 37, canopy + 23);
        ctx.textAlign = "start";

        // Platform edge and track.
        ctx.strokeStyle = ink;
        ctx.globalAlpha = env * 0.35;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, rail - 1.2 * u);
        ctx.lineTo(W, rail - 1.2 * u);
        ctx.stroke();
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, rail);
        ctx.lineTo(W, rail);
        ctx.moveTo(0, rail + 5);
        ctx.lineTo(W, rail + 5);
        for (let x = 0; x < W; x += 14) {
          ctx.moveTo(x, rail + 5);
          ctx.lineTo(x - 4, rail + 14);
        }
        ctx.stroke();

        // The train: engine in front, three coaches behind, travelling left to right.
        const engineW = 2.3 * u;
        const coachW = 2.7 * u;
        const gap = 0.22 * u;
        const length = engineW + 3 * (coachW + gap);
        const head = -length + (W + 2 * length) * Math.min(1, el / (DURATION * 0.92));
        const ex = head - engineW; // engine rear
        const wheel = (cx: number) => {
          ctx.beginPath();
          ctx.arc(cx, rail - 0.2 * u, 0.2 * u, 0, 6.283);
          ctx.stroke();
          const a = cx / (0.2 * u);
          ctx.beginPath();
          ctx.moveTo(cx, rail - 0.2 * u);
          ctx.lineTo(cx + Math.cos(a) * 0.2 * u, rail - 0.2 * u + Math.sin(a) * 0.2 * u);
          ctx.stroke();
        };
        ctx.fillStyle = ink;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.2;

        // Engine: boiler, cab, chimney, headlight.
        ctx.globalAlpha = env * 0.5;
        ctx.fillRect(ex + 0.55 * u, rail - 1.05 * u, 1.75 * u, 0.78 * u);
        ctx.fillRect(ex, rail - 1.25 * u, 0.7 * u, 0.98 * u);
        ctx.fillRect(ex + 1.7 * u, rail - 1.3 * u, 0.22 * u, 0.3 * u);
        ctx.fillRect(ex + 0.55 * u, rail - 1.3 * u, 0.12 * u, 0.28 * u);
        ctx.globalAlpha = env * 0.75;
        for (const w of [0.55, 1.1, 1.65]) wheel(ex + w * u + 0.1 * u);
        ctx.fillStyle = accent;
        ctx.globalAlpha = env * 0.9;
        ctx.fillRect(ex + 0.12 * u, rail - 1.05 * u, 0.3 * u, 0.26 * u);
        ctx.beginPath();
        ctx.arc(ex + engineW + 0.02 * u, rail - 0.72 * u, 0.1 * u, 0, 6.283);
        ctx.fill();

        // Steam trails back from the chimney.
        ctx.fillStyle = ink;
        const chx = ex + 1.81 * u;
        const chy = rail - 1.3 * u;
        for (let k = 0; k < 7; k += 1) {
          const age = (t * 1.3 + k / 7) % 1;
          ctx.globalAlpha = env * (1 - age) * 0.28;
          ctx.beginPath();
          ctx.arc(chx - age * u * 3.2, chy - age * u * 1.5, 3 + age * 9, 0, 6.283);
          ctx.fill();
        }

        // Coaches with lit windows.
        for (let c = 0; c < 3; c += 1) {
          const cx0 = ex - (c + 1) * (coachW + gap);
          ctx.fillStyle = ink;
          ctx.globalAlpha = env * 0.42;
          ctx.fillRect(cx0, rail - 1.2 * u, coachW, 0.95 * u);
          ctx.globalAlpha = env * 0.5;
          ctx.fillRect(cx0 + coachW, rail - 0.62 * u, gap, 0.08 * u);
          ctx.fillStyle = accent;
          ctx.globalAlpha = env * 0.7;
          for (let w = 0; w < 5; w += 1) ctx.fillRect(cx0 + 0.22 * u + w * 0.5 * u, rail - 1.02 * u, 0.3 * u, 0.32 * u);
          ctx.strokeStyle = ink;
          ctx.globalAlpha = env * 0.7;
          wheel(cx0 + 0.45 * u);
          wheel(cx0 + coachW - 0.45 * u);
        }
      }

      if (el < DURATION) raf = requestAnimationFrame(frame);
      else onDone();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [scene, invert, reduced, onDone]);

  // Reduced motion: a still tint instead of particles.
  const tint =
    scene === "snow"
      ? "linear-gradient(to bottom, color-mix(in oklab, var(--ink) 6%, transparent), transparent)"
      : scene === "sun"
        ? "radial-gradient(circle at 78% 35%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 60%)"
        : "linear-gradient(to top, color-mix(in oklab, var(--accent) 10%, transparent), transparent)";

  // Feather the edges so a scene dissolves into the page instead of reading as a box.
  const horizontal = "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)";
  const vertical = "linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)";
  const particles = scene !== "rails";
  const mask = particles ? `${horizontal}, ${vertical}` : horizontal;

  return (
    <div
      ref={wrap}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -z-10 overflow-hidden"
      style={{
        top: band.top,
        height: band.height,
        maskImage: mask,
        WebkitMaskImage: mask,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    >
      {reduced ? <div className="h-full w-full" style={{ background: tint }} /> : <canvas ref={cv} className="h-full w-full" />}
    </div>
  );
}
