'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { trackLead } from '@/lib/analytics';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  TreePine,
  Microscope,
  MapPin,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  User,
  MessageSquare,
  Shield,
  Award,
  Sprout
} from 'lucide-react';

export default function PlantCarePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    propertySize: '',
    service: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const services = [
    'Plant Health Assessment',
    'Integrated Pest Management',
    'Soil Analysis & Treatment',
    'Tree & Shrub Care',
    'Disease Diagnosis & Treatment',
    'Fertilization Programs',
    'Consultation & Planning'
  ];

  const locations = [
    'Auburn',
    'Loomis',
    'Granite Bay',
    'Roseville',
    'Newcastle',
    'Lincoln'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      // Redirect to signup with return URL
      router.push('/signup?redirect=/plant-care');
      return;
    }

    setFormStatus('submitting');
    setErrorMessage('');

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/contact/plant-care', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        setFormStatus('success');
        // Track the consultation-request conversion.
        trackLead('plant_care_contact', {
          location: formData.location,
          service: formData.service,
        });
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      setFormStatus('error');
      setErrorMessage('Failed to submit form. Please try again.');
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 via-primary-800 to-earth-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 animate-leaf-float">
            <Leaf className="w-12 h-12 text-primary-300" />
          </div>
          <div className="absolute top-40 right-20 animate-leaf-float" style={{ animationDelay: '2s' }}>
            <TreePine className="w-16 h-16 text-primary-300" />
          </div>
          <div className="absolute bottom-20 left-1/4 animate-leaf-float" style={{ animationDelay: '4s' }}>
            <Sprout className="w-10 h-10 text-primary-300" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block p-3 bg-primary-600/20 rounded-full mb-6 backdrop-blur-sm">
              <Microscope className="w-12 h-12 text-primary-300" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
              Science-Based Plant Healthcare
            </h1>
            <p className="text-2xl sm:text-3xl text-primary-100 mb-4 font-light">
              For Northern California Estates
            </p>
            <p className="text-lg text-primary-200 max-w-3xl mx-auto leading-relaxed">
              Certified Arborist & Landscape Health Consultant offering Integrated Plant Management
              and Precision Soil & Plant Healthcare for your property.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all">
              <Award className="w-10 h-10 text-primary-300 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-2">Plant Vitality Expert and Arborist</h3>
              <p className="text-primary-100">10 years of hands-on experience</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all">
              <Shield className="w-10 h-10 text-primary-300 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-2">Licensed, Bonded & Insured</h3>
              <p className="text-primary-100">CA C-27 Lic. #1156976 · Full liability coverage</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all">
              <TreePine className="w-10 h-10 text-primary-300 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-2">Eco-Friendly</h3>
              <p className="text-primary-100">Sustainable, organic-first approach</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Comprehensive Plant Health Services
          </h2>
          <p className="text-primary-100 text-center mb-12 max-w-2xl mx-auto">
            Our integrated approach combines cutting-edge diagnostics with time-tested horticultural practices
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Microscope,
                title: 'Plant Health Assessment',
                description: 'Comprehensive diagnostics including nutrient analysis, pest identification, and disease screening'
              },
              {
                icon: Shield,
                title: 'Integrated Pest Management',
                description: 'Eco-friendly pest control strategies that minimize chemical use and protect beneficial insects'
              },
              {
                icon: Leaf,
                title: 'Soil Analysis & Treatment',
                description: 'Laboratory-grade soil testing with customized amendment recommendations'
              },
              {
                icon: TreePine,
                title: 'Tree & Shrub Care',
                description: 'Expert pruning, structural support, and health maintenance for all woody plants'
              },
              {
                icon: Sprout,
                title: 'Disease Diagnosis',
                description: 'Rapid identification and treatment of plant diseases using latest research'
              },
              {
                icon: Award,
                title: 'Fertilization Programs',
                description: 'Science-based nutrition plans tailored to your soil and plant needs'
              }
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300"
              >
                <service.icon className="w-12 h-12 text-primary-300 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-primary-100 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <MapPin className="w-12 h-12 text-primary-300 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-4">Serving Premium Locations</h2>
            <p className="text-primary-100 max-w-2xl mx-auto">
              We specialize in high-end estate properties throughout Northern California's most prestigious areas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {locations.slice(0, -1).map((location, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-center hover:bg-white/20 transition-all"
              >
                <MapPin className="w-6 h-6 text-primary-300 mx-auto mb-2" />
                <p className="text-white font-semibold">{location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Why Choose Our Services?</h2>

          <div className="space-y-4">
            {[
              'Advanced diagnostics using laboratory testing and microscopy',
              'Customized treatment plans based on your property\'s unique ecosystem',
              'Organic and sustainable practices that protect the environment',
              'Regular monitoring and adjustments to ensure optimal plant health',
              'Emergency response for urgent plant health issues',
              'Detailed reporting and documentation of all treatments',
              'Educational guidance to help you maintain healthy landscapes'
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all"
              >
                <CheckCircle className="w-6 h-6 text-primary-300 flex-shrink-0 mt-1" />
                <p className="text-primary-100 text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Schedule Your Consultation</h2>
            {!isAuthenticated && (
              <div className="bg-primary-600/20 backdrop-blur-md border border-primary-400/30 rounded-lg p-4 mb-6">
                <p className="text-primary-100 text-lg">
                  <strong>Create a free account</strong> to schedule your plant health consultation.
                  It only takes a moment!
                </p>
              </div>
            )}
            <p className="text-primary-100 text-lg">
              Get a professional assessment of your property's plant health needs
            </p>
          </div>

          {formStatus === 'success' ? (
            <div className="bg-primary-600/30 backdrop-blur-md border border-primary-400/50 rounded-xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-primary-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Thank You!</h3>
              <p className="text-primary-100 text-lg mb-6">
                We've received your consultation request. We'll contact you within 24 hours to schedule your assessment.
              </p>
              <button
                onClick={() => {
                  setFormStatus('idle');
                  setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: '',
                    location: '',
                    propertySize: '',
                    service: '',
                    message: ''
                  });
                }}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-100 text-center">
                    You'll be prompted to create an account before submitting
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-100 text-center">{errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-primary-100 font-semibold mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-primary-100 font-semibold mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="phone" className="block text-primary-100 font-semibold mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-primary-100 font-semibold mb-2">
                    Property Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <select
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-primary-900">Select location...</option>
                      {locations.map((location, index) => (
                        <option key={index} value={location} className="bg-primary-900">
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="propertySize" className="block text-primary-100 font-semibold mb-2">
                    Property Size (acres)
                  </label>
                  <input
                    type="text"
                    id="propertySize"
                    name="propertySize"
                    value={formData.propertySize}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    placeholder="e.g., 2.5 acres"
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-primary-100 font-semibold mb-2">
                    Service Needed *
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-primary-900">Select service...</option>
                    {services.map((service, index) => (
                      <option key={index} value={service} className="bg-primary-900">
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-primary-100 font-semibold mb-2">
                  Tell Us About Your Concerns *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-primary-400" />
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
                    placeholder="Describe any plant health issues, concerns, or questions you have..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="w-full bg-primary-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-primary-900 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span>{formStatus === 'submitting' ? 'Submitting...' : isAuthenticated ? 'Schedule Consultation' : 'Create Account & Schedule'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {!isAuthenticated && (
                <p className="text-primary-200 text-sm text-center mt-4">
                  Already have an account?{' '}
                  <a href="/login?redirect=/plant-care" className="text-primary-300 hover:text-primary-200 underline">
                    Sign in here
                  </a>
                </p>
              )}
            </form>
          )}
        </div>
      </section>

      {/* Animations */}
      <style jsx global>{`
        @keyframes leaf-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }

        .animate-leaf-float {
          animation: leaf-float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
