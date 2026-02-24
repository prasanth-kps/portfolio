"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Container } from "@/components/SectionWrapper";

const achievements = [
  { title: "IIT JEE Mains 2018", rank: "23", total: "125,000 candidates", percentile: "Top 0.018%", description: "Nationally ranked 23rd among 125,000 candidates for IIT JEE Mains Paper-II", color: "#f59e0b", emoji: "🏆" },
  { title: "IIT JEE Advanced 2018", rank: "1318", total: "230,000 candidates", percentile: "Top 0.5%", description: "Ranked 1318 among 230,000 candidates — earned admission to IIT Kharagpur", color: "#6366f1", emoji: "🎯" },
  { title: "GATE 2022", rank: "1250", total: "Nationwide exam", percentile: "Top 1%", description: "Graduate Aptitude Test in Engineering — nationally ranked 1250", color: "#14b8a6", emoji: "📐" },
  { title: "MADHACKS 2025", rank: "Winner", total: "UW Madison", percentile: "NoFi Project", description: "Built a peer-to-peer audio mesh network at the UW-Madison hackathon", color: "#ec4899", emoji: "⚡" },
];

function AnimatedNumber({ target, inView }: { target: string; inView: boolean }) {
  const [display, setDisplay] = useState("0");
  const numeric = parseInt(target.replace(/,/g, ""));
  useEffect(() => {
    if (!inView || isNaN(numeric)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(target); return;
    }
    let start = 0;
    const inc = numeric / (1200 / 16);
    const t = setInterval(() => {
      start += inc;
      if (start >= numeric) { setDisplay(numeric.toLocaleString()); clearInterval(t); }
      else setDisplay(Math.floor(start).toLocaleString());
    }, 16);
    return () => clearInterval(t);
  }, [inView, numeric, target]);
  return <>{display}</>;
}

export default function Achievements() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="achievements" ref={ref} style={{ paddingTop: "10rem", paddingBottom: "10rem", position: "relative" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-amber-600/6 rounded-full blur-[140px]" />
      </div>

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "5rem" }}
        >
          <span className="text-indigo-400 font-mono text-sm tracking-widest uppercase">Recognition</span>
          <h2 style={{ marginTop: "1rem", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: "white", lineHeight: 1.1 }}>Achievements</h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "1.5rem" }}>
          {achievements.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group"
              style={{
                position: "relative",
                borderRadius: "1.25rem",
                border: `1px solid ${a.color}30`,
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(5px)",
                WebkitBackdropFilter: "blur(5px)",
                overflow: "hidden",
                transition: "box-shadow 0.3s",
              }}
            >
              {/* Colored top bar */}
              <div style={{ height: "3px", background: `linear-gradient(to right, ${a.color}, ${a.color}55)` }} />

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top left, ${a.color}18, transparent 70%)` }}
              />

              <div style={{ padding: "1.5rem", position: "relative" }}>
                {/* Icon + badge row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <span style={{ fontSize: "1.5rem" }}>{a.emoji}</span>
                  <span style={{
                    fontSize: "0.65rem", fontFamily: "monospace",
                    padding: "0.25rem 0.6rem", borderRadius: "999px",
                    backgroundColor: `${a.color}18`, color: a.color,
                    border: `1px solid ${a.color}35`,
                    letterSpacing: "0.03em",
                  }}>
                    {a.percentile}
                  </span>
                </div>

                {/* Rank */}
                <div style={{ fontSize: "2.5rem", fontWeight: 900, lineHeight: 1, marginBottom: "0.5rem", color: a.color }}>
                  <AnimatedNumber target={a.rank} inView={inView} />
                </div>

                {/* Title */}
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "white", marginBottom: "0.25rem" }}>{a.title}</div>

                {/* Subtitle */}
                <div style={{ fontSize: "0.75rem", color: "#475569", marginBottom: "0.875rem" }}>{a.total}</div>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "0.875rem" }} />

                {/* Description */}
                <p style={{ fontSize: "0.775rem", color: "#94a3b8", lineHeight: 1.65 }}>{a.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
