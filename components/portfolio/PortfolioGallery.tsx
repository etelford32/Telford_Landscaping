"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Maximize2, Phone, Mail } from "lucide-react";
import { categories, type Category, type Project } from "@/lib/portfolio";
import { siteConfig } from "@/lib/siteConfig";
import { CallLink, EmailLink } from "@/components/ContactActions";
import { trackEvent } from "@/lib/analytics";

/**
 * Filterable gallery of completed work, with a full-screen lightbox.
 *
 * Every path through it ends at a phone number or an email address: the cards
 * open the lightbox, the lightbox carries a call/email pair pre-filled with
 * that project's name, and the grid closes on a CTA tile.
 */
export default function PortfolioGallery({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState<Category>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const visible = useMemo(
    () => (category === "All" ? projects : projects.filter((p) => p.category === category)),
    [projects, category]
  );

  const active = openIndex === null ? null : visible[openIndex] ?? null;

  const open = (index: number) => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setOpenIndex(index);
    trackEvent("portfolio_project_view", { project: visible[index]?.slug ?? "" });
  };

  const close = useCallback(() => setOpenIndex(null), []);

  const step = useCallback(
    (delta: number) =>
      setOpenIndex((i) => (i === null ? i : (i + delta + visible.length) % visible.length)),
    [visible.length]
  );

  // Keyboard: Esc closes, arrows page through the filtered set.
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, close, step]);

  // Lock the page behind the modal, and move focus in and back out again.
  useEffect(() => {
    if (openIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [openIndex]);

  return (
    <>
      {/* ── Filter bar — sticks under the 80px nav ── */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-sm border-y border-earth-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div
            role="group"
            aria-label="Filter projects by type"
            className="flex gap-2.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center"
          >
            {categories.map((c) => {
              const count = c === "All" ? projects.length : projects.filter((p) => p.category === c).length;
              const selected = c === category;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setCategory(c);
                    setOpenIndex(null);
                  }}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-[14px] font-semibold border-[1.5px] transition ${
                    selected
                      ? "bg-primary-700 border-primary-700 text-white shadow-[0_6px_16px_-8px_rgba(20,83,45,0.8)]"
                      : "bg-white border-earth-200 text-gray-700 hover:border-primary-300 hover:text-primary-800"
                  }`}
                >
                  {c}
                  <span className={selected ? "text-primary-200 ml-1.5" : "text-gray-400 ml-1.5"}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {visible.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => open(i)}
              aria-label={`View project: ${p.title}`}
              className="group text-left bg-white border-2 border-earth-300 rounded-2xl p-2.5 shadow-[0_10px_26px_-16px_rgba(20,26,18,0.3)] hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-18px_rgba(20,83,45,0.35)] transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-600/30"
            >
              <div className="relative overflow-hidden rounded-lg shadow-[0_0_0_1px_#e8dcc4]">
                <Image
                  src={p.image}
                  alt={p.alt}
                  width={800}
                  height={600}
                  sizes="(max-width: 768px) 92vw, (max-width: 1024px) 46vw, 31vw"
                  priority={i < 3}
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary-900 px-3 py-1 rounded-full text-[11.5px] font-bold tracking-wide">
                  {p.category}
                </span>
                <span className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-primary-900/85 text-white px-3 py-1.5 rounded-full text-[12px] font-semibold opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition">
                  <Maximize2 className="w-3.5 h-3.5" /> View full size
                </span>
              </div>

              <div className="px-3 pt-4 pb-3">
                <h3 className="text-[19px] font-bold text-gray-900 group-hover:text-primary-700 transition">
                  {p.title}
                </h3>
                {(p.location || p.year) && (
                  <div className="flex items-center gap-3 mt-1.5 text-[12.5px] font-medium text-gray-500">
                    {p.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary-600" /> {p.location}
                      </span>
                    )}
                    {p.year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary-600" /> {p.year}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-[14.5px] text-gray-600 mt-2 leading-relaxed">{p.tagline}</p>
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  {p.specs.map((s) => (
                    <span
                      key={s}
                      className="bg-primary-50 text-primary-800 px-2.5 py-1 rounded-full text-[11.5px] font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}

          {/* Closing tile — the grid itself ends on an ask. */}
          <div className="flex flex-col justify-center rounded-2xl border-2 border-dashed border-primary-300 bg-gradient-to-br from-primary-50 to-earth-50 p-7 text-center">
            <h3 className="text-[20px] font-extrabold text-gray-900 leading-snug">
              Want one of these on your property?
            </h3>
            <p className="text-[14.5px] text-gray-600 mt-2.5 mb-5 leading-relaxed">
              Call or text and we&rsquo;ll walk the property with you. Free estimate, written scope, no
              pressure.
            </p>
            <div className="flex flex-col gap-2.5">
              <CallLink context="grid-tile" variant="solid" className="w-full !px-5 text-[15px]" />
              <EmailLink context="grid-tile" variant="outline" className="w-full !px-5 text-[15px]">
                <Mail className="w-4 h-4 flex-shrink-0" /> Email us
              </EmailLink>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${active.title} — project detail`}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          className="fixed inset-0 z-[60] bg-primary-900/90 backdrop-blur-sm overflow-y-auto animate-fade-in"
        >
          <div className="min-h-full flex items-start lg:items-center justify-center p-3 sm:p-6">
            <div className="relative w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-2xl animate-scale-in lg:aspect-[2/1] lg:max-h-[86vh]">
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close project detail"
                className="absolute top-3 right-3 z-10 w-11 h-11 rounded-full bg-white/95 border border-earth-200 text-gray-800 flex items-center justify-center shadow-lg hover:bg-primary-50 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] lg:h-full">
                {/* Photo + paging */}
                <div className="relative bg-primary-900 flex items-center justify-center lg:h-full">
                  <Image
                    src={active.image}
                    alt={active.alt}
                    width={1600}
                    height={1200}
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="w-full h-auto max-h-[58vh] lg:max-h-full object-contain"
                  />
                  {visible.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => step(-1)}
                        aria-label="Previous project"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-primary-900 flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => step(1)}
                        aria-label="Next project"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-primary-900 flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-primary-900/80 text-white text-[12px] font-semibold px-3 py-1 rounded-full">
                        {(openIndex ?? 0) + 1} / {visible.length}
                      </span>
                    </>
                  )}
                </div>

                {/* Story + the ask — detail scrolls, the CTA stays pinned */}
                <div className="flex flex-col lg:h-full lg:min-h-0">
                  <div className="p-6 sm:p-8 lg:flex-1 lg:overflow-y-auto">
                    <div className="text-[11.5px] font-bold tracking-[0.18em] uppercase text-primary-700 mb-2.5">
                      {active.category}
                    </div>
                    <h2 className="text-[26px] font-extrabold tracking-tight text-gray-900 leading-tight">
                      {active.title}
                    </h2>
                    {(active.location || active.year) && (
                      <div className="flex items-center gap-4 mt-2 text-[13px] font-medium text-gray-500">
                        {active.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-primary-600" /> {active.location}
                          </span>
                        )}
                        {active.year && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-primary-600" /> {active.year}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-[15.5px] text-gray-700 leading-relaxed mt-4">
                      {active.description}
                    </p>

                    <h3 className="text-[12px] font-bold tracking-[0.16em] uppercase text-gray-500 mt-7 mb-3">
                      How it was built
                    </h3>
                    <ul className="space-y-2 border-t border-earth-200 pt-3.5">
                      {active.details.map((d) => (
                        <li key={d} className="flex items-start gap-2.5 text-[14.5px] text-gray-700">
                          <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-primary-600 flex-shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-1.5 mt-6">
                      {active.specs.map((sp) => (
                        <span
                          key={sp}
                          className="bg-primary-50 text-primary-800 px-2.5 py-1 rounded-full text-[11.5px] font-semibold"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t-2 border-earth-200 bg-gradient-to-br from-primary-50/70 to-earth-50 p-5 sm:px-8 sm:py-6">
                    <p className="text-[15px] font-bold text-gray-900 mb-1">
                      Want something like this built?
                    </p>
                    <p className="text-[13.5px] text-gray-600 mb-4">
                      Call or text {siteConfig.phone} — or send the details and we&rsquo;ll come look
                      at the property.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <CallLink
                        context={`lightbox:${active.slug}`}
                        variant="solid"
                        className="flex-1 !px-5 text-[15px] whitespace-nowrap"
                      >
                        <Phone className="w-4 h-4 flex-shrink-0" /> Call or text
                      </CallLink>
                      <EmailLink
                        context={`lightbox:${active.slug}`}
                        project={active.title}
                        variant="outline"
                        className="flex-1 !px-5 text-[15px] whitespace-nowrap"
                      >
                        <Mail className="w-4 h-4 flex-shrink-0" /> Email about this
                      </EmailLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
