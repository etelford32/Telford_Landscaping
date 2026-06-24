"use client";

import { useState } from "react";
import { X, Sparkles, Eye, MousePointer2, Info } from "lucide-react";
import Link from "next/link";

interface DemoOverlayProps {
  onClose?: () => void;
}

export default function DemoOverlay({ onClose }: DemoOverlayProps) {
  const [showTips, setShowTips] = useState(true);
  const [showSubscribePrompt, setShowSubscribePrompt] = useState(false);

  return (
    <>
      {/* Interactive Tips */}
      {showTips && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 max-w-sm animate-fade-in z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-gray-900">Interactive Demo</h3>
            </div>
            <button
              onClick={() => setShowTips(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <MousePointer2 className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <span>Click and drag to rotate the view</span>
            </div>
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <span>Scroll to zoom in and out</span>
            </div>
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <span>Explore the 3D landscaping around the house</span>
            </div>
          </div>

          <button
            onClick={() => setShowSubscribePrompt(true)}
            className="mt-4 w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm"
          >
            Create Your Own Design
          </button>
        </div>
      )}

      {/* Subscribe Prompt Modal */}
      {showSubscribePrompt && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-20">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Unlock Full 3D Design Tools
                </h3>
                <p className="text-gray-600">
                  This is just a preview! With Telford Landscaping PRO, you can:
                </p>
              </div>
              <button
                onClick={() => setShowSubscribePrompt(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <div className="bg-primary-100 p-1 rounded-full mt-0.5">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Upload Your Yard</p>
                  <p className="text-sm text-gray-600">Use iPhone 3D mapping or photos</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary-100 p-1 rounded-full mt-0.5">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">3D Plant Library</p>
                  <p className="text-sm text-gray-600">Browse 100+ native California plants</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary-100 p-1 rounded-full mt-0.5">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Design & Visualize</p>
                  <p className="text-sm text-gray-600">Place plants, see them grow over time</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary-100 p-1 rounded-full mt-0.5">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Professional Installation</p>
                  <p className="text-sm text-gray-600">Share designs for quotes & installation</p>
                </div>
              </li>
            </ul>

            <div className="bg-gradient-to-r from-primary-50 to-earth-50 rounded-xl p-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Starting at</p>
                <p className="text-3xl font-bold text-gray-900">$15<span className="text-lg text-gray-600">/month</span></p>
                <p className="text-sm text-primary-700 font-semibold mt-1">Coming Soon!</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center"
              >
                Start Designing Free →
              </Link>
              <Link
                href="/login"
                className="block w-full bg-white border-2 border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-center"
              >
                Already have an account? Sign In
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Banner - CTA */}
      <Link
        href="/signup"
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full px-6 py-3 shadow-2xl z-10 transition-all hover:scale-105 hover:shadow-3xl"
      >
        <p className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Start Designing Your Landscape - Free →</span>
        </p>
      </Link>
    </>
  );
}
