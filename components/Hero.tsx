"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const roles = [
  "Systems Engineer",
  "Software Developer",
  "AI/ML Engineer",
  "Research Engineer",
];

function RoleCycler() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const target = roles[index];
    if (typing) {
      if (displayed.length < target.length) {
        const t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 65);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 2200);
        return () => clearTimeout(t);
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 38);
        return () => clearTimeout(t);
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIndex((i) => (i + 1) % roles.length);
        setTyping(true);
      }
    }
  }, [displayed, typing, index]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "3.5rem" }}>
      <span style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", color: "#a5b4fc", fontFamily: "monospace", letterSpacing: "0.02em" }}>
        {displayed}
        <span style={{ color: "#2dd4bf", animation: "pulse 1s infinite" }}>|</span>
      </span>
    </div>
  );
}

export default function Hero() {
  const handleScroll = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Animated radial glows */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: "25%", left: "25%", width: 600, height: 600, background: "#4f46e5", borderRadius: "50%", filter: "blur(160px)" }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ position: "absolute", bottom: "25%", right: "25%", width: 500, height: 500, background: "#0d9488", borderRadius: "50%", filter: "blur(160px)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 800, background: "#6d28d9", borderRadius: "50%", filter: "blur(200px)" }}
        />
      </div>

      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.2,
          backgroundImage: "linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "0 1.5rem",
          maxWidth: "56rem",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Available badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1.25rem",
            borderRadius: "999px",
            border: "1px solid rgba(99,102,241,0.3)",
            background: "rgba(99,102,241,0.1)",
            color: "#a5b4fc",
            fontSize: "0.875rem",
            fontFamily: "monospace",
            marginBottom: "2.5rem",
          }}
        >
          <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "#2dd4bf", animation: "pulse 2s infinite" }} />
          Available for new opportunities
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            fontSize: "clamp(3.5rem, 10vw, 7rem)",
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.03em",
            lineHeight: 1.0,
            marginBottom: "0.5rem",
          }}
        >
          Prasanth{" "}
          <span
            style={{
              background: "linear-gradient(to right, #818cf8, #a78bfa, #2dd4bf)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Kasa
          </span>
        </motion.h1>

        {/* Typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ marginBottom: "2.5rem" }}
        >
          <RoleCycler />
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{ marginBottom: "3.5rem" }}
        >
          <p style={{ color: "#94a3b8", fontSize: "clamp(1rem, 2vw, 1.2rem)", lineHeight: 2, maxWidth: "38rem" }}>
            MS CS @ University of Wisconsin-Madison<br />
            IIT Kharagpur Dual Degree
          </p>
          <p style={{ color: "#94a3b8", fontSize: "clamp(1rem, 2vw, 1.2rem)", lineHeight: 1.8, marginTop: "0.75rem" }}>
            Building at the intersection of{" "}
            <span style={{ color: "#c084fc" }}>AI</span>,{" "}
            <span style={{ color: "#2dd4bf" }}>systems</span>, and the{" "}
            <span style={{ color: "#818cf8" }}>physical world</span>.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", justifyContent: "center", marginBottom: "3.5rem" }}
        >
          <button
            onClick={() => handleScroll("#projects")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1rem 2.25rem",
              borderRadius: "999px",
              background: "#4f46e5",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 0 0 0 rgba(79,70,229,0)",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = "#4338ca";
              (e.target as HTMLElement).style.boxShadow = "0 8px 30px rgba(79,70,229,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = "#4f46e5";
              (e.target as HTMLElement).style.boxShadow = "0 0 0 0 rgba(79,70,229,0)";
            }}
          >
            View Projects →
          </button>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1rem 2.25rem",
              borderRadius: "999px",
              border: "1px solid rgba(100,116,139,0.6)",
              color: "#cbd5e1",
              fontWeight: 600,
              fontSize: "1rem",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            Download CV ↗
          </a>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem", color: "#64748b" }}
        >
          <a
            href="https://github.com/prasanth-kps"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            style={{ color: "#64748b", transition: "color 0.2s", display: "flex" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748b")}
          >
            <GitHubIcon />
          </a>
          <a
            href="https://www.linkedin.com/in/penchala-siva-prasanth-kasa-525280216/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            style={{ color: "#64748b", transition: "color 0.2s", display: "flex" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748b")}
          >
            <LinkedInIcon />
          </a>
          <span style={{ width: "1px", height: "1.25rem", background: "#1e293b" }} />
          <a
            href="mailto:pkasa@wisc.edu"
            style={{ color: "#64748b", transition: "color 0.2s", fontSize: "0.9rem", fontFamily: "monospace", textDecoration: "none" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748b")}
          >
            pkasa@wisc.edu
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          color: "#475569",
        }}
      >
        <span style={{ fontSize: "0.7rem", fontFamily: "monospace", letterSpacing: "0.15em", textTransform: "uppercase" }}>scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: "2px", height: "2.5rem", background: "linear-gradient(to bottom, #4f46e5, transparent)", borderRadius: "1px" }}
        />
      </motion.div>
    </section>
  );
}

function GitHubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
