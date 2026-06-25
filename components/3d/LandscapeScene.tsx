"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Sky, Environment, Lightformer } from "@react-three/drei";
import { Suspense, useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Palette, Sprout, TreePine, Layers, ChevronRight, Play, Pause } from "lucide-react";
import Link from "next/link";
import House3D from "./House3D";
import { FlowerBed, Rock } from "./Landscaping";
import SampleLandscapePlants from "./SampleLandscapePlants";

const MIN_AGE = 1;
const MAX_AGE = 30;
const INSTALL_YEAR = 2026;
const AUTOPLAY_DURATION_MS = 9000; // year 1 → year 30 over ~9s

// ── GROUND ──────────────────────────────────────────────────────────────────
function Ground() {
  return (
    <>
      {/* Main lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#4E8035" roughness={0.85} />
      </mesh>

      {/* Driveway - curved approach */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.5, 0.01, 4]} receiveShadow>
        <planeGeometry args={[3.2, 7]} />
        <meshStandardMaterial color="#5A5550" roughness={0.75} />
      </mesh>

      {/* Front walkway — wider, stone pavers */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 5.0]} receiveShadow>
        <planeGeometry args={[1.5, 5]} />
        <meshStandardMaterial color="#C8B89A" roughness={0.7} />
      </mesh>
      {/* Paver stones */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 3.2 + i * 0.75]} receiveShadow>
          <planeGeometry args={[1.35, 0.6]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#C0A888" : "#BBA07A"} roughness={0.85} />
        </mesh>
      ))}

      {/* Patio / deck area — rear left */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, 0.02, -3.5]} receiveShadow>
        <planeGeometry args={[5.5, 5]} />
        <meshStandardMaterial color="#B8A080" roughness={0.6} />
      </mesh>
      {/* Patio deck planks */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, 0.025, -1.2 - i * 0.5]} receiveShadow>
          <planeGeometry args={[5.48, 0.42]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#C0A880" : "#B4987A"} roughness={0.75} />
        </mesh>
      ))}

      {/* Pool */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, 0.03, -3.5]} receiveShadow>
        <planeGeometry args={[3.5, 2.5]} />
        <meshStandardMaterial color="#4FC8D8" roughness={0.05} metalness={0.15} transparent opacity={0.88} />
      </mesh>
      {/* Pool coping edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, 0.02, -3.5]}>
        <planeGeometry args={[3.9, 2.9]} />
        <meshStandardMaterial color="#D8CEB8" roughness={0.7} />
      </mesh>
      {/* Re-draw pool water on top */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, 0.03, -3.5]}>
        <planeGeometry args={[3.5, 2.5]} />
        <meshStandardMaterial color="#4FC8D8" roughness={0.05} metalness={0.15} transparent opacity={0.88} />
      </mesh>

      {/* Side garden beds alongside house */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.0, 0.015, 1.0]} receiveShadow>
        <planeGeometry args={[1.2, 4.5]} />
        <meshStandardMaterial color="#3A2E1E" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.2, 0.015, 1.0]} receiveShadow>
        <planeGeometry args={[1.0, 4.5]} />
        <meshStandardMaterial color="#3A2E1E" roughness={0.95} />
      </mesh>

      {/* Front garden bed strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 2.8]} receiveShadow>
        <planeGeometry args={[6.5, 0.9]} />
        <meshStandardMaterial color="#3A2E1E" roughness={0.95} />
      </mesh>
    </>
  );
}

// ── LIGHTING ─────────────────────────────────────────────────────────────────
function Lighting() {
  return (
    <>
      {/* Golden hour sun — low angle from south-west */}
      <directionalLight
        position={[18, 8, 10]}
        intensity={1.35}
        color="#FFF8EE"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={60}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />
      {/* Fill light — cool sky bounce */}
      <directionalLight position={[-8, 12, -5]} intensity={0.4} color="#C8DFF0" />
      {/* Warm ambient */}
      <ambientLight intensity={0.55} color="#FFF4E8" />
      {/* Hemisphere — sky to ground */}
      <hemisphereLight args={["#A8D4F0", "#5C8A3A", 0.45]} />
    </>
  );
}

