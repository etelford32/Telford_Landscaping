"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, TreePine, LogOut, User, Palette, Camera, Mail, Shield, Sparkles, Sprout, Droplets, BookOpen } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home", icon: TreePine, color: "from-green-500 to-emerald-600" },
    { href: "/plant-care", label: "Plant Care", icon: Sprout, color: "from-emerald-500 to-green-600" },
    { href: "/plants", label: "Plant Library", icon: BookOpen, color: "from-green-500 to-teal-600" },
    { href: "/fertilization", label: "Fertilization", icon: Droplets, color: "from-blue-500 to-cyan-600" },
    { href: "/irrigation", label: "Irrigation", icon: Droplets, color: "from-cyan-500 to-blue-600" },
    { href: "/app", label: "Design Tool", icon: Palette, color: "from-primary-500 to-primary-700", featured: true },
    { href: "/portfolio", label: "Portfolio", icon: Camera, color: "from-earth-500 to-earth-700" },
    { href: "/#contact", label: "Contact", icon: Mail, color: "from-sky-500 to-blue-600" },
    ...(isAuthenticated ? [{ href: "/admin", label: "Admin", icon: Shield, color: "from-purple-500 to-indigo-600", admin: true }] : []),
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes logoSprout {
          0% { opacity: 0; transform: scale(0.4) rotate(-12deg); }
          60% { opacity: 1; transform: scale(1.08) rotate(3deg); }
          80% { transform: scale(0.97) rotate(-1deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        @keyframes logoGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4), 0 4px 12px rgba(20, 83, 45, 0.15); }
          50% { box-shadow: 0 0 0 7px rgba(34, 197, 94, 0), 0 4px 16px rgba(22, 163, 74, 0.3); }
        }

        @keyframes logoSheen {
          0% { transform: translateX(-150%) skewX(-20deg); }
          14% { transform: translateX(400%) skewX(-20deg); }
          100% { transform: translateX(400%) skewX(-20deg); }
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
          animation: logoSprout 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .logo-glow {
          animation: logoGlow 4s ease-in-out infinite;
        }

        .logo-sheen {
          animation: logoSheen 7s ease-in-out 1.5s infinite;
          transform: translateX(-150%) skewX(-20deg);
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
            {/* Logo with sprout entrance, breathing glow, and periodic sheen */}
            <Link href="/" className="flex items-center gap-3 group relative">
              {/* shrink-0: without it the overflow-hidden box gets flex-crushed to 0px
                  when the header row runs out of room, collapsing the logo entirely */}
              <div className="logo-sprout shrink-0">
                <div className="logo-glow relative rounded-xl overflow-hidden ring-2 ring-primary-200/70 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                  <Image
                    src="/telford-logo.jpg"
                    alt="Telford Landscaping logo"
                    width={56}
                    height={56}
                    priority
                    className="w-14 h-14 object-cover"
                  />
                  <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                    <span className="logo-sheen absolute top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </span>
                </div>
              </div>
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
              {navLinks.filter((link) => link.href !== "/").map((link) => {
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
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-primary-700'
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
                      className="bg-gradient-to-r from-primary-600 to-green-600 text-white text-sm px-3 py-2 rounded-xl font-bold whitespace-nowrap hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-1.5 group"
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
                {navLinks.map((link, index) => {
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
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg mx-2 mt-2"
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
