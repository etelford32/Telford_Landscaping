"use client";

import { useEffect, useState } from "react";
import { Phone, Mail } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import { CallLink, EmailLink } from "@/components/ContactActions";

/**
 * Thumb-reachable call/email bar for phones — where most of this page's
 * traffic reads it. Slides in once the hero has scrolled away and hides again
 * while the real contact section is on screen, so the two never compete.
 */
export default function StickyContactBar({
  /** Element id of the page's contact section. */
  hideNear = "portfolio-contact",
}: {
  hideNear?: string;
}) {
  const [scrolledPast, setScrolledPast] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const target = document.getElementById(hideNear);
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => setContactVisible(entry.isIntersecting),
      { rootMargin: "0px 0px -35% 0px" }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [hideNear]);

  const shown = scrolledPast && !contactVisible;

  return (
    <div
      aria-hidden={!shown}
      className={`md:hidden fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex gap-2 border-t-2 border-primary-800 bg-primary-900/95 backdrop-blur-sm px-3 py-3 shadow-[0_-10px_30px_-12px_rgba(0,0,0,0.55)]">
        <CallLink
          context="sticky-bar"
          variant="bare"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-green-500 px-4 py-3.5 text-[15px] font-bold text-white active:scale-[0.98] transition"
        >
          <Phone className="w-4 h-4" /> Call {siteConfig.phone}
        </CallLink>
        <EmailLink
          context="sticky-bar"
          variant="bare"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-[15px] font-bold text-primary-900 active:scale-[0.98] transition"
        >
          <Mail className="w-4 h-4" /> Email
        </EmailLink>
      </div>
    </div>
  );
}
