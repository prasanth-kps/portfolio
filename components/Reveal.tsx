"use client";
import { motion } from "framer-motion";

// Entry reveal: fade + 24px rise, once. Used to give sections a shared rhythm.
export default function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  id,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article";
  id?: string;
}) {
  const Tag = motion[as];
  return (
    <Tag
      id={id}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}
