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
import HeroCanvas from "@/components/HeroCanvas";

export default function Home() {
  return (
    <>
      {/* Hero Section with Interactive 3D Demo */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-earth-800 text-white overflow-hidden h-[calc(100vh-5rem)] min-h-[600px]">
        {/* Interactive 3D Landscape Scene */}
        <HeroCanvas />

        {/* Content Overlay */}
        <div className="relative h-full flex flex-col justify-end pb-20 z-10 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-8" style={{ transform: 'translateY(100px)' }}>
              <h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
                style={{
                  color: '#87CEEB',
                  textShadow: `
                    -2px -2px 0 #FF8C00,
                    2px -2px 0 #FF8C00,
                    -2px 2px 0 #FF8C00,
                    2px 2px 0 #FF8C00,
                    -3px -3px 0 #FFD700,
                    3px -3px 0 #FFD700,
                    -3px 3px 0 #FFD700,
                    3px 3px 0 #FFD700,
                    0 0 30px rgba(255,215,0,0.5),
                    0 0 60px rgba(135,206,235,0.3)
                  `
                }}
              >
                Where Technology Meets Nature
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto drop-shadow-lg font-medium">
                Professional landscaping and handyman services transforming outdoor spaces in Auburn, Roseville, Granite Bay, Lincoln, and Loomis
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pointer-events-auto">
                <Link
                  href="/design"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-5 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-2xl hover:shadow-3xl flex items-center gap-3 text-xl border-2 border-yellow-300 hover:scale-105 transform"
                >
                  <span>🎨</span>
                  Design Your Own
                  <ArrowRight className="w-6 h-6" />
                </Link>
                <Link
                  href="#contact"
                  className="bg-white text-primary-900 px-8 py-5 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 text-lg hover:scale-105 transform"
                >
                  Get Free Consultation
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/portfolio"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-5 rounded-xl font-semibold hover:bg-white/20 transition-all shadow-xl text-lg hover:scale-105 transform"
                >
                  View Our Work
                </Link>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto" style={{ transform: 'translateY(60px)' }}>
              <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-white mb-2" />
                <h3 className="font-semibold text-base">Licensed Business</h3>
                <p className="text-white/80 text-sm">Telford Projects LLC</p>
              </div>
              <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <Star className="w-10 h-10 text-white mb-2" />
                <h3 className="font-semibold text-base">Quality Guaranteed</h3>
                <p className="text-white/80 text-sm">Contractor License Pending</p>
              </div>
              <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <MapPin className="w-10 h-10 text-white mb-2" />
                <h3 className="font-semibold text-base">Local Experts</h3>
                <p className="text-white/80 text-sm">Greater Sacramento Area</p>
              </div>
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

      {/* World's First Growth Simulation Feature */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-2 rounded-full text-sm font-bold mb-6 animate-pulse">
              🌟 WORLD'S FIRST
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Time Travel for Your Landscape
            </h2>
            <p className="text-xl text-white/90 mb-4 max-w-3xl mx-auto">
              See your plants grow from year 1 to year 30 in real-time 3D
            </p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Our revolutionary growth simulation technology lets you visualize exactly how your landscape will evolve over decades—before you plant a single seed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="font-bold text-xl mb-2">30-Year Simulation</h3>
              <p className="text-white/80">Watch your plants mature from saplings to full-grown specimens with a simple slider</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-bold text-xl mb-2">Drag & Drop Design</h3>
              <p className="text-white/80">Place, rotate, and arrange plants in an intuitive 3D workspace with snap-to-grid precision</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="font-bold text-xl mb-2">Native Plant Library</h3>
              <p className="text-white/80">Start with premium California natives like Japanese Maple, Sawara Cypress, and Atlas Cedar</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/app"
              className="inline-block bg-white text-primary-900 px-10 py-5 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 text-lg"
            >
              Try the Design Tool Now →
            </Link>
            <p className="mt-4 text-white/70">Free to explore • PRO features coming soon at $15/month</p>
          </div>
        </div>
      </section>

      {/* Professional Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Professional Installation Available
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Design your dream landscape with our 3D tool, then let our expert team bring it to life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl border-2 border-primary-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary-600 p-3 rounded-full">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Design Phase</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Use our free 3D design tool</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Visualize growth over 30 years</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Save and share your designs</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-earth-50 to-white p-8 rounded-xl border-2 border-earth-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-earth-600 p-3 rounded-full">
                  <span className="text-2xl">🔨</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Installation Phase</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" />
                  <span>Share design for instant quote</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" />
                  <span>Professional installation team</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" />
                  <span>Licensed & insured service</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="#contact"
              className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Request Professional Installation Quote
            </Link>
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
