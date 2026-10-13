"use client";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PlaceScene from "@/components/PlaceScene";
import { sceneFor } from "@/lib/places";

// A place name that plays a short scene behind its card on hover or tap.
// The card is the nearest ancestor marked with data-place-host.
export default function PlaceTag({ text, invert }: { text: string; invert?: boolean }) {
  const scene = sceneFor(text);
  const ref = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState<{ host: HTMLElement; top: number; height: number } | null>(null);
  const done = useCallback(() => setShown(null), []);

  if (!scene) return <>{text}</>;

  const play = () => {
    if (shown) return;
    const tag = ref.current;
    const host = tag?.closest<HTMLElement>("[data-place-host]");
    if (!tag || !host) return;
    // Play in a band of the card around the name, not the whole (possibly tall) card.
    const hr = host.getBoundingClientRect();
    const tr = tag.getBoundingClientRect();
    // Busier scenes use a shorter band so they sit over less text.
    const height = Math.min(hr.height, scene === "beach" || scene === "snow" || scene === "rain" ? 360 : scene === "rails" ? 340 : 400);
    const top = Math.min(Math.max(tr.top - hr.top - 70, 0), hr.height - height);
    setShown({ host, top, height });
  };

  return (
    <>
      <button
        ref={ref}
        type="button"
        className="place-tag"
        aria-label={`${text}. Plays a short scene.`}
        onClick={play}
        onPointerEnter={(e) => e.pointerType === "mouse" && play()}
      >
        {text}
      </button>
      {shown &&
        createPortal(
          <PlaceScene scene={scene} invert={invert} band={{ top: shown.top, height: shown.height }} onDone={done} />,
          shown.host,
        )}
    </>
  );
}
