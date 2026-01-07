"use client";

import dynamic from "next/dynamic";

const EnhancedDesignCanvas = dynamic(() => import("@/components/design/EnhancedDesignCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 to-sky-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">Loading OOP 3D Editor...</p>
        <p className="text-sm text-gray-600 mt-2">Initializing Camera, Selection & Drag Systems...</p>
      </div>
    </div>
  ),
});

export default function AppPage() {
  // No authentication gate - design tool is freely accessible
  // Uses Object-Oriented Design with separate systems for:
  // - CameraController (camera movement & positioning)
  // - SelectionManager (object selection logic)
  // - DragController (drag & drop functionality)
  // - SceneManager (houses & ground management)
  return (
    <div className="w-full h-screen">
      <EnhancedDesignCanvas />
    </div>
  );
}
