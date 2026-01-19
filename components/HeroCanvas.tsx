"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import 3D components to avoid SSR issues
const LandscapeScene = dynamic(() => import("./3d/LandscapeScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-primary-800/20 to-earth-800/20 animate-pulse" />
  ),
});

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-primary-800/20 to-earth-800/20 animate-pulse" />
        }
      >
        <LandscapeScene />
      </Suspense>
    </div>
  );
}
