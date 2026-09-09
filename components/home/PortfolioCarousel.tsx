"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Slide {
  src: string;
  alt: string;
  title: string;
  meta: string;
}

/**
 * Horizontal snap-scroll carousel of recent hand-built work, with prev/next
 * controls and clickable dot indicators — the homepage mockup's "Recent Work".
 */
export default function PortfolioCarousel({ slides }: { slides: Slide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const recomputeActive = () => {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    slideRefs.current.forEach((s, i) => {
      if (!s) return;
      const mid = s.offsetLeft + s.offsetWidth / 2;
      const d = Math.abs(mid - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recomputeActive);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    recomputeActive();
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToIndex = (i: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, i));
    slideRefs.current[clamped]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  return (
    <div className="relative mt-12">
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <figure
            key={s.src}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="flex-[0_0_min(560px,82%)] snap-center"
          >
            <div className="frame-earth pt-2.5 px-2.5">
              <div className="overflow-hidden rounded-lg">
                <Image
                  src={s.src}
                  alt={s.alt}
                  width={720}
                  height={540}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              {/* Stacks on phones — project titles are too long to sit beside
                  the meta line at a single-column slide width. */}
              <figcaption className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-0.5 sm:gap-4 px-1.5 pt-3.5 pb-3">
                <span className="text-[15px] font-semibold text-gray-900">{s.title}</span>
                <span className="text-[12.5px] font-medium text-gray-500 sm:whitespace-nowrap">
                  {s.meta}
                </span>
              </figcaption>
            </div>
          </figure>
        ))}
      </div>

      {/* prev / next */}
      <div className="pointer-events-none absolute top-[38%] left-0 right-0 flex justify-between px-0.5">
        <button
          onClick={() => scrollToIndex(active - 1)}
          aria-label="Previous project"
          className="pointer-events-auto w-12 h-12 rounded-full border border-earth-200 bg-white text-primary-800 text-lg font-bold shadow-[0_8px_20px_-10px_rgba(20,26,18,0.4)] hover:bg-primary-50 hover:scale-105 transition"
        >
          ←
        </button>
        <button
          onClick={() => scrollToIndex(active + 1)}
          aria-label="Next project"
          className="pointer-events-auto w-12 h-12 rounded-full border border-earth-200 bg-white text-primary-800 text-lg font-bold shadow-[0_8px_20px_-10px_rgba(20,26,18,0.4)] hover:bg-primary-50 hover:scale-105 transition"
        >
          →
        </button>
      </div>

      {/* dots */}
      <div className="flex justify-center gap-2.5 mt-1.5">
        {slides.map((s, i) => (
          <button
            key={s.src}
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to project ${i + 1}`}
            className={`w-2 h-2 rounded-full transition ${
              i === active ? "bg-primary-700 scale-125" : "bg-earth-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
