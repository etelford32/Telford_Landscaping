"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Phone } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import { CallLink } from "@/components/ContactActions";

/**
 * The contact section on each marketing page, by id. The bar hides while one
 * of these is on screen (so it never competes with the real form) and its
 * second button jumps to whichever one the current page has.
 */
const CONTACT_SECTIONS = ["contact", "portfolio-contact", "bid", "send-plans"];

/**
 * Thumb-reachable call / estimate bar for phones, on every marketing page
 * (mounted once in the marketing layout). It slides in once the top of the
 * page has scrolled away, and steps aside for the contact section and for
 * the open mobile menu, which carries the same two actions.
 */
export default function StickyContactBar() {
  const pathname = usePathname();
  const [scrolledPast, setScrolledPast] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Re-resolve on every navigation: the layout (and this bar) outlives the page.
  useEffect(() => {
    const sections = CONTACT_SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    setTarget(sections[0]?.id ?? null);
    setContactVisible(false);
    if (!sections.length) return;

    const onScreen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target);
          else onScreen.delete(entry.target);
        }
        setContactVisible(onScreen.size > 0);
      },
      { rootMargin: "0px 0px -35% 0px" }
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  const shown = scrolledPast && !contactVisible;
  // Pages without a form of their own send the visitor to the homepage one.
  const estimateHref = target ? `#${target}` : "/#contact";
  const estimateLabel = target === "send-plans" ? "Send Plans" : "Free Estimate";

  return (
    <div
      aria-hidden={!shown}
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 [.nav-menu-open_&]:hidden ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex gap-2 border-t-2 border-primary-800 bg-primary-900/95 backdrop-blur-sm px-3 py-3 shadow-[0_-10px_30px_-12px_rgba(0,0,0,0.55)]">
        <CallLink
          context="sticky-bar"
          variant="bare"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-green-500 px-3 py-3.5 text-[15px] font-bold text-white whitespace-nowrap active:scale-[0.98] transition"
        >
          <Phone className="w-4 h-4 shrink-0" />
          Call {siteConfig.phone}
        </CallLink>
        <Link
          href={estimateHref}
          data-cta="sticky-free-estimate"
          data-cta-location="sticky-bar"
          tabIndex={shown ? undefined : -1}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-3.5 text-[15px] font-bold text-primary-900 whitespace-nowrap active:scale-[0.98] transition"
        >
          {estimateLabel} <ArrowRight className="w-4 h-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
