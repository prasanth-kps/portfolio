"use client";
import { useView } from "@/components/ViewProvider";
import { views } from "@/data/views";

// Segmented control. Each option re-tailors the whole page for that kind of reader.
export default function ViewSwitch({ className = "inline-flex" }: { className?: string }) {
  const { view, setView } = useView();
  return (
    <div role="group" aria-label="View this site as" className={`border border-line ${className}`}>
      {views.map((v) => {
        const on = view === v.id;
        return (
          <button
            key={v.id}
            type="button"
            aria-pressed={on}
            onClick={() => setView(v.id)}
            className={`label h-9 px-3.5 transition-colors duration-200 ${
              on ? "bg-ink !text-bg" : "hover:!text-ink"
            }`}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
