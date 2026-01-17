"use client";

import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues with Three.js
// IntegratedDesignCanvas includes all UI enhancements: draggable panels, grid editor, design hub
const IntegratedDesignCanvas = dynamic(() => import("@/components/design/IntegratedDesignCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 to-sky-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">Loading 3D Design Tool...</p>
        <p className="text-sm text-gray-600 mt-2">Enhanced with draggable panels and grid editor</p>
      </div>
    </div>
  ),
});

export default function DesignPage() {
  return (
    <div className="w-full h-screen">
      <IntegratedDesignCanvas />
    </div>
  );
}
