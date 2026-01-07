"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Sky } from "@react-three/drei";
import { Suspense, useState } from "react";
import House3D from "./House3D";
import { Tree, Bush, FlowerBed, Rock } from "./Landscaping";

function Ground() {
  return (
    <>
      {/* Main lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#4a7c2f" roughness={0.8} />
      </mesh>

      {/* Driveway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.5, 0.01, 4]} receiveShadow>
        <planeGeometry args={[2.5, 6]} />
        <meshStandardMaterial color="#555555" roughness={0.7} />
      </mesh>

      {/* Front walkway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 4.5]} receiveShadow>
        <planeGeometry args={[1, 4]} />
        <meshStandardMaterial color="#c8a76b" roughness={0.6} />
      </mesh>

      {/* Patio/Deck area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3, 0.02, -2]} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#8b7355" roughness={0.5} />
      </mesh>
    </>
  );
}

function Lighting() {
  return (
    <>
      {/* Sunlight */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      {/* Ambient light */}
      <ambientLight intensity={0.6} />
      {/* Hemisphere light for natural look */}
      <hemisphereLight args={["#87CEEB", "#4a7c2f", 0.5]} />
    </>
  );
}

function Scene() {
  return (
    <>
      {/* Sky */}
      <Sky sunPosition={[10, 5, 10]} />

      {/* Lighting */}
      <Lighting />

      {/* Ground */}
      <Ground />

      {/* House */}
      <House3D />

      {/* Front Yard Landscaping */}
      <Tree position={[-3, 0, 3]} scale={1.2} treeType="oak" />
      <Tree position={[4, 0, 3]} scale={1} treeType="pine" />

      {/* Bushes along front of house */}
      <Bush position={[-1.2, 0, 2.5]} scale={0.8} />
      <Bush position={[1.2, 0, 2.5]} scale={0.8} />

      {/* Flower beds */}
      <FlowerBed position={[-1.5, 0, 3]} width={1.5} depth={0.8} />
      <FlowerBed position={[1.5, 0, 3]} width={1.5} depth={0.8} />

      {/* Backyard landscaping */}
      <Tree position={[-5, 0, -4]} scale={1.3} treeType="oak" />
      <Tree position={[3, 0, -5]} scale={1.1} treeType="pine" />
      <Tree position={[-2, 0, -6]} scale={0.9} treeType="palm" />

      {/* Patio area bushes */}
      <Bush position={[-5, 0, -2]} scale={1} color="#3a6b1f" />
      <Bush position={[-5, 0, -0.5]} scale={0.9} color="#4a7c2f" />
      <Bush position={[-3, 0, -4.5]} scale={1.1} color="#3d8b40" />

      {/* Decorative rocks */}
      <Rock position={[-2.5, 0, 3.5]} scale={0.8} />
      <Rock position={[-2.3, 0, 3.2]} scale={0.6} />
      <Rock position={[2.5, 0, 3.4]} scale={0.7} />

      {/* Side yard trees */}
      <Tree position={[6, 0, 0]} scale={1} treeType="oak" />
      <Tree position={[-6, 0, -1]} scale={1.2} treeType="pine" />
    </>
  );
}

export default function LandscapeScene() {
  const [isRotating, setIsRotating] = useState(true);

  return (
    <Canvas
      shadows
      className="w-full h-full"
      gl={{ antialias: true, alpha: true }}
      onPointerDown={() => setIsRotating(false)}
    >
      <PerspectiveCamera makeDefault position={[12, 8, 12]} fov={50} />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={8}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
        autoRotate={isRotating}
        autoRotateSpeed={0.5}
        target={[0, 1, 0]}
      />

      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
