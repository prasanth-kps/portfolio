"use client";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

// Entry reveal: fade + 24px rise, once. Used to give sections a shared rhythm.
// `layout` lets the element glide to a new position when the content around it reorders
// (view switches), and `exit` fades it out when it is removed from an AnimatePresence list.
export default function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  id,
  layout,
  exit,
  placeHost,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article";
  id?: string;
  layout?: boolean;
  exit?: boolean;
  placeHost?: boolean;
}) {
  const Tag = motion[as];
  return (
    <Tag
      id={id}
      data-place-host={placeHost ? "" : undefined}
      className={className}
      layout={layout ? "position" : undefined}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={exit ? { opacity: 0, transition: { duration: 0.2 } } : undefined}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: EASE, layout: { duration: 0.6, ease: EASE } }}
    >
      {children}
    </Tag>
  );
}
