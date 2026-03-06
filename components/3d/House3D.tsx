"use client";

export default function House3D() {
  return (
    <group position={[0, 0, 0]}>

      {/* ── STONE FOUNDATION ── */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[8.2, 0.3, 5.6]} />
        <meshStandardMaterial color="#9A8B79" roughness={0.95} />
      </mesh>

      {/* ── MAIN BODY (wide, landscape ratio) ── */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.0, 2.7, 5]} />
        <meshStandardMaterial color="#EDE6D8" roughness={0.65} metalness={0.02} />
      </mesh>

      {/* Horizontal siding trim lines on front */}
      {[0.9, 1.5, 2.1].map((y, i) => (
        <mesh key={i} position={[0, y, 2.502]}>
          <boxGeometry args={[7.02, 0.05, 0.01]} />
          <meshStandardMaterial color="#D4CBBC" roughness={0.9} />
        </mesh>
      ))}

      {/* ── GABLE ROOF (low pitch) ── */}
      {/* Eave / soffit base */}
      <mesh position={[0, 2.88, 0]} castShadow>
        <boxGeometry args={[7.65, 0.14, 5.65]} />
        <meshStandardMaterial color="#2C2420" roughness={0.7} />
      </mesh>
      {/* Left slope — angle ≈ 11.5° around Z */}
      <mesh position={[-1.88, 3.12, 0]} rotation={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[3.72, 0.13, 5.65]} />
        <meshStandardMaterial color="#2C2420" roughness={0.8} />
      </mesh>
      {/* Right slope */}
      <mesh position={[1.88, 3.12, 0]} rotation={[0, 0, -0.2]} castShadow>
        <boxGeometry args={[3.72, 0.13, 5.65]} />
        <meshStandardMaterial color="#2C2420" roughness={0.8} />
      </mesh>
      {/* Ridge cap */}
      <mesh position={[0, 3.46, 0]}>
        <boxGeometry args={[0.22, 0.1, 5.65]} />
        <meshStandardMaterial color="#1C1410" roughness={0.9} />
      </mesh>

      {/* ── COVERED FRONT PORCH ── */}
      {/* Porch roof */}
      <mesh position={[0, 2.65, 3.55]} castShadow>
        <boxGeometry args={[4.8, 0.13, 2.0]} />
        <meshStandardMaterial color="#2C2420" roughness={0.7} />
      </mesh>
      {/* Porch fascia */}
      <mesh position={[0, 2.59, 4.5]}>
        <boxGeometry args={[4.8, 0.18, 0.08]} />
        <meshStandardMaterial color="#2C2420" roughness={0.7} />
      </mesh>
      {/* Square craftsman posts */}
      {([-1.7, 0, 1.7] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 1.35, 3.8]} castShadow>
          <boxGeometry args={[0.15, 2.6, 0.15]} />
          <meshStandardMaterial color="#F0EBE0" roughness={0.45} />
        </mesh>
      ))}
      {/* Post capitals */}
      {([-1.7, 0, 1.7] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 2.58, 3.8]}>
          <boxGeometry args={[0.25, 0.12, 0.25]} />
          <meshStandardMaterial color="#F0EBE0" roughness={0.45} />
        </mesh>
      ))}
      {/* Porch beam */}
      <mesh position={[0, 2.5, 3.8]}>
        <boxGeometry args={[4.8, 0.14, 0.14]} />
        <meshStandardMaterial color="#3C3028" roughness={0.7} />
      </mesh>
      {/* Porch deck surface */}
      <mesh position={[0, 0.015, 3.75]} receiveShadow>
        <boxGeometry args={[4.8, 0.04, 2.1]} />
        <meshStandardMaterial color="#C8A882" roughness={0.75} />
      </mesh>
      {/* Porch deck planks */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[0, 0.02, 2.8 + i * 0.3]}>
          <boxGeometry args={[4.78, 0.02, 0.26]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#C8A882" : "#BE9E76"} roughness={0.8} />
        </mesh>
      ))}

      {/* ── LARGE FRONT WINDOWS ── */}
      {/* Left picture window frame */}
      <mesh position={[-2.3, 1.62, 2.51]}>
        <boxGeometry args={[2.2, 1.05, 0.07]} />
        <meshStandardMaterial color="#2C2420" roughness={0.5} />
      </mesh>
      {/* Left picture window glass */}
      <mesh position={[-2.3, 1.62, 2.53]}>
        <boxGeometry args={[2.0, 0.87, 0.04]} />
        <meshStandardMaterial color="#A8CCE0" transparent opacity={0.78} metalness={0.25} roughness={0.05} />
      </mesh>
      {/* Left window mullion */}
      <mesh position={[-2.3, 1.62, 2.535]}>
        <boxGeometry args={[0.04, 0.87, 0.02]} />
        <meshStandardMaterial color="#2C2420" roughness={0.5} />
      </mesh>

      {/* Right picture window */}
      <mesh position={[2.3, 1.62, 2.51]}>
        <boxGeometry args={[2.2, 1.05, 0.07]} />
        <meshStandardMaterial color="#2C2420" roughness={0.5} />
      </mesh>
      <mesh position={[2.3, 1.62, 2.53]}>
        <boxGeometry args={[2.0, 0.87, 0.04]} />
        <meshStandardMaterial color="#A8CCE0" transparent opacity={0.78} metalness={0.25} roughness={0.05} />
      </mesh>
      <mesh position={[2.3, 1.62, 2.535]}>
        <boxGeometry args={[0.04, 0.87, 0.02]} />
        <meshStandardMaterial color="#2C2420" roughness={0.5} />
      </mesh>

      {/* ── FRONT DOOR ── */}
      {/* Door frame */}
      <mesh position={[0, 1.03, 2.52]}>
        <boxGeometry args={[1.08, 2.06, 0.07]} />
        <meshStandardMaterial color="#2C2420" roughness={0.5} />
      </mesh>
      {/* Door panel — dark wood */}
      <mesh position={[0, 0.98, 2.535]}>
        <boxGeometry args={[0.86, 1.82, 0.05]} />
        <meshStandardMaterial color="#1A1008" roughness={0.55} />
      </mesh>
      {/* Door glass upper */}
      <mesh position={[0, 1.55, 2.54]}>
        <boxGeometry args={[0.65, 0.6, 0.03]} />
        <meshStandardMaterial color="#A8CCE0" transparent opacity={0.65} />
      </mesh>
      {/* Sidelight left */}
      <mesh position={[-0.63, 1.08, 2.535]}>
        <boxGeometry args={[0.22, 1.42, 0.04]} />
        <meshStandardMaterial color="#A8CCE0" transparent opacity={0.68} />
      </mesh>
      {/* Sidelight right */}
      <mesh position={[0.63, 1.08, 2.535]}>
        <boxGeometry args={[0.22, 1.42, 0.04]} />
        <meshStandardMaterial color="#A8CCE0" transparent opacity={0.68} />
      </mesh>
      {/* Door handle — brass */}
      <mesh position={[0.35, 0.95, 2.545]}>
        <sphereGeometry args={[0.042, 8, 8]} />
        <meshStandardMaterial color="#C8A332" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* ── ENTRY STEPS ── */}
      <mesh position={[0, 0.14, 3.55]} receiveShadow>
        <boxGeometry args={[3.2, 0.28, 0.48]} />
        <meshStandardMaterial color="#9A8B79" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.05, 3.82]} receiveShadow>
        <boxGeometry args={[3.6, 0.1, 0.46]} />
        <meshStandardMaterial color="#9A8B79" roughness={0.92} />
      </mesh>

      {/* ── SIDE WINDOWS ── */}
      <mesh position={[-3.52, 1.5, 0.5]}>
        <boxGeometry args={[0.07, 0.88, 1.6]} />
        <meshStandardMaterial color="#2C2420" roughness={0.5} />
      </mesh>
      <mesh position={[-3.53, 1.5, 0.5]}>
        <boxGeometry args={[0.04, 0.7, 1.42]} />
        <meshStandardMaterial color="#A8CCE0" transparent opacity={0.75} metalness={0.2} />
      </mesh>
      <mesh position={[3.52, 1.5, 0.5]}>
        <boxGeometry args={[0.07, 0.88, 1.6]} />
        <meshStandardMaterial color="#2C2420" roughness={0.5} />
      </mesh>
      <mesh position={[3.53, 1.5, 0.5]}>
        <boxGeometry args={[0.04, 0.7, 1.42]} />
        <meshStandardMaterial color="#A8CCE0" transparent opacity={0.75} metalness={0.2} />
      </mesh>

      {/* ── STONE CHIMNEY ── */}
      <mesh position={[-2.0, 3.95, -0.6]} castShadow>
        <boxGeometry args={[0.52, 2.1, 0.52]} />
        <meshStandardMaterial color="#9A8B79" roughness={0.92} />
      </mesh>
      {/* Cap */}
      <mesh position={[-2.0, 5.05, -0.6]}>
        <boxGeometry args={[0.68, 0.1, 0.68]} />
        <meshStandardMaterial color="#3C3028" roughness={0.8} />
      </mesh>

      {/* ── GARAGE ── */}
      <mesh position={[5.45, 1.3, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 2.6, 4.8]} />
        <meshStandardMaterial color="#EDE6D8" roughness={0.65} metalness={0.02} />
      </mesh>
      {/* Garage roof eave */}
      <mesh position={[5.45, 2.66, -0.5]}>
        <boxGeometry args={[3.95, 0.13, 5.15]} />
        <meshStandardMaterial color="#2C2420" roughness={0.7} />
      </mesh>
      {/* Garage roof slopes */}
      <mesh position={[4.57, 2.88, -0.5]} rotation={[0, 0, 0.22]}>
        <boxGeometry args={[2.1, 0.12, 5.15]} />
        <meshStandardMaterial color="#2C2420" roughness={0.8} />
      </mesh>
      <mesh position={[6.33, 2.88, -0.5]} rotation={[0, 0, -0.22]}>
        <boxGeometry args={[2.1, 0.12, 5.15]} />
        <meshStandardMaterial color="#2C2420" roughness={0.8} />
      </mesh>
      {/* Garage door panel */}
      <mesh position={[5.45, 1.15, 1.9]}>
        <boxGeometry args={[2.85, 2.1, 0.07]} />
        <meshStandardMaterial color="#3A3028" roughness={0.55} />
      </mesh>
      {/* Garage door panel lines */}
      {[0.6, 0.0, -0.6].map((y, i) => (
        <mesh key={i} position={[5.45, 1.15 + y, 1.905]}>
          <boxGeometry args={[2.72, 0.46, 0.03]} />
          <meshStandardMaterial color="#4A3A28" roughness={0.65} />
        </mesh>
      ))}
      {/* Garage window above door */}
      <mesh position={[5.45, 2.28, 1.91]}>
        <boxGeometry args={[1.5, 0.4, 0.04]} />
        <meshStandardMaterial color="#A8CCE0" transparent opacity={0.7} metalness={0.2} />
      </mesh>

    </group>
  );
}
