"use client";

import { ZoomIn, ZoomOut, RotateCw, RotateCcw, MoveHorizontal, RefreshCw } from "lucide-react";

interface CameraControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
  onReset: () => void;
}

export default function CameraControls({
  onZoomIn,
  onZoomOut,
  onRotateLeft,
  onRotateRight,
  onPanLeft,
  onPanRight,
  onReset,
}: CameraControlsProps) {
  return (
    <div className="absolute bottom-24 right-6 z-20">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-4 space-y-3 border-2 border-white/50">
        {/* Title */}
        <div className="text-center mb-2">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Camera Controls
          </h3>
        </div>

        {/* Zoom Controls */}
        <div className="space-y-2">
          <p className="text-xs text-gray-600 font-semibold mb-1">Zoom</p>
          <div className="flex gap-2">
            <button
              onClick={onZoomIn}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
              <span className="text-sm font-semibold">In</span>
            </button>
            <button
              onClick={onZoomOut}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
              <span className="text-sm font-semibold">Out</span>
            </button>
          </div>
        </div>

        {/* Rotate Controls */}
        <div className="space-y-2">
          <p className="text-xs text-gray-600 font-semibold mb-1">Rotate</p>
          <div className="flex gap-2">
            <button
              onClick={onRotateLeft}
              className="flex-1 flex items-center justify-center gap-2 bg-earth-600 hover:bg-earth-700 text-white px-4 py-3 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
              title="Rotate Left"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="text-sm font-semibold">Left</span>
            </button>
            <button
              onClick={onRotateRight}
              className="flex-1 flex items-center justify-center gap-2 bg-earth-600 hover:bg-earth-700 text-white px-4 py-3 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
              title="Rotate Right"
            >
              <RotateCw className="w-5 h-5" />
              <span className="text-sm font-semibold">Right</span>
            </button>
          </div>
        </div>

        {/* Pan Controls */}
        <div className="space-y-2">
          <p className="text-xs text-gray-600 font-semibold mb-1">Pan</p>
          <div className="flex gap-2">
            <button
              onClick={onPanLeft}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
              title="Pan Left"
            >
              <MoveHorizontal className="w-5 h-5 rotate-180" />
              <span className="text-sm font-semibold">Left</span>
            </button>
            <button
              onClick={onPanRight}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
              title="Pan Right"
            >
              <MoveHorizontal className="w-5 h-5" />
              <span className="text-sm font-semibold">Right</span>
            </button>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-earth-600 hover:from-primary-700 hover:to-earth-700 text-white px-4 py-3 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 border-t-2 border-white/20 mt-3"
          title="Reset Camera"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-sm font-semibold">Reset View</span>
        </button>
      </div>
    </div>
  );
}
