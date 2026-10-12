"use client";

export function Slider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  readout,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  readout?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="label">
          {label}
        </label>
        <span className="font-mono text-sm tabular-nums">{readout ?? value}</span>
      </div>
      <input
        id={id}
        name={id}
        type="range"
        className="range mt-1"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  hint,
  delta,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
  delta?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-4 border-b border-line py-4 text-left first:pt-0 last:border-b-0"
    >
      <span
        aria-hidden
        className={`relative mt-1 h-5 w-10 shrink-0 border transition-colors duration-200 ${
          checked ? "border-ink bg-ink" : "border-line"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-3.5 w-3.5 transition-transform duration-200 ${
            checked ? "translate-x-5 bg-bg" : "bg-muted"
          }`}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-semibold leading-tight tracking-tight">{label}</span>
        <span className="mt-1 block text-[0.92rem] leading-snug text-muted">{hint}</span>
      </span>
      {delta && <span className="label shrink-0 pt-1.5 tabular-nums">{delta}</span>}
    </button>
  );
}

export function Btn({
  children,
  onClick,
  variant = "solid",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "solid" | "line";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`label inline-flex h-10 items-center px-5 transition-[background-color,color,transform] duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 ${
        variant === "solid"
          ? "bg-ink !text-bg hover:bg-accent hover:!text-[#14181a]"
          : "border border-ink !text-ink hover:bg-ink hover:!text-bg"
      }`}
    >
      {children}
    </button>
  );
}

// Maps a pointer event to SVG viewBox coordinates.
export function svgPoint(e: { clientX: number; clientY: number; currentTarget: Element }, w: number, h: number) {
  const r = e.currentTarget.getBoundingClientRect();
  return {
    x: Math.min(w, Math.max(0, ((e.clientX - r.left) / r.width) * w)),
    y: Math.min(h, Math.max(0, ((e.clientY - r.top) / r.height) * h)),
  };
}
