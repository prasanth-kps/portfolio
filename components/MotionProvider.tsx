"use client";
import { MotionConfig } from "framer-motion";

// Honors prefers-reduced-motion for every transform animation on the page.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
