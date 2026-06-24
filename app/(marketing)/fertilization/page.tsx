import { Metadata } from "next";
import Link from "next/link";
import {
  Droplets,
  Shield,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Leaf,
  Heart,
  Zap,
  Clock,
  Award,
  Sun,
  Target,
  Phone
} from "lucide-react";

export const metadata: Metadata = {
  title: "Professional Liquid Fertilization Services | Telford Landscaping - Auburn, CA",
  description: "Premium liquid fertilization with custom surfactants, slow-release nitrogen, and pest solutions. Prevent disease, heal injuries, and sustain 30+ years of growth. Serving Auburn, Roseville, Granite Bay.",
  keywords: "liquid fertilizer Auburn CA, professional lawn fertilization, slow release nitrogen, custom surfactants, pest control, lawn disease prevention, Roseville fertilization, Granite Bay lawn care, organic fertilizer Northern California",
  openGraph: {
    title: "Transform Your Yard with Professional Liquid Fertilization",
    description: "Custom-blended liquid fertilizers with surfactants for maximum absorption. Prevent disease, heal damage, sustain growth for decades.",
    type: "website",
  }
};

export default function FertilizationPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 text-white overflow-hidden py-20 md:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 px-6 py-3 rounded-full text-sm font-bold mb-8 animate-bounce">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>PROFESSIONAL-GRADE RESULTS</span>
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Your Yard Deserves
              <span className="block bg-gradient-to-r from-green-300 via-emerald-200 to-green-300 bg-clip-text text-transparent mt-2">
                Professional Nutrition
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Watch your landscape transform with our premium liquid fertilization program.
              <span className="font-bold text-white"> Prevent disease, heal injuries, and sustain vibrant growth for 30+ years.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="#contact"
                className="bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 px-10 py-5 rounded-xl font-bold hover:from-green-500 hover:to-emerald-600 transition-all shadow-2xl hover:shadow-3xl flex items-center gap-3 text-xl border-2 border-green-300 hover:scale-105 transform"
              >
                <Droplets className="w-6 h-6" />
                Schedule Treatment
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                href="#how-it-works"
                className="bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-5 rounded-xl font-semibold hover:bg-white/20 transition-all shadow-xl text-lg hover:scale-105 transform"
              >
                Learn More
              </Link>
            </div>

            {/* Trust Indicator */}
            <p className="mt-8 text-green-200 text-sm">
              ✓ Custom-blended for Northern California soils &nbsp;•&nbsp; ✓ Licensed, Bonded &amp; Insured &nbsp;•&nbsp; ✓ Satisfaction guaranteed
            </p>
          </div>
        </div>
      </section>

      {/* The Problem (Emotional Connection) */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Is Your Yard Showing These Warning Signs?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't let nutrient deficiency rob you of the lush, vibrant landscape you deserve
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: "🟡",
                title: "Yellowing Leaves",
                description: "Nitrogen deficiency leaves plants pale, weak, and struggling to grow"
              },
              {
                icon: "🦠",
                title: "Disease Vulnerability",
                description: "Stressed, undernourished plants can't fight off fungus, pests, and infections"
              },
              {
                icon: "🐌",
                title: "Slow, Stunted Growth",
                description: "Without proper nutrition, your landscape stagnates instead of thriving"
              }
            ].map((problem, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border-2 border-red-100 hover:border-red-200 transition-all shadow-lg hover:shadow-xl">
                <div className="text-5xl mb-4 text-center">{problem.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{problem.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-2xl font-bold text-gray-900 mb-2">Sound familiar?</p>
            <p className="text-lg text-gray-600">There's a better way...</p>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 bg-gradient-to-br from-green-900 to-emerald-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 px-6 py-3 rounded-full text-sm font-bold mb-6">
              <Award className="w-5 h-5 text-yellow-300" />
              THE TELFORD DIFFERENCE
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Premium Liquid Fertilization That Actually Works
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              We don't use off-the-shelf products. Our custom-blended liquid fertilizers are scientifically formulated for <span className="font-bold text-white">maximum absorption, long-lasting results, and Northern California's unique soil conditions.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Droplets,
                color: "blue",
                title: "Custom Surfactants",
                description: "Our proprietary surfactant blend helps nutrients penetrate deep into soil and plant tissue—not just sit on the surface. It's like giving your plants an IV drip of pure nutrition.",
                benefit: "5X better absorption than granular fertilizers"
              },
              {
                icon: Clock,
                color: "amber",
                title: "Slow-Release Nitrogen",
                description: "Feeds your landscape consistently for months, not days. No burn risk, no waste. Just steady, predictable growth that lasts.",
                benefit: "Feeds for 90-120 days per application"
              },
              {
                icon: Shield,
                color: "red",
                title: "Integrated Pest Solutions",
                description: "When needed, we add targeted pest control directly into your treatment. Prevent infestations before they start while strengthening plant immunity.",
                benefit: "Dual-action: nutrition + protection"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/20 hover:bg-white/15 transition-all group">
                <div className={`bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-green-100 mb-4 leading-relaxed">{feature.description}</p>
                <div className="flex items-center gap-2 text-green-300 font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">{feature.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The Results Speak for Themselves
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Here's what proper nutrition does for your landscape
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[
              {
                icon: Shield,
                iconColor: "text-blue-600",
                bgColor: "from-blue-50 to-cyan-50",
                title: "Disease Prevention",
                description: "Strong, well-fed plants naturally resist fungal infections, bacterial diseases, and environmental stress. Think of it as a robust immune system for your yard.",
                stats: "Up to 80% reduction in disease occurrence"
              },
              {
                icon: Heart,
                iconColor: "text-red-600",
                bgColor: "from-red-50 to-pink-50",
                title: "Injury Recovery",
                description: "Damaged by drought, frost, or pests? Our treatments accelerate healing by providing exactly what stressed plants need to regenerate healthy tissue fast.",
                stats: "2-3X faster recovery from damage"
              },
              {
                icon: TrendingUp,
                iconColor: "text-green-600",
                bgColor: "from-green-50 to-emerald-50",
                title: "Sustained Long-Term Growth",
                description: "Proper nutrition isn't just about this season—it's about building root systems and plant structures that thrive for decades. We're thinking 30+ years ahead.",
                stats: "Investment pays dividends for 30+ years"
              },
              {
                icon: Sun,
                iconColor: "text-yellow-600",
                bgColor: "from-yellow-50 to-amber-50",
                title: "Vibrant Color & Density",
                description: "Deep green leaves, lush foliage, and explosive blooms. Your neighbors will wonder what your secret is (it's science + custom nutrition).",
                stats: "Noticeable results in 7-14 days"
              }
            ].map((benefit, index) => (
              <div key={index} className={`bg-gradient-to-br ${benefit.bgColor} p-8 rounded-2xl border-2 border-gray-100 hover:shadow-2xl transition-all group`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-white p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                    <benefit.icon className={`w-8 h-8 ${benefit.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">{benefit.description}</p>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-bold text-green-700">{benefit.stats}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Benefits List */}
          <div className="bg-gradient-to-br from-gray-50 to-green-50 p-10 rounded-2xl border-2 border-green-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Plus, You'll Also Get:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {[
                "Deeper, more extensive root systems",
                "Increased drought tolerance",
                "Better nutrient uptake from existing soil",
                "Enhanced cold hardiness for winter",
                "Thicker, lusher turf with fewer bare spots",
                "Improved soil microbe activity",
                "Reduced watering requirements",
                "Higher property value and curb appeal"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Simple 3-Step Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional results without the hassle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "01",
                title: "Custom Assessment",
                description: "We analyze your soil type, existing plants, and specific challenges. Every yard is unique—your treatment should be too.",
                icon: Target
              },
              {
                step: "02",
                title: "Precision Application",
                description: "Our licensed professionals apply your custom-blended formula using professional equipment for even, efficient coverage.",
                icon: Droplets
              },
              {
                step: "03",
                title: "Ongoing Monitoring",
                description: "We track results and adjust formulations seasonally. Your yard's needs change—your fertilization program should evolve with it.",
                icon: TrendingUp
              }
            ].map((process, index) => (
              <div key={index} className="relative">
                {/* Connector Line (hidden on mobile) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-1 bg-gradient-to-r from-green-300 to-emerald-300 z-0"></div>
                )}

                <div className="relative bg-white p-8 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all shadow-lg hover:shadow-2xl z-10">
                  <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-xl">
                    {process.step}
                  </div>
                  <process.icon className="w-12 h-12 text-green-600 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{process.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{process.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Program */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Year-Round Fertilization Program
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Professional landscapers fertilize 3-4 times per year. Here's why:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              {
                season: "Spring",
                emoji: "🌸",
                timing: "March - April",
                focus: "Growth Kickstart",
                description: "High nitrogen to fuel explosive spring growth and vibrant greening"
              },
              {
                season: "Summer",
                emoji: "☀️",
                timing: "June - July",
                focus: "Stress Protection",
                description: "Balanced nutrition + stress protectants for heat and drought tolerance"
              },
              {
                season: "Fall",
                emoji: "🍂",
                timing: "September - October",
                focus: "Root Building",
                description: "Phosphorus-rich formula to develop deep roots before winter"
              },
              {
                season: "Winter (Optional)",
                emoji: "❄️",
                timing: "December - January",
                focus: "Maintenance",
                description: "Light feeding for evergreens and cool-season grasses"
              }
            ].map((season, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border-2 border-white/20 hover:bg-white/15 transition-all">
                <div className="text-5xl mb-3 text-center">{season.emoji}</div>
                <h3 className="text-xl font-bold mb-1 text-center">{season.season}</h3>
                <p className="text-green-200 text-sm mb-3 text-center">{season.timing}</p>
                <div className="bg-white/10 px-3 py-1 rounded-full text-sm font-semibold mb-3 text-center">
                  {season.focus}
                </div>
                <p className="text-green-100 text-sm leading-relaxed">{season.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/20 max-w-3xl mx-auto">
            <Sparkles className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">Annual Program Pricing</h3>
            <p className="text-green-100 mb-6">
              Save 15% with our prepaid annual program. Lock in today's pricing and never miss a treatment.
            </p>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 px-8 py-4 rounded-xl font-bold hover:from-green-500 hover:to-emerald-600 transition-all shadow-xl hover:scale-105"
            >
              Get Custom Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Common Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our fertilization service
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Why liquid instead of granular fertilizer?",
                answer: "Liquid fertilizers with surfactants provide 5X better absorption, more even coverage, and immediate availability to plants. Our slow-release formulation combines the best of both worlds: fast initial response + long-lasting feeding."
              },
              {
                question: "Is it safe for kids and pets?",
                answer: "Absolutely. We use professional-grade products that are safe once dry (typically 2-4 hours). We'll provide specific guidance based on your treatment, but generally pets and children can return to treated areas the same day."
              },
              {
                question: "How soon will I see results?",
                answer: "Most clients notice greener, more vibrant foliage within 7-14 days. Root development and disease resistance improvements happen over weeks to months. Long-term benefits compound over years."
              },
              {
                question: "What makes your fertilizer 'custom'?",
                answer: "We adjust nitrogen-phosphorus-potassium ratios, micronutrients, and pH modifiers based on your specific soil test results and plant types. Northern California clay soils need different treatment than sandy or loamy soils."
              },
              {
                question: "Do you offer organic options?",
                answer: "Yes! We have organic and organic-synthetic hybrid programs. We'll discuss which option best fits your goals, budget, and landscape needs during your assessment."
              }
            ].map((faq, index) => (
              <details key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all group">
                <summary className="font-bold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>{faq.question}</span>
                  <CheckCircle2 className="w-6 h-6 text-green-600 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-700 leading-relaxed pl-2 border-l-4 border-green-400">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-green-900 via-emerald-900 to-green-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Leaf className="w-16 h-16 mx-auto mb-6 text-green-300" />
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready for a Healthier, More Beautiful Yard?
          </h2>
          <p className="text-xl text-green-100 mb-8 leading-relaxed">
            Join hundreds of satisfied homeowners in Auburn, Roseville, and Granite Bay who trust us with their landscape nutrition.
          </p>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/20 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-green-200">Yards Treated</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-green-200">Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">15+</div>
                <div className="text-green-200">Years Experience</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/#contact"
              className="bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 px-10 py-5 rounded-xl font-bold hover:from-green-500 hover:to-emerald-600 transition-all shadow-2xl hover:shadow-3xl flex items-center gap-3 text-xl border-2 border-green-300 hover:scale-105 transform"
            >
              <Phone className="w-6 h-6" />
              Schedule Free Assessment
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link
              href="/design"
              className="bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-5 rounded-xl font-semibold hover:bg-white/20 transition-all shadow-xl text-lg hover:scale-105 transform"
            >
              Design Your Landscape First
            </Link>
          </div>

          <p className="text-green-200 text-sm">
            Serving Auburn, Roseville, Granite Bay, Lincoln, and Loomis • CA C-27 Lic. #1156976 • Bonded &amp; Insured
          </p>
        </div>
      </section>
    </div>
  );
}
