import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import { serviceGroups } from "@/lib/services";
import { serviceAreas } from "@/lib/serviceAreas";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer data-cta-location="footer" className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr] gap-x-8 gap-y-10">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
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
              Full-service landscaping for Granite Bay, Loomis, and the Sacramento foothills —
              design, hardscape, drainage, irrigation, and long-term care. Built by hand, designed
              by science, meant to outlast us.
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

          {/* Services — the same three groups as the header menu */}
          {serviceGroups.map((group) => (
            <div key={group.id}>
              <h3 className="text-[15px] font-semibold mb-4">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Service areas + the handful of non-service pages */}
        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-white">Service areas:</span>{" "}
            {serviceAreas.map((a, i) => (
              <span key={a.slug}>
                {i > 0 && " · "}
                <Link href={`/${a.slug}`} className="hover:text-primary-400 transition-colors">
                  {a.city}, CA
                </Link>
              </span>
            ))}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <li>
              <Link href="/portfolio" className="text-gray-400 hover:text-primary-400 transition-colors">
                Our Work
              </Link>
            </li>
            <li>
              <Link href="/#service-areas" className="text-gray-400 hover:text-primary-400 transition-colors">
                Service Areas
              </Link>
            </li>
            <li>
              <Link href="/for-contractors" className="text-gray-400 hover:text-primary-400 transition-colors">
                For Contractors
              </Link>
            </li>
            <li>
              <Link href="/#contact" data-cta="request-bid" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                Request a Free Estimate
              </Link>
            </li>
          </ul>
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
