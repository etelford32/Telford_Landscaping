"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  HardHat,
  Images,
  LogOut,
  MapPin,
  Menu,
  Phone,
  Shield,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { siteConfig } from "@/lib/siteConfig";
import { serviceGroups } from "@/lib/services";
import { serviceAreas } from "@/lib/serviceAreas";

/* Engraved-style bird silhouette, matching the logo artwork's palette */
function Bird({ delay = "0s" }: { delay?: string }) {
  return (
    <span className="bird-flap block" style={{ animationDelay: delay }}>
      <svg viewBox="0 0 24 14" width="13" height="8" fill="none" stroke="#57534e" strokeWidth="2.4" strokeLinecap="round">
        <path d="M2 10 Q 7 3 12 8" />
        <path d="M12 8 Q 17 3 22 10" />
      </svg>
    </span>
  );
}

const BURST_LEAVES = [
  { leaf: "🍃", dx: "-34px", dy: "-38px", rot: "-80deg", delay: "0s" },
  { leaf: "🍂", dx: "36px", dy: "-32px", rot: "75deg", delay: "0.03s" },
  { leaf: "🌿", dx: "-40px", dy: "4px", rot: "-55deg", delay: "0.05s" },
  { leaf: "🍃", dx: "42px", dy: "0px", rot: "60deg", delay: "0.02s" },
  { leaf: "🍃", dx: "4px", dy: "-46px", rot: "30deg", delay: "0.06s" },
  { leaf: "🍂", dx: "-12px", dy: "34px", rot: "-40deg", delay: "0.04s" },
];

// Top-level links beside the Services menu. Everything here is a page a
// homeowner or a builder would look for; the design app, plant library, and
// account links live at their own URLs and are deliberately not in the menu.
const topLinks = [
  { href: "/portfolio", label: "Our Work", icon: Images, cta: "nav-our-work" },
  { href: "/for-contractors", label: "For Contractors", icon: HardHat, cta: "nav-for-contractors" },
];

type MenuId = "services" | "areas";

