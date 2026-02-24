"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulseSpeed: number;
  pulseOffset: number;
  color: string;
  isBright: boolean;
}

const COLORS = [
  "255, 255, 255",    // pure white
  "200, 210, 255",    // cool blue-white
  "139, 92, 246",     // indigo/violet
  "99, 102, 241",     // indigo
  "45, 212, 191",     // teal
];

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const COUNT = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 10000), 120);

    particles.current = Array.from({ length: COUNT }, () => {
      const isBright = Math.random() < 0.18; // ~18% are prominent glowing stars
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: isBright
          ? Math.random() * 1.8 + 2.0   // bright stars: 2.0–3.8px
          : Math.random() * 1.4 + 0.9,  // normal stars: 0.9–2.3px
        opacity: isBright
          ? Math.random() * 0.3 + 0.65  // bright: 0.65–0.95
          : Math.random() * 0.45 + 0.35, // normal: 0.35–0.8
        pulseSpeed: Math.random() * 0.018 + 0.006,
        pulseOffset: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        isBright,
      };
    });

    let t = 0;
    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const p = particles.current;
      for (let i = 0; i < p.length; i++) {
        const particle = p[i];

        // Mouse repulsion
        const dx = particle.x - mouse.current.x;
        const dy = particle.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const force = (130 - dist) / 130;
          particle.vx += (dx / dist) * force * 0.3;
          particle.vy += (dy / dist) * force * 0.3;
        }

        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Connection lines between close particles
        for (let j = i + 1; j < p.length; j++) {
          const other = p[j];
          const ex = particle.x - other.x;
          const ey = particle.y - other.y;
          const d = Math.sqrt(ex * ex + ey * ey);
          if (d < 110) {
            const alpha = (1 - d / 110) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Draw star
        const pulse = Math.sin(t * particle.pulseSpeed * 100 + particle.pulseOffset);
        const opacity = Math.min(1, Math.max(0, particle.opacity + pulse * 0.18));

        if (particle.isBright) {
          // Glow halo for bright stars
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(${particle.color}, ${opacity * 0.7})`;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particle.color}, ${opacity})`;
        ctx.fill();

        if (particle.isBright) {
          ctx.shadowBlur = 0;
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.9 }}
    />
  );
}