// ── SCENE ────────────────────────────────────────────────────────────────────
function Scene({ age }: { age: number }) {
  return (
    <>
      <Sky sunPosition={[18, 4, 10]} turbidity={4} rayleigh={0.8} />

      {/* Local image-based lighting — baked once from in-scene light shapes
          (no CDN/HDRI fetch). Gives leaves, bark, pool, and glass something
          to reflect. */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={0.6} position={[0, 6, -4]} scale={[12, 12, 1]} color="#bcd6ee" />
        <Lightformer intensity={1.1} position={[16, 9, 8]} scale={[5, 5, 1]} color="#fff1dd" />
        <Lightformer intensity={0.4} position={[-10, 4, -6]} scale={[8, 8, 1]} color="#a9c7e0" />
      </Environment>

      <Lighting />
      <Ground />
      <House3D />

      {/* Age-driven plantings — drawn from the real plant library growth models */}
      <SampleLandscapePlants age={age} />

      {/* Static decoration — flower beds and rocks don't grow */}
      <FlowerBed position={[-2.5, 0, 3.1]} width={2.0} depth={0.75} />
      <FlowerBed position={[2.5, 0, 3.1]} width={2.0} depth={0.75} />
      <FlowerBed position={[-6.5, 0, -5.5]} width={2.5} depth={0.8} />

      <Rock position={[-1.0, 0, 2.8]} scale={0.75} />
      <Rock position={[1.0, 0, 2.8]} scale={0.65} />
      <Rock position={[-0.7, 0, 3.5]} scale={0.5} />
    </>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LandscapeScene() {
  const [isRotating, setIsRotating] = useState(true);
  const [age, setAge] = useState<number>(MIN_AGE);
  const [isPlaying, setIsPlaying] = useState(true);
  const playStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  // Auto-play: animate age from MIN → MAX over AUTOPLAY_DURATION_MS, then pause at MAX.
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      playStartRef.current = null;
      return;
    }

    const step = (now: number) => {
      if (playStartRef.current === null) {
        // Anchor the clock to the current age so pressing Play resumes smoothly.
        const progressedMs =
          ((age - MIN_AGE) / (MAX_AGE - MIN_AGE)) * AUTOPLAY_DURATION_MS;
        playStartRef.current = now - progressedMs;
      }
      const elapsed = now - (playStartRef.current ?? now);
      const t = Math.min(1, elapsed / AUTOPLAY_DURATION_MS);
      const nextAge = MIN_AGE + t * (MAX_AGE - MIN_AGE);
      setAge(nextAge);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setIsPlaying(false);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // We intentionally only rerun when play state flips; reading age inside step
    // stays current via the closure over the latest state setter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const stopAutoPlay = () => {
    setIsPlaying(false);
    playStartRef.current = null;
  };

  const handleAgeChange = (v: number) => {
    stopAutoPlay();
    setAge(v);
  };

  const handlePlayToggle = () => {
    // If we're at the end, restart from the beginning.
    if (!isPlaying && age >= MAX_AGE - 0.01) {
      playStartRef.current = null;
      setAge(MIN_AGE);
    } else {
      playStartRef.current = null;
    }
    setIsPlaying((p) => !p);
  };

  const displayAge = Math.round(age);
  const displayYear = INSTALL_YEAR + displayAge - 1;

  const handleZoomIn = () => {
    if (controlsRef.current && cameraRef.current) {
      const d = controlsRef.current.getDistance();
      const newD = Math.max(9, d - 2.5);
      const dir = cameraRef.current.position.clone().sub(controlsRef.current.target).normalize();
      cameraRef.current.position.copy(controlsRef.current.target.clone().add(dir.multiplyScalar(newD)));
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current && cameraRef.current) {
      const d = controlsRef.current.getDistance();
      const newD = Math.min(28, d + 2.5);
      const dir = cameraRef.current.position.clone().sub(controlsRef.current.target).normalize();
      cameraRef.current.position.copy(controlsRef.current.target.clone().add(dir.multiplyScalar(newD)));
      controlsRef.current.update();
    }
  };

  const handleReset = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(14, 7, 14);
      controlsRef.current.target.set(0, 0.5, 0);
      controlsRef.current.update();
      setIsRotating(true);
    }
  };

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        className="w-full h-full"
        gl={{ antialias: true, alpha: true }}
        style={{ touchAction: "pan-y" }}
        onPointerDown={() => setIsRotating(false)}
      >
        <PerspectiveCamera ref={cameraRef} makeDefault position={[14, 7, 14]} fov={55} />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={false}
          minDistance={9}
          maxDistance={28}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={Math.PI / 7}
          autoRotate={isRotating}
          autoRotateSpeed={0.35}
          target={[0, 0.5, 0]}
        />

        <Suspense fallback={null}>
          {/* Quantize to integer years: the autoplay clock advances `age` ~60x/s
              but plants only need per-year granularity, so memoized PlantModels
              skip re-rendering between year steps (and procedural plants already
              step per year internally). */}
          <Scene age={Math.round(age)} />
        </Suspense>
      </Canvas>

      {/* ── GROWTH TIMELINE — top center ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[min(92vw,560px)] pointer-events-auto">
        <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayToggle}
              className="flex-shrink-0 bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-lg shadow-md transition-colors active:scale-95"
              aria-label={isPlaying ? "Pause growth simulation" : "Play growth simulation"}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-white text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-primary-200">
                  See Your Yard in {INSTALL_YEAR + MAX_AGE - 1}
                </span>
                <span className="text-white font-bold text-sm sm:text-base tabular-nums">
                  Year {displayAge}
                  <span className="text-white/50 font-normal ml-1.5">· {displayYear}</span>
                </span>
              </div>
              <input
                type="range"
                min={MIN_AGE}
                max={MAX_AGE}
                step={1}
                value={displayAge}
                onChange={(e) => handleAgeChange(parseInt(e.target.value, 10))}
                onPointerDown={stopAutoPlay}
                className="w-full h-1.5 appearance-none cursor-pointer bg-white/25 rounded-full accent-primary-400"
                aria-label="Plant age in years"
              />
              <div className="flex justify-between text-[10px] text-white/50 mt-0.5 tabular-nums">
                <span>Year 1</span>
                <span>Year 15</span>
                <span>Year 30</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ZOOM CONTROLS — bottom left ── */}
      <div className="absolute bottom-6 left-5 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-black/40 backdrop-blur-md hover:bg-black/60 text-white p-2.5 rounded-lg border border-white/20 hover:border-white/40 transition-all active:scale-95 shadow-lg"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-black/40 backdrop-blur-md hover:bg-black/60 text-white p-2.5 rounded-lg border border-white/20 hover:border-white/40 transition-all active:scale-95 shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="bg-black/40 backdrop-blur-md hover:bg-black/60 text-white p-2.5 rounded-lg border border-white/20 hover:border-white/40 transition-all active:scale-95 shadow-lg"
          title="Reset View"
        >
          <span className="text-xs font-bold">↺</span>
        </button>
      </div>

      {/* ── DESIGN APP PORTAL PANEL — right side ── */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-52 hidden md:flex flex-col gap-2.5">
        {/* Panel header */}
        <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <Palette className="w-3.5 h-3.5 text-primary-300" />
            <span className="text-white text-xs font-bold tracking-widest uppercase">Design Studio</span>
          </div>
          <p className="text-white/50 text-xs">Live 3D Preview</p>
        </div>

        {/* Feature pills */}
        {[
          { icon: TreePine, label: "30-Yr Growth Sim", sub: "Watch plants mature" },
          { icon: Sprout,   label: "Plant Library",    sub: "80+ CA species" },
          { icon: Layers,   label: "Hardscape Tools",  sub: "Paths, walls & more" },
        ].map(({ icon: Icon, label, sub }) => (
          <div
            key={label}
            className="bg-black/40 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2.5 flex items-center gap-3 hover:bg-black/55 hover:border-white/30 transition-all"
          >
            <div className="p-1.5 bg-primary-600/30 rounded-lg flex-shrink-0">
              <Icon className="w-3.5 h-3.5 text-primary-300" />
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold leading-tight">{label}</div>
              <div className="text-white/45 text-xs leading-tight truncate">{sub}</div>
            </div>
          </div>
        ))}

        {/* CTA button */}
        <Link
          href="/app"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-500 hover:to-green-500 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 border border-primary-400/30"
        >
          <Palette className="w-4 h-4" />
          Open Design Tool
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── INTERACTION HINT ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-black/35 backdrop-blur-sm border border-white/15 text-white/60 text-xs px-3 py-1.5 rounded-full">
          Drag to rotate
        </div>
      </div>
    </div>
  );
}
