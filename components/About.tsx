"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Container } from "@/components/SectionWrapper";

const stats = [
  { value: "Top 0.018%", label: "IIT JEE Mains 2018", sub: "Rank 23 / 125,000" },
  { value: "Top 0.5%", label: "IIT JEE Advanced 2018", sub: "Rank 1318 / 230,000" },
  { value: "Top 1%", label: "GATE 2022", sub: "Rank 1250 nationally" },
  { value: "2+ yrs", label: "Industry Experience", sub: "Enphase Energy" },
];

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" ref={ref} style={{ paddingTop: "10rem", paddingBottom: "10rem" }}>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "5rem" }}
        >
          <span className="text-indigo-400 font-mono text-sm tracking-widest uppercase">About</span>
          <h2 style={{ marginTop: "1rem", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: "white", lineHeight: 1.1 }}>
            Who I Am
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "5rem", alignItems: "center" }}>
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            {[
              <>I&apos;m a computer science graduate student at <span style={{ color: "#818cf8", fontWeight: 500 }}>University of Wisconsin-Madison</span>, with a dual degree (Bachelors + Masters) from <span style={{ color: "#2dd4bf", fontWeight: 500 }}>IIT Kharagpur</span> in Electronics and Electrical Communication Engineering.</>,
              <>My work spans the full stack — from writing C/C++ software that runs on Enphase solar microinverters, to building systems that transmit data through sound. I&apos;m most at home in the space where <span style={{ color: "#c084fc", fontWeight: 500 }}>hardware meets intelligence</span>.</>,
              <>Currently a <span style={{ color: "#818cf8", fontWeight: 500 }}>Graduate Teaching Assistant for CS 640 (Computer Networks)</span> at UW-Madison.<span style={{ color: "#2dd4bf", fontWeight: 500 }}></span></>,
            ].map((text, i) => (
              <p key={i} style={{ color: "#cbd5e1", fontSize: "1.1rem", lineHeight: 1.9 }}>{text}</p>
            ))}

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.25rem", paddingTop: "0.5rem" }}>
              <a href="mailto:pkasa@wisc.edu" style={{ color: "#818cf8", fontWeight: 500, fontSize: "1rem", textDecoration: "none" }}>
                pkasa@wisc.edu ↗
              </a>
              <span style={{ color: "#1e293b" }}>·</span>
              <span style={{ color: "#94a3b8", fontSize: "1rem" }}>+1 (608) 236-3062</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="group"
                style={{
                  position: "relative",
                  padding: "2rem",
                  borderRadius: "1rem",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  transition: "all 0.3s",
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.07), rgba(20,184,166,0.07))" }}
                />
                <div style={{ position: "relative" }}>
                  <div style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    background: "linear-gradient(to right, #818cf8, #2dd4bf)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1.2,
                  }}>
                    {s.value}
                  </div>
                  <div style={{ marginTop: "0.75rem", color: "white", fontSize: "0.875rem", fontWeight: 600 }}>{s.label}</div>
                  <div style={{ marginTop: "0.375rem", color: "#64748b", fontSize: "0.75rem" }}>{s.sub}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
