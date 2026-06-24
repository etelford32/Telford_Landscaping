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
        @keyframes leafFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
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

        .leaf-float {
          animation: leafFloat 3s ease-in-out infinite;
        }

        .leaf-fall {
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
            {/* Logo with Leaf Float Animation */}
            <Link href="/" className="flex items-center gap-3 group relative">
              <div className="relative rounded-xl overflow-hidden shadow-md ring-1 ring-primary-100 group-hover:shadow-lg transition-all duration-500 group-hover:scale-110 leaf-float">
                <Image
                  src="/telford-logo.jpg"
                  alt="Telford Landscaping logo"
                  width={48}
                  height={48}
                  priority
                  className="w-12 h-12 object-cover"
                />
              </div>
              <div className="relative">
                <div className="text-xl font-bold bg-gradient-to-r from-primary-700 to-green-700 bg-clip-text text-transparent">
                  Telford Landscaping
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <span>Telford Projects LLC</span>
                  <Sparkles className="w-3 h-3 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Decorative leaves on hover */}
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-2xl leaf-fall">
                🍃
              </div>
            </Link>

            {/* Desktop Navigation with Nature Animations */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
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
                      relative px-4 py-2 rounded-xl font-semibold transition-all duration-300
                      nav-link-hover group flex items-center gap-2
                      ${isFeatured
                        ? 'bg-gradient-to-r from-primary-600 to-green-600 text-white shadow-md hover:shadow-xl hover:scale-105'
                        : isAdmin
                        ? 'text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-primary-700'
                      }
                    `}
                  >
                    {/* Icon with bounce effect */}
                    <Icon className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'scale-125 rotate-12' : ''}`} />

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
              <div className="ml-4 pl-4 border-l-2 border-green-200 flex items-center gap-3">
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
                      className="text-gray-700 hover:text-primary-700 font-semibold px-4 py-2 rounded-xl hover:bg-green-50 transition-all duration-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-gradient-to-r from-primary-600 to-green-600 text-white px-6 py-2 rounded-xl font-bold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
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
              className="md:hidden p-3 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 group"
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
            <div className="md:hidden py-6 border-t-2 border-green-100 bg-gradient-to-b from-green-50/50 to-white rounded-b-2xl">
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
