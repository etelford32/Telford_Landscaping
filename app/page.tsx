import Link from "next/link";
import {
  TreePine,
  Hammer,
  Leaf,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Star,
  Phone,
  Mail
} from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-earth-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Where Technology Meets Nature
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Professional landscaping and handyman services transforming outdoor spaces in Auburn, Roseville, Granite Bay, Lincoln, and Loomis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="#contact"
                className="bg-white text-primary-900 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center gap-2 text-lg"
              >
                Get Free Consultation
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/portfolio"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors text-lg"
              >
                View Our Work
              </Link>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-12 h-12 text-primary-300 mb-3" />
              <h3 className="font-semibold text-lg">Licensed Business</h3>
              <p className="text-primary-200 text-sm">Telford Projects LLC</p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-12 h-12 text-primary-300 mb-3" />
              <h3 className="font-semibold text-lg">Quality Guaranteed</h3>
              <p className="text-primary-200 text-sm">Contractor License Pending</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-12 h-12 text-primary-300 mb-3" />
              <h3 className="font-semibold text-lg">Local Experts</h3>
              <p className="text-primary-200 text-sm">Serving Greater Sacramento Area</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive landscaping and handyman solutions tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl border border-primary-100 hover:shadow-xl transition-shadow">
              <TreePine className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Landscape Design</h3>
              <p className="text-gray-600 mb-4">
                Transform your yard with custom landscape designs featuring native California plants and drought-tolerant solutions.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Native plant selection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Drought-tolerant landscaping</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Sustainable design practices</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-earth-50 to-white p-8 rounded-xl border border-earth-100 hover:shadow-xl transition-shadow">
              <Hammer className="w-12 h-12 text-earth-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Handyman Services</h3>
              <p className="text-gray-600 mb-4">
                Expert handyman work for all your outdoor and indoor improvement needs with attention to detail.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" />
                  <span>Fence installation & repair</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" />
                  <span>Deck & patio construction</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" />
                  <span>General repairs & maintenance</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl border border-primary-100 hover:shadow-xl transition-shadow">
              <Leaf className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Landscape Maintenance</h3>
              <p className="text-gray-600 mb-4">
                Keep your outdoor space looking pristine year-round with our comprehensive maintenance services.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Regular lawn care</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Pruning & trimming</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Seasonal cleanup</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area Section */}
      <section className="py-20 bg-gradient-to-br from-earth-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Proudly Serving the Greater Sacramento Area
            </h2>
            <p className="text-xl text-gray-600">
              Local expertise for communities we call home
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            {['Auburn', 'Roseville', 'Granite Bay', 'Lincoln', 'Loomis'].map((city) => (
              <div
                key={city}
                className="bg-white p-6 rounded-lg text-center shadow-md hover:shadow-xl transition-shadow border-2 border-primary-200 hover:border-primary-400"
              >
                <MapPin className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">{city}</h3>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-700 text-lg">
              California state law compliant • Licensed & Insured • Contractor License Pending
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon - PRO Features */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
              COMING SOON
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Telford Landscapes PRO
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Revolutionary 3D landscape design tools - Design your dream yard with cutting-edge technology
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="bg-primary-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📱</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">iPhone 3D Mapping</h3>
                <p className="text-gray-400">Use your iPhone to capture accurate 3D maps of your yard</p>
              </div>
              <div className="text-center">
                <div className="bg-primary-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌿</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">3D Plant Library</h3>
                <p className="text-gray-400">Browse native California plants in stunning 3D detail</p>
              </div>
              <div className="text-center">
                <div className="bg-primary-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎨</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Design & Visualize</h3>
                <p className="text-gray-400">Create and visualize your landscape before installation</p>
              </div>
            </div>

            <div className="mt-12">
              <p className="text-2xl font-semibold mb-4">Just $15/month</p>
              <button
                disabled
                className="bg-gray-700 text-gray-400 px-8 py-4 rounded-lg font-semibold cursor-not-allowed"
              >
                Launching Soon - Stay Tuned
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Get Your Free Consultation
            </h2>
            <p className="text-xl text-gray-600">
              Ready to transform your outdoor space? Let's discuss your project!
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-earth-50 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-primary-600 p-4 rounded-full">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Call Us</h3>
                  <p className="text-gray-700">Contact for consultation</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary-600 p-4 rounded-full">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Us</h3>
                  <p className="text-gray-700">info@telfordlandscapes.com</p>
                </div>
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    id="city"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  >
                    <option value="">Select your city</option>
                    <option value="auburn">Auburn</option>
                    <option value="roseville">Roseville</option>
                    <option value="granite-bay">Granite Bay</option>
                    <option value="lincoln">Lincoln</option>
                    <option value="loomis">Loomis</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your project
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Describe your landscaping needs, project timeline, or any questions you have..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-lg"
              >
                Request Free Consultation
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
