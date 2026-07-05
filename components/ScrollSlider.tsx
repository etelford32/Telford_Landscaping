"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function ScrollSlider() {
  const [pct, setPct] = useState(0);
  const [maxScroll, setMaxScroll] = useState(1);
  const [visible, setVisible] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const recalc = useCallback(() => {
    const ms = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    setMaxScroll(ms);
    setPct((window.scrollY / ms) * 100);
    setVisible(ms > 100);
  }, []);

  useEffect(() => {
    recalc();
    window.addEventListener("scroll", recalc, { passive: true });
    window.addEventListener("resize", recalc, { passive: true });
    return () => {
      window.removeEventListener("scroll", recalc);
      window.removeEventListener("resize", recalc);
    };
  }, [recalc]);

  const scrollTo = (newPct: number) => {
    const clamped = Math.min(100, Math.max(0, newPct));
    window.scrollTo({ top: (clamped / 100) * maxScroll, behavior: "auto" });
    setPct(clamped);
  };

  const nudge = (dir: 1 | -1) => {
    window.scrollBy({ top: dir * window.innerHeight * 0.75, behavior: "smooth" });
  };

  // Map a pointer's Y position onto the track: grabbing the top of the track
  // is the top of the page, dragging down scrolls down — never inverted.
  const pctFromPointer = (clientY: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    return ((clientY - rect.top) / rect.height) * 100;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    scrollTo(pctFromPointer(e.clientY));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingRef.current) scrollTo(pctFromPointer(e.clientY));
  };

  const endDrag = () => {
    draggingRef.current = false;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step =
      e.key === "ArrowDown" ? 3 :
      e.key === "ArrowUp" ? -3 :
      e.key === "PageDown" ? 15 :
      e.key === "PageUp" ? -15 : null;
    if (step !== null) {
      e.preventDefault();
      scrollTo(pct + step);
    } else if (e.key === "Home") {
      e.preventDefault();
      scrollTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      scrollTo(100);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed right-3 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-2 select-none"
      style={{ height: "260px" }}
    >
      {/* Up button */}
      <button
        onClick={() => nudge(-1)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/25 text-white/75 hover:text-white hover:bg-black/70 hover:border-white/50 transition-all active:scale-90 shadow-lg flex-shrink-0"
        aria-label="Scroll up"
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>

      {/* Vertical track + thumb — custom pointer drag: the native vertical
          range input (writing-mode + direction:rtl) tracked opposite to the
          mouse, so we position from the pointer directly */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Page scroll position"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
        className="relative flex-1 flex items-center justify-center w-8 cursor-pointer touch-none"
      >
        {/* Track */}
        <div className="absolute inset-x-0 mx-auto w-1 rounded-full bg-white/15 h-full" />
        {/* Fill */}
        <div
          className="absolute inset-x-0 mx-auto w-1 rounded-full bg-primary-500/70 top-0 transition-all duration-75"
          style={{ height: `${pct}%` }}
        />
        {/* Visible thumb */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-primary-500 shadow-lg transition-all duration-75 pointer-events-none"
          style={{ top: `calc(${pct}% - 8px)` }}
        />
      </div>

      {/* Down button */}
      <button
        onClick={() => nudge(1)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/25 text-white/75 hover:text-white hover:bg-black/70 hover:border-white/50 transition-all active:scale-90 shadow-lg flex-shrink-0"
        aria-label="Scroll down"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {/* Percentage tooltip */}
      <div className="text-white/40 text-xs font-mono tabular-nums">
        {Math.round(pct)}%
      </div>
    </div>
  );
}
