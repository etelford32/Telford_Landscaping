import type { Metadata } from "next";
import { MapPin, Calendar, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Portfolio | Telford Landscaping - Completed Projects in Auburn, Roseville & Beyond",
  description: "View our portfolio of completed landscaping projects in Auburn, Roseville, Granite Bay, Lincoln, and Loomis. Expert craftsmanship and beautiful outdoor transformations.",
  keywords: "landscaping portfolio, Auburn landscaping projects, Roseville landscape design, before and after landscaping, California landscaping gallery",
};

interface Project {
  id: number;
  title: string;
  location: string;
  date: string;
  category: string;
  description: string;
  features: string[];
  imageColor: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Modern Drought-Tolerant Garden",
    location: "Granite Bay, CA",
    date: "Fall 2025",
    category: "Landscape Design",
    description: "Complete yard transformation featuring native California plants, decomposed granite pathways, and water-efficient irrigation system.",
    features: ["Native plant selection", "Drip irrigation", "Granite pathways", "Rock gardens"],
    imageColor: "from-green-400 to-emerald-600",
  },
  {
    id: 2,
    title: "Backyard Deck & Patio Installation",
    location: "Auburn, CA",
    date: "Summer 2025",
    category: "Hardscaping",
    description: "Custom redwood deck with built-in seating, complemented by a flagstone patio and outdoor lighting.",
    features: ["Redwood deck", "Flagstone patio", "Built-in seating", "LED lighting"],
    imageColor: "from-amber-400 to-orange-600",
  },
  {
    id: 3,
    title: "Front Yard Curb Appeal Makeover",
    location: "Roseville, CA",
    date: "Spring 2025",
    category: "Full Landscape",
    description: "Enhanced curb appeal with terraced planting beds, decorative river rock, and seasonal flowering plants.",
    features: ["Terraced beds", "River rock accents", "Seasonal flowers", "New sod installation"],
    imageColor: "from-purple-400 to-pink-600",
  },
  {
    id: 4,
    title: "Custom Fence & Garden Beds",
    location: "Lincoln, CA",
    date: "Winter 2025",
    category: "Handyman & Landscaping",
    description: "Cedar fence installation with integrated raised garden beds for vegetables and herbs.",
    features: ["Cedar fencing", "Raised garden beds", "Drip irrigation", "Soil preparation"],
    imageColor: "from-sky-400 to-blue-600",
  },
  {
    id: 5,
    title: "Hillside Erosion Control & Planting",
    location: "Loomis, CA",
    date: "Fall 2024",
    category: "Landscape Design",
    description: "Slope stabilization using native grasses and drought-resistant plants with decorative boulder placement.",
    features: ["Erosion control", "Native grasses", "Boulder placement", "Ground cover"],
    imageColor: "from-teal-400 to-cyan-600",
  },
  {
    id: 6,
    title: "Outdoor Living Space",
    location: "Auburn, CA",
    date: "Summer 2024",
    category: "Hardscaping",
    description: "Complete outdoor entertainment area with pergola, built-in BBQ station, and fire pit.",
    features: ["Custom pergola", "BBQ station", "Fire pit", "Paver patio"],
    imageColor: "from-red-400 to-rose-600",
  },
];

const categories = ["All", "Landscape Design", "Hardscaping", "Full Landscape", "Handyman & Landscaping"];

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-earth-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Our Portfolio
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Explore our completed projects showcasing quality craftsmanship and attention to detail across the Greater Sacramento area
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section - Ready for future interactivity */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  category === "All"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow group"
              >
                {/* Placeholder Image - Replace with actual images */}
                <div className={`h-64 bg-gradient-to-br ${project.imageColor} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center p-6">
                      <p className="text-sm font-medium mb-2 opacity-90">Project Photo</p>
                      <p className="text-xs opacity-75">Add your project images here</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Project Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {project.title}
                  </h3>

                  <div className="flex flex-col gap-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-600" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary-600" />
                      <span>{project.date}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary-600" />
                      Key Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.features.map((feature, index) => (
                        <span
                          key={index}
                          className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Section - Placeholder for future content */}
      <section className="py-20 bg-gradient-to-br from-earth-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Transformation Stories
            </h2>
            <p className="text-xl text-gray-600">
              See the dramatic before and after transformations
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Before</h3>
                <div className="aspect-video bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <p className="font-medium mb-1">Before Photo</p>
                    <p className="text-sm opacity-75">Add transformation images</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">After</h3>
                <div className="aspect-video bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <p className="font-medium mb-1">After Photo</p>
                    <p className="text-sm opacity-75">Showcase the transformation</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-gray-700 text-lg">
                This space is ready for your amazing before and after photos! Each transformation tells a story of quality work and customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Let's transform your outdoor space into something extraordinary
          </p>
          <a
            href="/#contact"
            className="inline-block bg-white text-primary-900 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-lg"
          >
            Get Free Consultation
          </a>
        </div>
      </section>
    </div>
  );
}
