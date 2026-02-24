"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Container } from "@/components/SectionWrapper";

const links = [
  {
    label: "GitHub", href: "https://github.com/prasanth-kps", description: "See my code", color: "#e2e8f0",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" /></svg>,
  },
  {
    label: "LinkedIn", href: "https://www.linkedin.com/in/penchala-siva-prasanth-kasa-525280216/", description: "Connect with me", color: "#0ea5e9",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  },
  {
    label: "Email", href: "mailto:pkasa@wisc.edu", description: "pkasa@wisc.edu", color: "#a78bfa",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  },
  {
    label: "Resume", href: "/resume.pdf", description: "Download PDF", color: "#34d399",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  },
];

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="contact" ref={ref} className="relative py-40">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-indigo-700/10 rounded-full blur-[140px]" />
      </div>

      <Container>
        <div className="text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <span className="text-indigo-400 font-mono text-sm tracking-widest uppercase">Get In Touch</span>
            <h2 style={{ marginTop: "0.5rem", marginBottom: "1.5rem", fontSize: "clamp(3rem, 6vw, 4.5rem)", fontWeight: 700, color: "white" }}>Let&apos;s Connect</h2>
            <p style={{ color: "#94a3b8", fontSize: "1.25rem", lineHeight: 1.9, maxWidth: "40rem", marginLeft: "auto", marginRight: "auto" }}>
              I&apos;m open to research collaborations, full-time opportunities, and interesting conversations about systems, AI, and whatever sits in between.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              marginTop: "4rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: "1.75rem",
            }}
          >
            {links.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") || link.href.endsWith(".pdf") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.07 }}
                whileHover={{ y: -6, scale: 1.02 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1.25rem",
                  padding: "2.5rem 1.5rem",
                  borderRadius: "1.5rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(5px)",
                  WebkitBackdropFilter: "blur(5px)",
                  textDecoration: "none",
                  transition: "all 0.3s",
                }}
              >
                <div style={{ padding: "1rem", borderRadius: "1rem", backgroundColor: `${link.color}18`, color: link.color, display: "flex" }}>
                  {link.icon}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "white", fontWeight: 600, fontSize: "1.05rem" }}>{link.label}</div>
                  <div style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.35rem" }}>{link.description}</div>
                </div>
                <span style={{ fontSize: "0.8rem", color: "#475569" }}>↗</span>
              </motion.a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            style={{ marginTop: "6rem", paddingTop: "2.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", color: "#475569", fontSize: "0.875rem" }}
          >
            <p>Designed &amp; built by{" "}
              <span style={{ background: "linear-gradient(to right, #818cf8, #2dd4bf)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 500 }}>
                Prasanth Kasa
              </span>{" "}· {new Date().getFullYear()}
            </p>
            <p style={{ marginTop: "0.5rem", color: "#334155", fontSize: "0.75rem", fontFamily: "monospace" }}>Next.js · Tailwind CSS · Framer Motion</p>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
