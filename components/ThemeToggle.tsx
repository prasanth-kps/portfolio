"use client";
import { useEffect, useState } from "react";
import { currentTheme, switchTheme, type Theme } from "@/lib/theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  // Follow the attribute so other controls (command bar, terminal) stay in sync.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(currentTheme());
    const obs = new MutationObserver(() => setTheme(currentTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  return (
    <button
      type="button"
      onClick={switchTheme}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="label inline-flex h-9 w-[4.5rem] items-center justify-center border border-line transition-colors duration-200 hover:border-ink hover:text-ink"
    >
      {theme === null ? " " : theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
