import Link from "next/link";
import { TreePine, MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2 rounded-lg">
                <TreePine className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Telford Landscapes</div>
                <div className="text-sm text-gray-400">Telford Projects LLC</div>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Estate-scale landscape design-build for Granite Bay, Loomis, and the Sacramento foothills. Heavy hardscape, mature tree installation, and heritage landscapes. Built by hand, designed by science, meant to outlast us.
            </p>
            <div className="flex flex-col gap-2 text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Serving Greater Sacramento Area</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">info@telfordlandscapes.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Service Areas</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Auburn, CA</li>
              <li>Roseville, CA</li>
              <li>Granite Bay, CA</li>
              <li>Lincoln, CA</li>
              <li>Loomis, CA</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Telford Projects LLC. All rights reserved.
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
            Telford Projects LLC · CA C27 Licensed · Insured
          </p>
        </div>
      </div>
    </footer>
  );
}
