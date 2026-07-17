"use client";

import { useRef, useState, useCallback, type KeyboardEvent } from "react";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel: string;
  afterLabel: string;
}

/**
 * Drag-to-compare before/after image slider. Pointer + keyboard driven,
 * mirroring the homepage mockup's Whitney Oaks comparison.
 */
export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  beforeLabel,
  afterLabel,
}: BeforeAfterSliderProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [cut, setCut] = useState(50);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100));
    setCut(p);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setCut((c) => Math.max(4, c - 4));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setCut((c) => Math.min(96, c + 4));
    }
  };

  return (
    <div
      ref={wrapRef}
      className="relative aspect-[4/3] select-none touch-none bg-[#222] rounded-lg overflow-hidden"
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) setFromClientX(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
    >
      {/* Before (full) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={beforeSrc} alt={beforeAlt} className="absolute inset-0 w-full h-full object-cover" />
      {/* After (clipped from the divider rightward) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterSrc}
        alt={afterAlt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 0 0 ${cut}%)` }}
      />

      <span className="absolute bottom-3 left-3 z-[2] text-[11px] font-bold tracking-[0.1em] uppercase bg-[rgba(8,22,12,0.72)] text-white px-3 py-1.5 rounded-md">
        {beforeLabel}
      </span>
      <span className="absolute bottom-3 right-3 z-[2] text-[11px] font-bold tracking-[0.1em] uppercase bg-[rgba(8,22,12,0.72)] text-white px-3 py-1.5 rounded-md">
        {afterLabel}
      </span>

      <div
        role="slider"
        aria-label="Compare before and after"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(cut)}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="absolute top-0 bottom-0 z-[3] w-0.5 bg-white cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-primary-400"
        style={{ left: `${cut}%` }}
      >
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white text-primary-800 flex items-center justify-center text-xs font-extrabold shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
          ⟨ ⟩
        </span>
      </div>
    </div>
  );
}