const cityLine = siteConfig.cities.join(" · ");

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [burstId, setBurstId] = useState(0);
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Dropdowns open on hover and "pin" on click or keyboard, so a click right
  // after hovering doesn't slam the panel shut, and touch/keyboard users get
  // one that stays put until they dismiss it. Only one is open at a time.
  const pinned = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const servicesButton = useRef<HTMLButtonElement>(null);
  const areasButton = useRef<HTMLButtonElement>(null);
  const servicesOpen = openMenu === "services";
  const areasOpen = openMenu === "areas";

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  const closeMenus = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
    pinned.current = false;
    setOpenMenu(null);
  }, []);

  const hoverOpen = (menu: MenuId) => {
    cancelClose();
    if (openMenu !== menu) pinned.current = false;
    setOpenMenu(menu);
  };

  // A short grace period lets the pointer cross the gap between the button
  // and its panel without the panel closing underneath it.
  const hoverClose = () => {
    if (pinned.current) return;
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 160);
  };

  const toggleMenu = (menu: MenuId) => {
    cancelClose();
    if (openMenu === menu && !pinned.current) {
      pinned.current = true; // opened by hover — the click keeps it open
      return;
    }
    pinned.current = openMenu !== menu;
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const closeAll = useCallback(() => {
    closeMenus();
    setMobileOpen(false);
  }, [closeMenus]);

  // Any navigation closes whatever is open.
  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  // The phone call bar (StickyContactBar) steps aside while this menu is
  // open — the menu leads with the same two actions.
  useEffect(() => {
    document.body.classList.toggle("nav-menu-open", mobileOpen);
    return () => document.body.classList.remove("nav-menu-open");
  }, [mobileOpen]);

  // Escape and outside clicks dismiss whichever dropdown is open.
  useEffect(() => {
    if (!openMenu) return;
    const button = openMenu === "services" ? servicesButton : areasButton;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const focusWasInside = !!document.activeElement?.closest("[data-nav-menu]");
      closeMenus();
      if (focusWasInside) button.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if ((e.target as Element).closest?.("[data-nav-menu]")) return;
      closeMenus();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [openMenu, closeMenus]);

  useEffect(() => cancelClose, []);

  const handleLogout = async () => {
    await logout();
    closeAll();
    router.push("/");
  };

  const servicesActive = serviceGroups.some((g) => g.links.some((l) => l.href === pathname));
  const areasActive = serviceAreas.some((a) => `/${a.slug}` === pathname);

  const linkBase =
    "relative px-3 py-2 rounded-xl text-[15px] font-semibold whitespace-nowrap transition-colors duration-200 flex items-center gap-1";
  const linkIdle = "text-gray-800 hover:bg-primary-50 hover:text-primary-800";
  const linkActive = "text-primary-800 bg-primary-50";

  return (
    <>
      <style jsx global>{`
        @keyframes logoSprout {
          0% { opacity: 0; transform: scale(0.6, 0.25); }
          55% { opacity: 1; transform: scale(1.02, 1.08); }
          75% { transform: scale(1.005, 0.96); }
          100% { opacity: 1; transform: scale(1, 1); }
        }

        @keyframes logoGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4), 0 4px 12px rgba(20, 83, 45, 0.15); }
          50% { box-shadow: 0 0 0 7px rgba(34, 197, 94, 0), 0 4px 16px rgba(22, 163, 74, 0.3); }
        }

        @keyframes logoSway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1.2deg); }
          75% { transform: rotate(-1.2deg); }
        }

        @keyframes birdFlyA {
          0% { opacity: 0; transform: translate(0, 0); }
          2% { opacity: 0.9; }
          20% { opacity: 0.9; transform: translate(64px, -12px); }
          27% { opacity: 0; transform: translate(104px, -18px); }
          100% { opacity: 0; transform: translate(104px, -18px); }
        }

        @keyframes birdFlyB {
          0% { opacity: 0; transform: translate(0, 0) scale(0.85); }
          3% { opacity: 0.8; }
          22% { opacity: 0.8; transform: translate(70px, -6px) scale(0.85); }
          30% { opacity: 0; transform: translate(112px, -14px) scale(0.85); }
          100% { opacity: 0; transform: translate(112px, -14px) scale(0.85); }
        }

        @keyframes birdFlap {
          from { transform: scaleY(1); }
          to { transform: scaleY(0.5); }
        }

        @keyframes burstOut {
          0% { opacity: 0; transform: translate(0, 0) scale(0.4) rotate(0deg); }
          12% { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1.05) rotate(var(--rot)); }
        }

        @keyframes wordmarkIn {
          0% { opacity: 0; transform: translateX(-10px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        .logo-sprout {
          animation: logoSprout 1s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: 50% 100%;
        }

        .logo-glow {
          animation: logoGlow 4s ease-in-out infinite;
        }

        /* Gentle wind sway, pivoting from the trunk base */
        .logo-sway {
          animation: logoSway 6.5s ease-in-out 1.2s infinite;
          transform-origin: 50% 100%;
        }

        .bird-a {
          opacity: 0;
          animation: birdFlyA 16s linear 2.2s infinite;
        }

        .bird-b {
          opacity: 0;
          animation: birdFlyB 19s linear 3.4s infinite;
        }

        .bird-flap {
          animation: birdFlap 0.26s ease-in-out infinite alternate;
        }

        .burst-particle {
          animation: burstOut 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .wordmark-in {
          animation: wordmarkIn 0.6s ease-out 0.4s backwards;
        }
      `}</style>

      {/* Utility bar: where we work and the license, before anything else.
          It scrolls away; the nav below it is what sticks. */}
      <div data-cta-location="top-bar" className="bg-primary-900 text-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-center md:justify-between gap-4 text-[11.5px] sm:text-[12.5px] font-medium tracking-wide">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-primary-300 shrink-0" aria-hidden />
            <span className="truncate">
              <span className="hidden sm:inline">Serving </span>
              {cityLine}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-300" aria-hidden />
            <span>{siteConfig.license} · Bonded &amp; Insured</span>
          </div>
        </div>
      </div>

      <nav
        aria-label="Main"
        data-cta-location="nav"
        className="bg-gradient-to-r from-white via-green-50/30 to-white backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b-2 border-primary-100"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-3">
            {/* Logo: grows from the ground on load, sways in the breeze,
                birds take flight, and clicking it bursts leaves */}
            <Link
              href="/"
              onClick={() => {
                setBurstId((id) => id + 1);
                closeAll();
              }}
              className="flex items-center gap-2 group relative min-w-0"
            >
              {/* shrink-0: without it the overflow-hidden box gets flex-crushed to 0px
                  when the header row runs out of room, collapsing the logo entirely */}
              <div className="logo-sprout shrink-0">
                <div className="logo-sway">
                  <div className="logo-glow relative rounded-xl overflow-hidden ring-2 ring-primary-200/70 transition-transform duration-300 group-hover:scale-110 group-active:scale-90">
                    <Image
                      src="/telford-logo.jpg"
                      alt="Telford Landscaping logo"
                      width={64}
                      height={64}
                      priority
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Birds taking flight from the canopy */}
              <span aria-hidden className="pointer-events-none absolute left-7 sm:left-9 top-1 z-10">
                <span className="bird-a absolute left-0 top-0"><Bird /></span>
                <span className="bird-b absolute left-1 top-3"><Bird delay="0.13s" /></span>
              </span>

              {/* Leaf poof on click; key change remounts and replays the burst */}
              {burstId > 0 && (
                <span key={burstId} aria-hidden className="pointer-events-none absolute left-5 top-5 sm:left-7 sm:top-7 z-10">
                  {BURST_LEAVES.map((p, i) => (
                    <span
                      key={i}
                      className="burst-particle absolute text-base"
                      style={{ "--dx": p.dx, "--dy": p.dy, "--rot": p.rot, animationDelay: p.delay } as CSSProperties}
                    >
                      {p.leaf}
                    </span>
                  ))}
                </span>
              )}
              <div className="relative wordmark-in whitespace-nowrap">
                <div className="text-[17px] sm:text-xl font-bold tracking-tight bg-gradient-to-r from-primary-700 to-green-700 bg-clip-text text-transparent">
                  Telford Landscaping
                </div>
                <div className="text-[11px] sm:text-xs font-medium tracking-wide text-gray-600">
                  Design · Build · Restore
                </div>
              </div>
            </Link>

            {/* ── Desktop: links, phone, and the one primary action ── */}
            <div className="hidden xl:flex items-center gap-1">
              <button
                ref={servicesButton}
                type="button"
                data-nav-menu
                onClick={(e) => {
                  const opening = openMenu !== "services";
                  toggleMenu("services");
                  // Opened from the keyboard (a click with no pointer): the panel sits
                  // after the rest of the row in tab order, so step straight into it.
                  if (opening && e.detail === 0) {
                    requestAnimationFrame(() =>
                      document.querySelector<HTMLElement>("#services-menu a")?.focus()
                    );
                  }
                }}
                onMouseEnter={() => hoverOpen("services")}
                onMouseLeave={hoverClose}
                aria-expanded={servicesOpen}
                aria-controls="services-menu"
                className={`${linkBase} ${servicesOpen || servicesActive ? linkActive : linkIdle}`}
              >
                Services
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>

              {/* Service Areas: one landing page per town */}
              <div
                data-nav-menu
                className="relative"
                onMouseEnter={() => hoverOpen("areas")}
                onMouseLeave={hoverClose}
              >
                <button
                  ref={areasButton}
                  type="button"
                  onClick={() => toggleMenu("areas")}
                  aria-expanded={areasOpen}
                  aria-controls="areas-menu"
                  className={`${linkBase} ${areasOpen || areasActive ? linkActive : linkIdle}`}
                >
                  Service Areas
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${areasOpen ? "rotate-180" : ""}`} aria-hidden />
                </button>
                <div
                  id="areas-menu"
                  className={`absolute left-0 top-full pt-2 w-72 duration-200 ${
                    areasOpen
                ? "visible opacity-100 translate-y-0 transition-[opacity,transform]"
                : "invisible opacity-0 -translate-y-1 pointer-events-none transition-[opacity,transform,visibility]"
                  }`}
                >
                  <div className="bg-white rounded-2xl border-2 border-primary-100 shadow-[0_30px_60px_-24px_rgba(20,83,45,0.45)] p-2">
                    <ul>
                      {serviceAreas.map((a) => (
                        <li key={a.slug}>
                          <Link
                            href={`/${a.slug}`}
                            data-cta={`menu-area-${a.slug}`}
                            onClick={closeAll}
                            aria-current={pathname === `/${a.slug}` ? "page" : undefined}
                            className="group/item flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-primary-50 transition-colors"
                          >
                            <span className="grid place-items-center w-9 h-9 rounded-lg bg-primary-50 text-primary-700 group-hover/item:bg-primary-600 group-hover/item:text-white transition-colors shrink-0">
                              <MapPin className="w-[18px] h-[18px]" aria-hidden />
                            </span>
                            <span className="text-[14.5px] font-semibold text-gray-900 group-hover/item:text-primary-800">
                              {a.city}, CA
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1 px-3 py-2.5 border-t border-earth-200 text-[12.5px] text-gray-500 leading-snug">
                      Nearby in Rocklin, Penryn, or Newcastle? Call or text — we&rsquo;re on the same routes.
                    </p>
                  </div>
                </div>
              </div>

              {topLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-cta={link.cta}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={`${linkBase} ${pathname === link.href ? linkActive : linkIdle}`}
                >
                  {link.label}
                </Link>
              ))}

              <a
                href={siteConfig.phoneHref}
                className="ml-3 flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-xl whitespace-nowrap text-primary-900 hover:bg-primary-50 transition-colors"
              >
                <span className="grid place-items-center w-9 h-9 rounded-full bg-primary-100 text-primary-800">
                  <Phone className="w-4 h-4" aria-hidden />
                </span>
                <span className="leading-tight">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Call or text
                  </span>
                  <span className="block text-[15px] font-bold">{siteConfig.phone}</span>
                </span>
              </a>

              <Link
                href="/#contact"
                data-cta="nav-free-estimate"
                className="btn-3d ml-1.5 inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-green-600 text-white text-[15px] font-bold px-5 py-2.5 rounded-xl whitespace-nowrap"
              >
                Free Estimate <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>

              {/* Only ever visible to a signed-in account (sign-in lives at /login). */}
              {isAuthenticated && (
                <div className="ml-2 pl-2 border-l-2 border-primary-100 flex items-center gap-0.5">
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
                  >
                    <Shield className="w-4 h-4" aria-hidden /> Admin
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Log out"
                    title="Log out"
                    className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              )}
            </div>

            {/* ── Phone / tablet: call and estimate stay in reach beside the menu button ── */}
            <div className="flex xl:hidden items-center gap-1.5 sm:gap-2 shrink-0">
              <a
                href={siteConfig.phoneHref}
                aria-label={`Call or text ${siteConfig.phone}`}
                className="hidden min-[360px]:flex items-center gap-2 h-11 px-3 sm:px-4 rounded-xl font-bold text-[15px] text-primary-900 bg-primary-50 border border-primary-200 whitespace-nowrap active:scale-95 transition"
              >
                <Phone className="w-[18px] h-[18px]" aria-hidden />
                <span className="hidden sm:inline">{siteConfig.phone}</span>
              </a>
              <Link
                href="/#contact"
                data-cta="nav-free-estimate"
                className="hidden md:inline-flex items-center gap-2 h-11 px-4 rounded-xl font-bold text-[15px] text-white bg-gradient-to-r from-primary-600 to-green-600 whitespace-nowrap active:scale-95 transition"
              >
                Free Estimate <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="grid place-items-center w-11 h-11 rounded-xl text-gray-900 hover:bg-primary-50 transition-colors"
              >
                {mobileOpen ? <X className="w-6 h-6" aria-hidden /> : <Menu className="w-6 h-6" aria-hidden />}
              </button>
            </div>
          </div>

          {/* ── Services mega-menu (desktop). Kept mounted so its links are in
              the HTML and its photos are already loaded when it opens. ── */}
          <div
            id="services-menu"
            data-nav-menu
            onMouseEnter={() => hoverOpen("services")}
            onMouseLeave={hoverClose}
            className={`hidden xl:block absolute inset-x-8 top-full pt-2 duration-200 ${
              servicesOpen
                ? "visible opacity-100 translate-y-0 transition-[opacity,transform]"
                : "invisible opacity-0 -translate-y-1 pointer-events-none transition-[opacity,transform,visibility]"
            }`}
          >
            <div className="bg-white rounded-2xl border-2 border-primary-100 shadow-[0_30px_60px_-24px_rgba(20,83,45,0.45)] overflow-hidden">
              <div className="grid grid-cols-3 gap-5 p-5">
                {serviceGroups.map((group) => (
                  <section key={group.id} aria-labelledby={`menu-${group.id}`}>
                    <div className="relative h-32 rounded-xl overflow-hidden mb-2.5">
                      <Image
                        src={group.image}
                        alt={group.imageAlt}
                        fill
                        sizes="400px"
                        className="object-cover"
                        style={{ objectPosition: group.imagePosition }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/10 to-transparent" />
                      <div className="absolute inset-x-3.5 bottom-3 text-white">
                        <h3 id={`menu-${group.id}`} className="text-[16.5px] font-bold leading-tight">
                          {group.title}
                        </h3>
                        <p className="text-[12.5px] text-primary-100">{group.tagline}</p>
                      </div>
                    </div>
                    <ul>
                      {group.links.map((link) => {
                        const Icon = link.icon;
                        return (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              data-cta={link.cta}
                              onClick={closeAll}
                              className="group/item flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-primary-50 transition-colors"
                            >
                              <span className="grid place-items-center w-9 h-9 rounded-lg bg-primary-50 text-primary-700 group-hover/item:bg-primary-600 group-hover/item:text-white transition-colors shrink-0">
                                <Icon className="w-[18px] h-[18px]" aria-hidden />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-[14.5px] font-semibold text-gray-900 group-hover/item:text-primary-800">
                                  {link.label}
                                </span>
                                <span className="block text-[12.5px] text-gray-500 truncate">{link.blurb}</span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>

              <div className="flex items-center justify-between gap-6 bg-earth-50 border-t border-earth-200 px-7 py-3.5">
                <p className="text-[13.5px] text-gray-700">
                  <span className="font-bold text-gray-900">Not sure what the yard needs?</span> We&rsquo;ll walk
                  the property with you and write up a scope and a price.
                </p>
                <div className="flex items-center gap-5 shrink-0">
                  <a
                    href={siteConfig.phoneHref}
                    className="flex items-center gap-1.5 text-[14px] font-bold text-primary-800 hover:underline whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4" aria-hidden /> {siteConfig.phone}
                  </a>
                  <Link
                    href="/#contact"
                    data-cta="menu-free-estimate"
                    onClick={closeAll}
                    className="inline-flex items-center gap-1.5 text-[14px] font-bold text-white bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
                  >
                    Book a free estimate <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile / tablet menu ── */}
          {mobileOpen && (
            <div
              id="mobile-menu"
              className="xl:hidden border-t-2 border-primary-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-6 max-h-[calc(100dvh-7.25rem)] overflow-y-auto overscroll-contain bg-white"
            >
              {/* The two actions that matter, first. From md up the header
                  row already shows both, so they aren't repeated here. */}
              <div className="grid grid-cols-2 gap-2.5 md:hidden">
                <a
                  href={siteConfig.phoneHref}
                  className="flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-primary-200 bg-primary-50 px-3 py-3 text-primary-900"
                >
                  <span className="flex items-center gap-1.5 text-[15px] font-bold">
                    <Phone className="w-4 h-4" aria-hidden /> Call or Text
                  </span>
                  <span className="text-[13px] font-semibold text-primary-800">{siteConfig.phone}</span>
                </a>
                <Link
                  href="/#contact"
                  data-cta="nav-free-estimate"
                  onClick={closeAll}
                  className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-gradient-to-r from-primary-600 to-green-600 px-3 py-3 text-white shadow-md"
                >
                  <span className="flex items-center gap-1.5 text-[15px] font-bold">
                    Free Estimate <ArrowRight className="w-4 h-4" aria-hidden />
                  </span>
                  <span className="text-[13px] font-medium text-primary-50">Written scope &amp; price</span>
                </Link>
              </div>

              {/* Services, grouped — each group headed by a real job photo */}
              <div className="mt-5 md:mt-1 grid grid-cols-1 md:grid-cols-3 gap-5">
                {serviceGroups.map((group) => (
                  <section key={group.id} aria-labelledby={`mobile-menu-${group.id}`}>
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 ring-1 ring-earth-200">
                        <Image src={group.image} alt="" fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h3 id={`mobile-menu-${group.id}`} className="text-[15.5px] font-bold text-gray-900 leading-tight">
                          {group.title}
                        </h3>
                        <p className="text-[12.5px] text-gray-500">{group.tagline}</p>
                      </div>
                    </div>
                    <ul>
                      {group.links.map((link) => {
                        const Icon = link.icon;
                        return (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              data-cta={link.cta}
                              onClick={closeAll}
                              className="flex items-center gap-3 px-2 py-2.5 rounded-xl text-[15px] font-semibold text-gray-800 active:bg-primary-50"
                            >
                              <Icon className="w-[18px] h-[18px] text-primary-600 shrink-0" aria-hidden />
                              {link.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>

              <section aria-labelledby="mobile-menu-areas" className="mt-4 pt-4 border-t border-earth-200">
                <h3 id="mobile-menu-areas" className="flex items-center gap-2 text-[15.5px] font-bold text-gray-900 mb-2">
                  <MapPin className="w-5 h-5 text-primary-700" aria-hidden /> Service Areas
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {serviceAreas.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/${a.slug}`}
                        data-cta={`menu-area-${a.slug}`}
                        onClick={closeAll}
                        className="inline-flex items-center px-4 py-2.5 rounded-full border-[1.5px] border-primary-200 bg-primary-50 text-[14.5px] font-semibold text-primary-900 active:bg-primary-100"
                      >
                        {a.city}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="mt-4 pt-4 border-t border-earth-200 grid grid-cols-1 sm:grid-cols-2 gap-1">
                {topLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      data-cta={link.cta}
                      onClick={closeAll}
                      className="flex items-center gap-3 px-2 py-3 rounded-xl text-[15.5px] font-bold text-gray-900 active:bg-primary-50"
                    >
                      <Icon className="w-5 h-5 text-primary-700 shrink-0" aria-hidden />
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {isAuthenticated && (
                <div className="mt-3 pt-3 border-t border-earth-200 flex items-center gap-2">
                  <Link
                    href="/admin"
                    onClick={closeAll}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-purple-700 active:bg-purple-50"
                  >
                    <Shield className="w-4 h-4" aria-hidden /> Admin
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 active:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" aria-hidden /> Log out
                  </button>
                </div>
              )}

              <p className="mt-4 flex items-start gap-2 text-[12.5px] text-gray-500 leading-snug">
                <ShieldCheck className="w-4 h-4 text-primary-600 shrink-0 mt-px" aria-hidden />
                <span>
                  {siteConfig.license} · Bonded &amp; Insured · Serving {siteConfig.cities.slice(0, -1).join(", ")} and{" "}
                  {siteConfig.cities[siteConfig.cities.length - 1]}
                </span>
              </p>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
