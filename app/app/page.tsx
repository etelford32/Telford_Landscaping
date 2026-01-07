"use client";

import dynamic from "next/dynamic";

const DesignCanvas = dynamic(() => import("@/components/design/DesignCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 to-sky-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">Loading Design Tool...</p>
      </div>
    </div>
  ),
});

export default function AppPage() {
  // No authentication gate - design tool is freely accessible
  return (
    <div className="w-full h-screen">
      <DesignCanvas />
    </div>
  );
}
