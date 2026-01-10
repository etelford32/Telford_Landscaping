"use client";

import { useState, useEffect } from "react";
import { Bug, X, Activity, Clock, Layers } from "lucide-react";

interface DebugPanelProps {
  plantsCount: number;
  structuresCount: number;
  housesCount: number;
  historySize: number;
  canUndo: boolean;
  canRedo: boolean;
}

export default function DebugPanel({
  plantsCount,
  structuresCount,
  housesCount,
  historySize,
  canUndo,
  canRedo,
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState<number | null>(null);

  // FPS Counter
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    const animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Memory Usage (if available)
  useEffect(() => {
    const checkMemory = () => {
      if ((performance as any).memory) {
        const memoryInfo = (performance as any).memory;
        const usedMB = (memoryInfo.usedJSHeapSize / 1048576).toFixed(2);
        setMemory(parseFloat(usedMB));
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-gray-900/90 text-white p-3 rounded-lg shadow-lg hover:bg-gray-800 transition-colors z-50 flex items-center gap-2"
      >
        <Bug className="w-4 h-4" />
        <span className="text-xs font-mono">Debug</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900/95 backdrop-blur-sm text-white rounded-xl shadow-2xl overflow-hidden z-50 w-80">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-green-400" />
          <h3 className="font-bold text-sm">Debug Panel</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-gray-700 rounded p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 font-mono text-xs">
        {/* Performance Metrics */}
        <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="font-semibold">Performance</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">FPS:</span>
            <span className={fps >= 30 ? "text-green-400" : fps >= 20 ? "text-yellow-400" : "text-red-400"}>
              {fps}
            </span>
          </div>

          {memory !== null && (
            <div className="flex justify-between">
              <span className="text-gray-400">Memory:</span>
              <span className="text-blue-400">{memory} MB</span>
            </div>
          )}
        </div>

        {/* Scene Statistics */}
        <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Layers className="w-4 h-4" />
            <span className="font-semibold">Scene Stats</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Plants:</span>
            <span className="text-green-400">{plantsCount}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Structures:</span>
            <span className="text-amber-400">{structuresCount}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Houses:</span>
            <span className="text-purple-400">{housesCount}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Total Objects:</span>
            <span className="text-white">{plantsCount + structuresCount + housesCount}</span>
          </div>
        </div>

        {/* History */}
        <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="font-semibold">History</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">History Size:</span>
            <span className="text-yellow-400">{historySize}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Can Undo:</span>
            <span className={canUndo ? "text-green-400" : "text-red-400"}>
              {canUndo ? "Yes" : "No"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Can Redo:</span>
            <span className={canRedo ? "text-green-400" : "text-red-400"}>
              {canRedo ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gray-800/50 rounded-lg p-3 space-y-1">
          <div className="text-gray-400 text-[10px]">
            <div>Platform: {navigator.platform}</div>
            <div>UserAgent: {navigator.userAgent.substring(0, 40)}...</div>
          </div>
        </div>
      </div>
    </div>
  );
}
