"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type CSSProperties } from "react";
import {
  Menu,
  X,
  TreePine,
  LogOut,
  User,
  Palette,
  Camera,
  Mail,
  Shield,
  Sparkles,
  Sprout,
  Droplets,
  BookOpen,
  Phone,
  ChevronDown,
  Flame,
  Leaf,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/siteConfig";

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

// Specialty / lead pages, grouped under a "Services" dropdown on desktop.
const serviceLinks = [
  { href: "/fire-wise-landscaping", label: "Fire-Wise Landscaping", icon: Flame },
  { href: "/water-smart-landscaping", label: "Water-Smart Landscaping", icon: Droplets },
  { href: "/native-low-maintenance", label: "Low-Maintenance Native", icon: Leaf },
  { href: "/fertilization", label: "Fertilization", icon: Droplets },
  { href: "/irrigation", label: "Irrigation", icon: Droplets },
  { href: "/plant-care", label: "Plant Care", icon: Sprout },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [burstId, setBurstId] = useState(0);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Primary top-level links (Services is rendered separately as a dropdown).
  const primaryLinks = [
    { href: "/plants", label: "Plant Library", icon: BookOpen, color: "from-green-500 to-teal-600" },
    { href: "/app", label: "Design Tool", icon: Palette, color: "from-primary-500 to-primary-700", featured: true },
    { href: "/portfolio", label: "Portfolio", icon: Camera, color: "from-earth-500 to-earth-700" },
    { href: "/#contact", label: "Contact", icon: Mail, color: "from-sky-500 to-blue-600" },
    ...(isAuthenticated ? [{ href: "/admin", label: "Admin", icon: Shield, color: "from-purple-500 to-indigo-600", admin: true }] : []),
  ];

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

        @keyframes leafFall {
          0% { opacity: 0; transform: translateY(-20px) rotate(0deg); }
          100% { opacity: 1; transform: translateY(0px) rotate(360deg); }
        }

        @keyframes branchGrow {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }

        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.2); opacity: 0; }
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

        .leaf-fall {
          animation: leafFall 0.6s ease-out forwards;
        }

        /* Run leafFall only while the group is hovered; when hover ends the
           animation is removed, so fill-forwards can't pin the leaf visible */
        .leaf-fall-on-hover {
          opacity: 0;
        }

        .group:hover .leaf-fall-on-hover {
          animation: leafFall 0.6s ease-out forwards;
        }

        .branch-grow {
          animation: branchGrow 0.4s ease-out forwards;
        }

        .nav-link-hover {
          position: relative;
          overflow: hidden;
        }

        .nav-link-hover::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, transparent, currentColor, transparent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link-hover:hover::before {
          transform: scaleX(1);
        }

        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        }
      `}</style>

      <nav className="bg-gradient-to-r from-white via-green-50/30 to-white backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b-2 border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo: grows from the ground on load, sways in the breeze,
                birds take flight, and clicking it bursts leaves */}
            <Link
              href="/"
              onClick={() => setBurstId((id) => id + 1)}
              className="flex items-center gap-2 group relative"
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
                      className="w-16 h-16 object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Birds taking flight from the canopy */}
              <span aria-hidden className="pointer-events-none absolute left-9 top-1 z-10">
                <span className="bird-a absolute left-0 top-0"><Bird /></span>
                <span className="bird-b absolute left-1 top-3"><Bird delay="0.13s" /></span>
              </span>

              {/* Leaf poof on click; key change remounts and replays the burst */}
              {burstId > 0 && (
                <span key={burstId} aria-hidden className="pointer-events-none absolute left-7 top-7 z-10">
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
                <div className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary-700 to-green-700 bg-clip-text text-transparent">
                  Telford Landscaping
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <span>Telford Projects LLC</span>
                  <Sparkles className="w-3 h-3 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Decorative leaves on hover */}
              <div className="absolute -top-2 -right-2 text-2xl leaf-fall-on-hover">
                🍃
              </div>
            </Link>

            {/* Desktop Navigation with Nature Animations.
                Home is omitted here — the logo links home; it stays in the mobile menu. */}
            <div className="hidden xl:flex items-center gap-0.5">
              {/* Services dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <button
                  onClick={() => setServicesOpen((v) => !v)}
                  aria-expanded={servicesOpen}
                  aria-haspopup="true"
                  className="relative px-2 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 nav-link-hover flex items-center gap-1 text-gray-800 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-primary-700"
                >
                  <span className="relative z-10">Services</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
                </button>
                {servicesOpen && (
                  <div className="absolute left-0 top-full pt-2 w-64 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-primary-100 p-2 animate-fade-in">
                      {serviceLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-primary-700 transition-all"
                          >
                            <span className="p-1.5 rounded-lg bg-primary-50 text-primary-600">
                              <Icon className="w-4 h-4" />
                            </span>
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {primaryLinks.map((link) => {
                const isHovered = hoveredLink === link.href;
                const isFeatured = link.featured;
                const isAdmin = link.admin;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setHoveredLink(link.href)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`
                      relative px-2 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300
                      nav-link-hover group flex items-center
                      ${isFeatured
                        ? 'bg-gradient-to-r from-primary-600 to-green-600 text-white shadow-md hover:shadow-xl hover:scale-105'
                        : isAdmin
                        ? 'text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50'
                        : 'text-gray-800 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-primary-700'
                      }
                    `}
                  >
                    <span className="relative z-10">{link.label}</span>

                    {/* Leaf indicator on hover */}
                    {isHovered && !isFeatured && (
                      <span className="absolute -top-1 -right-1 text-sm leaf-fall">🌿</span>
                    )}

                    {/* Featured sparkle effect */}
                    {isFeatured && (
                      <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                    )}
                  </Link>
                );
              })}

              {/* Phone CTA */}
              <a
                href={siteConfig.phoneHref}
                className="ml-1.5 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap text-primary-800 bg-primary-50 border border-primary-200 hover:bg-primary-100 transition-all"
              >
                <Phone className="w-4 h-4" />
                {siteConfig.phone}
              </a>

              {/* User Section with Nature Theme */}
              <div className="ml-1.5 pl-2 border-l-2 border-green-200 flex items-center gap-1.5">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 transition-all duration-300 hover:shadow-md hover:scale-105">
                      <div className="bg-gradient-to-br from-primary-600 to-green-600 p-1.5 rounded-lg">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
                      {user?.subscription === 'pro' && (
                        <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold">PRO</span>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition-all duration-300 hover:scale-105 group"
                    >
                      <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-700 hover:text-primary-700 text-sm font-semibold whitespace-nowrap px-2 py-2 rounded-xl hover:bg-green-50 transition-all duration-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="btn-3d bg-gradient-to-r from-primary-600 to-green-600 text-white text-sm px-3 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 group"
                    >
                      <span>Start Free</span>
                      <Sparkles className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button with Nature Animation */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden p-3 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 group"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-900 group-hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-900 group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>
          </div>

          {/* Mobile Navigation with Nature Theme */}
          {isOpen && (
            <div className="xl:hidden py-6 border-t-2 border-green-100 bg-gradient-to-b from-green-50/50 to-white rounded-b-2xl">
              <div className="flex flex-col gap-3">
                {/* Home */}
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                    <TreePine className="w-5 h-5 text-white" />
                  </div>
                  <span>Home</span>
                </Link>

                {/* Phone CTA */}
                <a
                  href={siteConfig.phoneHref}
                  className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl font-bold text-primary-800 bg-primary-50 border border-primary-200"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary-600 to-green-600">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <span>Call or Text {siteConfig.phone}</span>
                </a>

                {/* Services group */}
                <div className="mx-2">
                  <button
                    onClick={() => setMobileServicesOpen((v) => !v)}
                    aria-expanded={mobileServicesOpen}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all"
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-600">
                      <Sprout className="w-5 h-5 text-white" />
                    </div>
                    <span>Services</span>
                    <ChevronDown className={`w-5 h-5 ml-auto transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileServicesOpen && (
                    <div className="mt-1 ml-4 flex flex-col gap-1 border-l-2 border-primary-100 pl-3">
                      {serviceLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-primary-700 transition-all"
                            onClick={() => setIsOpen(false)}
                          >
                            <Icon className="w-4 h-4 text-primary-600" />
                            <span>{link.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Primary links */}
                {primaryLinks.map((link, index) => {
                  const Icon = link.icon;
                  const isFeatured = link.featured;
                  const isAdmin = link.admin;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`
                        flex items-center gap-3 px-4 py-3 mx-2 rounded-xl font-semibold transition-all duration-300
                        ${isFeatured
                          ? 'bg-gradient-to-r from-primary-600 to-green-600 text-white shadow-md'
                          : isAdmin
                          ? 'text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50'
                        }
                        leaf-fall
                      `}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className={`p-2 rounded-lg ${isFeatured ? 'bg-white/20' : 'bg-gradient-to-br ' + link.color}`}>
                        <Icon className={`w-5 h-5 ${isFeatured ? 'text-white' : 'text-white'}`} />
                      </div>
                      <span>{link.label}</span>
                      {isFeatured && <Sparkles className="w-4 h-4 ml-auto" />}
                    </Link>
                  );
                })}

                <div className="border-t-2 border-green-100 mt-2 pt-4 mx-2">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl mx-2 mb-3 border-2 border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-primary-600 to-green-600 p-2 rounded-lg">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{user?.name}</div>
                            <div className="text-xs text-gray-600 flex items-center gap-2">
                              {user?.subscription === 'pro' ? (
                                <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold">PRO</span>
                              ) : (
                                <span className="text-gray-500">Free Account</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 text-red-600 font-semibold px-4 py-3 mx-2 rounded-xl hover:bg-red-50 transition-all w-full"
                      >
                        <div className="bg-red-100 p-2 rounded-lg">
                          <LogOut className="w-5 h-5" />
                        </div>
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="flex items-center gap-3 text-gray-700 font-semibold px-4 py-3 mx-2 rounded-xl hover:bg-green-50 transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        href="/signup"
                        className="btn-3d flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-green-600 text-white px-6 py-3 rounded-xl font-bold mx-2 mt-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <span>Start Free</span>
                        <Sparkles className="w-5 h-5" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
