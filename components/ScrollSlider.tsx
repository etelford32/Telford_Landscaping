"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronUp, ChevronDown, MousePointer2 } from "lucide-react";

export default function ScrollSlider() {
  const [pct, setPct] = useState(0);
  const [maxScroll, setMaxScroll] = useState(1);
  const [visible, setVisible] = useState(false);

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

  if (!visible) return null;

  return (
    <div
      className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 select-none"
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

      {/* Vertical track + thumb */}
      <div className="relative flex-1 flex items-center justify-center w-8">
        {/* Track */}
        <div className="absolute inset-x-0 mx-auto w-1 rounded-full bg-white/15 h-full" />
        {/* Fill */}
        <div
          className="absolute inset-x-0 mx-auto w-1 rounded-full bg-primary-500/70 top-0 transition-all duration-75"
          style={{ height: `${pct}%` }}
        />
        {/* Native range input — rotated */}
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={pct}
          onChange={(e) => scrollTo(Number(e.target.value))}
          className="absolute opacity-0 cursor-pointer"
          style={{
            writingMode: "vertical-lr",
            direction: "rtl",
            width: "100%",
            height: "100%",
            WebkitAppearance: "slider-vertical",
          }}
          aria-label="Page scroll position"
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
