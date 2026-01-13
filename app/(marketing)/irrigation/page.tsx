import { Metadata } from "next";
import Link from "next/link";
import {
  Droplets,
  Zap,
  Cpu,
  Clock,
  Smartphone,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
  Wifi,
  Calendar,
  Shield,
  Target,
  Gauge,
  Cloud,
  Settings,
  Wrench,
  ExternalLink,
  Sparkles,
  Award,
  Phone
} from "lucide-react";

export const metadata: Metadata = {
  title: "Smart Irrigation Systems & Timer Automation | Telford Landscapes - Auburn, CA",
  description: "Professional irrigation design, installation, repair, and smart timer automation. Custom solutions for large properties and mature landscapes. Water-saving technology. Serving Auburn, Roseville, Granite Bay.",
  keywords: "smart irrigation Auburn CA, irrigation timer repair, automated sprinkler system, irrigation installation Roseville, water conservation, smart watering system, irrigation automation Granite Bay, sprinkler timer programming, large property irrigation",
  openGraph: {
    title: "Smart Irrigation & Timer Automation Solutions",
    description: "Professional irrigation services with cutting-edge automation. Save water, save money, automate everything.",
    type: "website",
  }
};

export default function IrrigationPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Futuristic Design */}
      <section className="relative bg-gradient-to-br from-blue-950 via-cyan-900 to-blue-950 text-white overflow-hidden py-20 md:py-32">
        {/* Animated Tech Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
          <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            {/* Tech Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-400/30 text-cyan-100 px-6 py-3 rounded-full text-sm font-bold mb-8">
              <Cpu className="w-5 h-5 text-cyan-300 animate-pulse" />
              <span>NEXT-GENERATION IRRIGATION TECHNOLOGY</span>
              <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Water Your Landscape
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent mt-2 animate-pulse">
                While You Sleep
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-cyan-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Smart irrigation systems that <span className="font-bold text-white">think for themselves.</span>
              <br />
              <span className="text-lg">Save 30-50% on water bills with intelligent automation designed for Northern California's climate.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="#contact"
                className="group bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-900 px-10 py-5 rounded-xl font-bold hover:from-cyan-500 hover:to-blue-600 transition-all shadow-2xl hover:shadow-cyan-500/50 flex items-center gap-3 text-xl border-2 border-cyan-300 hover:scale-105 transform"
              >
                <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Get Smart Irrigation
                <ArrowRight className="w-6 h-6" />
              </Link>
              <a
                href="https://elliottelford-dotcom-apgrcg6i3-elliot-telfords-projects.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-5 rounded-xl font-semibold hover:bg-white/20 transition-all shadow-xl text-lg hover:scale-105 transform flex items-center gap-2"
              >
                View Tech Portfolio
                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>

            {/* Trust Indicator */}
            <p className="text-cyan-200 text-sm flex items-center justify-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Wifi className="w-4 h-4" /> IoT-Enabled Systems
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" /> Licensed Professionals
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4" /> Custom Engineering
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: TrendingDown, stat: "30-50%", label: "Water Savings", color: "text-green-600" },
              { icon: Smartphone, stat: "24/7", label: "Remote Control", color: "text-blue-600" },
              { icon: Calendar, stat: "365 Days", label: "Automated", color: "text-purple-600" },
              { icon: Zap, stat: "< 5 min", label: "Setup Time", color: "text-yellow-600" }
            ].map((item, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform">
                <div className={`${item.color} mx-auto mb-4 group-hover:animate-bounce`}>
                  <item.icon className="w-12 h-12 mx-auto" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{item.stat}</div>
                <div className="text-gray-600 font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Traditional Irrigation Is Costing You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Old-school timers and manual systems waste water, money, and time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: "💸",
                title: "Wasting $1,000s Annually",
                description: "Over-watering, broken zones, and inefficient scheduling drain your wallet and harm the environment"
              },
              {
                icon: "⏰",
                title: "Outdated Timer Technology",
                description: "Manual programming, battery failures, and no weather intelligence mean constant babysitting"
              },
              {
                icon: "🏜️",
                title: "Drought Non-Compliance",
                description: "California water restrictions change constantly—are you sure you're compliant?"
              }
            ].map((problem, index) => (
              <div key={index} className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl border-2 border-red-100 hover:border-red-200 transition-all shadow-lg hover:shadow-xl">
                <div className="text-5xl mb-4 text-center">{problem.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{problem.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-2xl font-bold text-gray-900 mb-2">There's a smarter way...</p>
          </div>
        </div>
      </section>

      {/* The Solution - Our Services */}
      <section className="py-20 bg-gradient-to-br from-blue-950 via-cyan-900 to-blue-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 text-cyan-100 px-6 py-3 rounded-full text-sm font-bold mb-6">
              <Cpu className="w-5 h-5 text-cyan-300" />
              INTELLIGENT IRRIGATION SOLUTIONS
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              What We Build & Service
            </h2>
            <p className="text-xl text-cyan-100 max-w-3xl mx-auto leading-relaxed">
              From simple timer repairs to <span className="font-bold text-white">enterprise-grade automation</span> for multi-acre estates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Settings,
                color: "cyan",
                title: "Smart Timer Installation",
                description: "Wi-Fi enabled controllers with weather intelligence, app control, and automatic scheduling adjustments.",
                features: ["Rachio, Rain Bird, Hunter", "Weather-based scheduling", "Zone-by-zone control"]
              },
              {
                icon: Wrench,
                color: "blue",
                title: "Timer Repair & Programming",
                description: "Fix broken timers, update programming, replace batteries, and troubleshoot connectivity issues.",
                features: ["Same-day service available", "All brands serviced", "Programming optimization"]
              },
              {
                icon: Cpu,
                color: "purple",
                title: "Custom Automation Engineering",
                description: "Bespoke solutions for large properties: soil moisture sensors, multi-zone orchestration, API integrations.",
                features: ["Multi-acre properties", "Mature landscape zones", "Professional-grade systems"]
              },
              {
                icon: Smartphone,
                color: "green",
                title: "Mobile App Integration",
                description: "Control your entire irrigation system from anywhere. Receive alerts, view history, adjust on-the-fly.",
                features: ["iOS & Android apps", "Real-time monitoring", "Push notifications"]
              },
              {
                icon: Cloud,
                color: "indigo",
                title: "Weather Integration",
                description: "Automatically skip watering when it rains. Adjust runtime based on temperature, humidity, and forecast.",
                features: ["Hyperlocal weather data", "Seasonal adjustments", "Evapotranspiration calculations"]
              },
              {
                icon: Target,
                color: "orange",
                title: "System Design & Installation",
                description: "Ground-up irrigation design for new landscapes or major renovations. Pressure, flow, and coverage optimization.",
                features: ["AutoCAD system plans", "Hydraulic calculations", "Drip & spray systems"]
              }
            ].map((service, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/20 hover:bg-white/15 transition-all group">
                <div className={`bg-gradient-to-br from-${service.color}-400 to-${service.color}-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                <p className="text-cyan-100 mb-4 leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-cyan-200 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Smart Irrigation Matters
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Benefits that compound year after year
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[
              {
                icon: TrendingDown,
                iconColor: "text-green-600",
                bgColor: "from-green-50 to-emerald-50",
                title: "Massive Water Savings",
                description: "Smart controllers reduce water usage by 30-50% through weather intelligence, soil moisture sensing, and precision scheduling. That's thousands of gallons—and dollars—saved annually.",
                stats: "Average savings: $800-1,500/year"
              },
              {
                icon: Smartphone,
                iconColor: "text-blue-600",
                bgColor: "from-blue-50 to-cyan-50",
                title: "Control From Anywhere",
                description: "Traveling? No problem. Adjust your system from Hawaii. Get alerts when zones malfunction. See exactly how much water you're using in real-time.",
                stats: "Manage from your phone, tablet, or computer"
              },
              {
                icon: Calendar,
                iconColor: "text-purple-600",
                bgColor: "from-purple-50 to-indigo-50",
                title: "Set It & Forget It",
                description: "After initial setup, smart systems self-adjust based on weather, season, and plant needs. No more manual timer programming or seasonal adjustments.",
                stats: "Fully automated 365 days/year"
              },
              {
                icon: Shield,
                iconColor: "text-yellow-600",
                bgColor: "from-yellow-50 to-amber-50",
                title: "Drought Compliance & Rebates",
                description: "Meet California water restrictions automatically. Many smart controllers qualify for utility rebates ($50-200 depending on your water district).",
                stats: "Rebates available in most CA districts"
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
                  <Zap className="w-5 h-5 text-cyan-600" />
                  <span className="text-sm font-bold text-cyan-700">{benefit.stats}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Benefits */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-10 rounded-2xl border-2 border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Plus:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {[
                "Leak detection alerts save you from water damage",
                "Healthier plants with optimized watering schedules",
                "Higher property value with professional systems",
                "Reduced maintenance costs (no more broken timers)",
                "Environmental responsibility & water conservation",
                "Compliance with HOA irrigation requirements",
                "Custom zones for different plant types",
                "Integration with home automation systems"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Large Property / Custom Solutions */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.3) 2px, transparent 2px), linear-gradient(90deg, rgba(56, 189, 248, 0.3) 2px, transparent 2px)',
            backgroundSize: '100px 100px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 text-cyan-100 px-6 py-3 rounded-full text-sm font-bold mb-6">
                <Target className="w-5 h-5 text-cyan-300" />
                ENTERPRISE SOLUTIONS
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Custom Automation for Large Properties
              </h2>
              <p className="text-xl text-cyan-100 mb-6 leading-relaxed">
                Multi-acre estates and mature landscapes require <span className="font-bold text-white">engineered solutions</span>—not off-the-shelf products.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  {
                    title: "Multi-Zone Orchestration",
                    description: "Coordinate 20+ zones with different schedules, soil types, and exposure conditions"
                  },
                  {
                    title: "Soil Moisture Sensing",
                    description: "Ground-level sensors feed real-time data to controllers—water only when needed"
                  },
                  {
                    title: "Flow Monitoring & Leak Detection",
                    description: "Get instant alerts when zones use abnormal water volumes (broken pipes, stuck valves)"
                  },
                  {
                    title: "Integration with Building Systems",
                    description: "Connect to Crestron, Control4, or custom home automation platforms"
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-cyan-100">{item.description}</p>
                  </div>
                ))}
              </div>

              <a
                href="https://elliottelford-dotcom-apgrcg6i3-elliot-telfords-projects.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-900 px-8 py-4 rounded-xl font-bold hover:from-cyan-500 hover:to-blue-600 transition-all shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 group"
              >
                <Cpu className="w-6 h-6" />
                See My Engineering Portfolio
                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border-2 border-cyan-400/30 p-8 rounded-2xl">
                <Gauge className="w-12 h-12 text-cyan-300 mb-4" />
                <h3 className="text-2xl font-bold mb-3">Properties We've Automated</h3>
                <ul className="space-y-3">
                  {[
                    "5-acre vineyard estates with micro-irrigation",
                    "15+ zone residential properties with mixed plantings",
                    "Commercial properties with 50+ zones",
                    "Hillside properties requiring pump systems",
                    "Historic properties with sensitive mature trees"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-cyan-100">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-sm border-2 border-purple-400/30 p-8 rounded-2xl">
                <Sparkles className="w-12 h-12 text-purple-300 mb-4" />
                <h3 className="text-2xl font-bold mb-3">Advanced Features Available</h3>
                <ul className="space-y-2 text-purple-100">
                  <li>• Pump start relay integration</li>
                  <li>• Master valve control</li>
                  <li>• Rain sensor bypass logic</li>
                  <li>• API access for custom integrations</li>
                  <li>• Multi-program scheduling</li>
                  <li>• Remote diagnostics & updates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How We Transform Your Irrigation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From consultation to activation in as little as 1 day
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "01",
                title: "Site Assessment",
                description: "We evaluate your existing system, identify inefficiencies, and recommend smart upgrades",
                icon: Target
              },
              {
                step: "02",
                title: "Custom Design",
                description: "Create a tailored automation plan considering zones, water pressure, controller placement, and connectivity",
                icon: Settings
              },
              {
                step: "03",
                title: "Professional Installation",
                description: "Install hardware, configure software, test every zone, and ensure perfect connectivity",
                icon: Wrench
              },
              {
                step: "04",
                title: "Training & Support",
                description: "Show you how to use the app, optimize settings, and provide ongoing support",
                icon: Smartphone
              }
            ].map((process, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-1 bg-gradient-to-r from-cyan-300 to-blue-300 z-0"></div>
                )}

                <div className="relative bg-gradient-to-br from-cyan-50 to-blue-50 p-8 rounded-2xl border-2 border-cyan-200 hover:border-cyan-400 transition-all shadow-lg hover:shadow-2xl z-10">
                  <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-xl">
                    {process.step}
                  </div>
                  <process.icon className="w-12 h-12 text-cyan-600 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{process.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{process.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Common Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about smart irrigation
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Can you upgrade my existing system without replacing everything?",
                answer: "Absolutely! In most cases we can retrofit a smart controller to your existing valves and wiring. You keep your underground infrastructure and just upgrade the 'brain' of the system."
              },
              {
                question: "How much do smart irrigation controllers cost?",
                answer: "Controllers range from $150-500 depending on zone count and features. Installation typically adds $200-500. Many water districts offer rebates of $50-200. Custom large-property systems are quoted individually based on complexity."
              },
              {
                question: "Do I need Wi-Fi in my yard?",
                answer: "Controllers need Wi-Fi at the installation location (usually garage, shed, or exterior wall). If coverage is weak, we can recommend Wi-Fi extenders or use controllers with longer-range antennas."
              },
              {
                question: "What if my internet goes down?",
                answer: "Smart controllers store their schedules locally and continue operating even without internet. You lose remote control temporarily, but watering continues as programmed."
              },
              {
                question: "How long does installation take?",
                answer: "Simple controller swaps: 1-2 hours. Full system design/installation: 1-3 days depending on property size. We work efficiently to minimize disruption."
              },
              {
                question: "Do you service all brands of irrigation equipment?",
                answer: "Yes! We work with Rain Bird, Hunter, Rachio, Orbit, Irritrol, Toro, and all major brands. We also repair/replace valves, pipes, heads, and sensors."
              }
            ].map((faq, index) => (
              <details key={index} className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl border-2 border-cyan-200 hover:border-cyan-400 transition-all group">
                <summary className="font-bold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>{faq.question}</span>
                  <CheckCircle2 className="w-6 h-6 text-cyan-600 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-700 leading-relaxed pl-2 border-l-4 border-cyan-400">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-950 via-cyan-900 to-blue-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Droplets className="w-16 h-16 mx-auto mb-6 text-cyan-300 animate-pulse" />
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Automate Your Irrigation?
          </h2>
          <p className="text-xl text-cyan-100 mb-8 leading-relaxed">
            Join the smart irrigation revolution. Save water, save money, and never worry about watering again.
          </p>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/20 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-4xl font-bold mb-2">200+</div>
                <div className="text-cyan-200">Systems Installed</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">$500K+</div>
                <div className="text-cyan-200">Water Costs Saved</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-cyan-200">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/#contact"
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-900 px-10 py-5 rounded-xl font-bold hover:from-cyan-500 hover:to-blue-600 transition-all shadow-2xl hover:shadow-cyan-500/50 flex items-center gap-3 text-xl border-2 border-cyan-300 hover:scale-105 transform"
            >
              <Phone className="w-6 h-6" />
              Get Free Assessment
              <ArrowRight className="w-6 h-6" />
            </Link>
            <a
              href="https://elliottelford-dotcom-apgrcg6i3-elliot-telfords-projects.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-5 rounded-xl font-semibold hover:bg-white/20 transition-all shadow-xl text-lg hover:scale-105 transform flex items-center gap-2"
            >
              View Engineering Portfolio
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>

          <p className="text-cyan-200 text-sm">
            Serving Auburn, Roseville, Granite Bay, Lincoln, and Loomis • Licensed & Insured • Custom Engineering
          </p>
        </div>
      </section>
    </div>
  );
}
