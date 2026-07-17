import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg overflow-hidden shadow-lg ring-1 ring-white/10">
                <Image
                  src="/telford-logo.jpg"
                  alt="Telford Landscaping logo"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover"
                />
              </div>
              <div>
                <div className="text-xl font-bold">{siteConfig.name}</div>
                <div className="text-sm text-gray-400">{siteConfig.legalName}</div>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Estate-scale landscape design-build for Granite Bay, Loomis, and the Sacramento
              foothills. Heavy hardscape, mature tree installation, and heritage landscapes. Built by
              hand, designed by science, meant to outlast us.
            </p>
            <div className="flex flex-col gap-2 text-gray-400">
              <a href={siteConfig.phoneHref} className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{siteConfig.phone}</span>
              </a>
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                <Mail className="w-4 h-4" />
                <span className="text-sm break-all">{siteConfig.email}</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Serving the Greater Sacramento Foothills</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/fire-wise-landscaping" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Fire-Wise Landscaping
                </Link>
              </li>
              <li>
                <Link href="/water-smart-landscaping" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Water-Smart Landscaping
                </Link>
              </li>
              <li>
                <Link href="/native-low-maintenance" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Low-Maintenance Native
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/app" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Design Tool
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Request a Bid
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Service Areas</h3>
            <ul className="space-y-2 text-gray-400">
              {siteConfig.cities.map((city) => (
                <li key={city}>{city}, CA</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} {siteConfig.legalName}. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-4 text-center md:text-left">
            {siteConfig.legalName} · {siteConfig.license} · Bonded &amp; Insured
          </p>
        </div>
      </div>
    </footer>
  );
}
