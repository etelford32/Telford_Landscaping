/**
 * Labeled cross-section of a French drain beside a foundation: positive grade
 * away from the wall, a fabric-wrapped stone trench, and a perforated pipe at
 * the bottom carrying water to the outlet. The numbered markers line up with
 * the legend rendered next to it on /drainage-trenching (see DRAIN_LAYERS).
 *
 * Pure SVG, no client JS; it scales to its container width.
 */

export const DRAIN_LAYERS = [
  {
    n: 1,
    title: "Positive grade",
    body: "Soil re-shaped to fall away from the foundation — code asks for 6 in. of drop in the first 10 ft.",
  },
  {
    n: 2,
    title: "Finished cap",
    body: "River rock or re-laid sod over the trench, so the drain disappears into the landscape.",
  },
  {
    n: 3,
    title: "Filter fabric",
    body: "Non-woven geotextile wraps the stone so fine silt can't migrate in and clog it.",
  },
  {
    n: 4,
    title: "Washed drain rock",
    body: "Clean ¾-in. stone. The voids between rocks are where the water actually travels.",
  },
  {
    n: 5,
    title: "Perforated pipe",
    body: "Holes down, laid at a steady fall of at least ⅛ in. per foot to a daylight outlet or dry well.",
  },
  {
    n: 6,
    title: "Shaped trench floor",
    body: "Undisturbed subgrade cut to a true slope, so the pipe never sags and holds standing water.",
  },
] as const;

function Marker({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={13} fill="#14532d" stroke="#fff" strokeWidth={2.5} />
      <text
        x={x}
        y={y + 4.5}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="#fff"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {n}
      </text>
    </g>
  );
}

export default function FrenchDrainDiagram({ className }: { className?: string }) {
  // Ground surface: falls from the foundation (x=110) to the right edge.
  const surfaceY = (x: number) => 150 + (x - 110) * 0.075;
  const tL = 430; // trench left wall
  const tR = 520; // trench right wall
  const tBottom = 372;
  const capDepth = 26;

  return (
    <svg
      viewBox="0 0 800 420"
      role="img"
      aria-labelledby="fd-title fd-desc"
      className={className}
    >
      <title id="fd-title">Cross-section of a French drain</title>
      <desc id="fd-desc">
        Ground graded away from a house foundation toward a trench lined with filter fabric, filled with
        washed drain rock, and holding a perforated pipe at the bottom. Arrows show surface runoff and
        groundwater flowing into the trench.
      </desc>

      <defs>
        <pattern id="fd-soil" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" fill="#c9ad7f" />
          <circle cx="4" cy="6" r="1.4" fill="#a98a5c" />
          <circle cx="15" cy="3" r="1" fill="#b39468" />
          <circle cx="11" cy="15" r="1.6" fill="#a98a5c" />
          <circle cx="19" cy="18" r="1" fill="#b39468" />
        </pattern>
        <pattern id="fd-rock" width="26" height="22" patternUnits="userSpaceOnUse">
          <rect width="26" height="22" fill="#b8bcc2" />
          <ellipse cx="6" cy="6" rx="5.5" ry="4.5" fill="#d6d9dd" stroke="#8b9097" strokeWidth="1" />
          <ellipse cx="19" cy="5" rx="5" ry="4" fill="#cdd1d6" stroke="#8b9097" strokeWidth="1" />
          <ellipse cx="13" cy="15" rx="5.5" ry="4.5" fill="#dde0e3" stroke="#8b9097" strokeWidth="1" />
          <ellipse cx="2" cy="17" rx="3.5" ry="3.5" fill="#cdd1d6" stroke="#8b9097" strokeWidth="1" />
          <ellipse cx="24" cy="17" rx="3.5" ry="3.5" fill="#d6d9dd" stroke="#8b9097" strokeWidth="1" />
        </pattern>
        <pattern id="fd-cap" width="18" height="14" patternUnits="userSpaceOnUse">
          <rect width="18" height="14" fill="#8a7a66" />
          <ellipse cx="5" cy="5" rx="4.5" ry="3.5" fill="#a69580" />
          <ellipse cx="14" cy="9" rx="4" ry="3.5" fill="#9b8a74" />
        </pattern>
        <linearGradient id="fd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#f8fafc" />
        </linearGradient>
        <marker id="fd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#0284c7" />
        </marker>
      </defs>

      {/* Sky */}
      <rect width="800" height="420" fill="url(#fd-sky)" />

      {/* Rain */}
      <g stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.7">
        {[170, 230, 290, 350, 610, 670, 730].map((x, i) => (
          <line key={x} x1={x} y1={34 + (i % 2) * 18} x2={x - 6} y2={52 + (i % 2) * 18} />
        ))}
      </g>

      {/* Soil body */}
      <path
        d={`M110 ${surfaceY(110)} L800 ${surfaceY(800)} L800 420 L0 420 L0 400 L110 400 Z`}
        fill="url(#fd-soil)"
      />

      {/* Grass strip along the surface (skipping the trench) */}
      <path
        d={`M110 ${surfaceY(110)} L${tL} ${surfaceY(tL)}`}
        stroke="#4d7c0f"
        strokeWidth="9"
        strokeLinecap="butt"
      />
      <path
        d={`M${tR} ${surfaceY(tR)} L800 ${surfaceY(800)}`}
        stroke="#4d7c0f"
        strokeWidth="9"
        strokeLinecap="butt"
      />

      {/* House wall + footing */}
      <rect x="40" y="60" width="70" height="340" fill="#e7e2d8" stroke="#a8a29e" strokeWidth="2" />
      <rect x="22" y="372" width="106" height="28" fill="#d6d3d1" stroke="#a8a29e" strokeWidth="2" />
      <path d="M30 60 L120 60 L120 50 L30 50 Z" fill="#78716c" />
      <text x="75" y="120" textAnchor="middle" fontSize="12" fontWeight={700} fill="#57534e" fontFamily="ui-sans-serif, system-ui, sans-serif" letterSpacing="1.5">
        HOME
      </text>

      {/* Trench: rock fill, fabric wrap, cap */}
      <path
        d={`M${tL} ${surfaceY(tL) + capDepth} L${tR} ${surfaceY(tR) + capDepth} L${tR} ${tBottom} L${tL} ${tBottom} Z`}
        fill="url(#fd-rock)"
      />
      <path
        d={`M${tL} ${surfaceY(tL)} L${tR} ${surfaceY(tR)} L${tR} ${surfaceY(tR) + capDepth} L${tL} ${surfaceY(tL) + capDepth} Z`}
        fill="url(#fd-cap)"
      />
      {/* Geotextile: U-wrap with overlap folded across the top of the stone */}
      <path
        d={`M${tL + 4} ${surfaceY(tL) + capDepth} L${tL + 4} ${tBottom - 4} L${tR - 4} ${tBottom - 4} L${tR - 4} ${surfaceY(tR) + capDepth} L${tL + 30} ${surfaceY(tL + 30) + capDepth + 1}`}
        fill="none"
        stroke="#f8fafc"
        strokeWidth="3"
        strokeDasharray="7 4"
      />

      {/* Perforated pipe */}
      <circle cx={(tL + tR) / 2} cy={tBottom - 28} r="19" fill="#1f2937" stroke="#0f172a" strokeWidth="2" />
      <circle cx={(tL + tR) / 2} cy={tBottom - 28} r="14" fill="#374151" />
      {[-0.65, 0, 0.65].map((a) => {
        const cx = (tL + tR) / 2 + Math.sin(a) * 16.5;
        const cy = tBottom - 28 + Math.cos(a) * 16.5;
        return <circle key={a} cx={cx} cy={cy} r="2.4" fill="#f8fafc" />;
      })}

      {/* Surface runoff following the grade */}
      <path
        d={`M150 ${surfaceY(150) - 16} L${tL - 18} ${surfaceY(tL - 18) - 16}`}
        stroke="#0284c7"
        strokeWidth="3"
        fill="none"
        markerEnd="url(#fd-arrow)"
      />
      <text
        x="270"
        y={surfaceY(270) - 28}
        textAnchor="middle"
        fontSize="13"
        fontWeight={600}
        fill="#0369a1"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        transform={`rotate(4.3 270 ${surfaceY(270) - 28})`}
      >
        surface runoff
      </text>

      {/* Groundwater seeping toward the trench */}
      <g stroke="#0284c7" strokeWidth="2.5" fill="none" strokeDasharray="6 5" markerEnd="url(#fd-arrow)">
        <path d={`M160 250 C 260 255, 340 275, ${tL - 10} 300`} />
        <path d={`M200 330 C 290 330, 360 335, ${tL - 10} 345`} />
        <path d={`M760 300 C 680 300, 600 315, ${tR + 10} 330`} />
      </g>
      <text x="270" y="244" textAnchor="middle" fontSize="13" fontWeight={600} fill="#0369a1" fontFamily="ui-sans-serif, system-ui, sans-serif">
        groundwater
      </text>

      {/* Outlet note */}
      <g fontFamily="ui-sans-serif, system-ui, sans-serif">
        <line x1={tR + 4} y1={tBottom - 28} x2="600" y2={tBottom - 28} stroke="#1f2937" strokeWidth="1.5" />
        <text x="606" y={tBottom - 32} fontSize="12.5" fontWeight={700} fill="#1f2937">
          to daylight outlet
        </text>
        <text x="606" y={tBottom - 16} fontSize="12.5" fill="#44403c">
          or dry well, ≥ 1% fall
        </text>
      </g>

      {/* Numbered markers — keep in sync with DRAIN_LAYERS */}
      <Marker x={210} y={surfaceY(210) - 50} n={1} />
      <Marker x={(tL + tR) / 2} y={surfaceY((tL + tR) / 2) - 26} n={2} />
      <Marker x={tL - 22} y={250} n={3} />
      <Marker x={(tL + tR) / 2} y={262} n={4} />
      <Marker x={tR + 26} y={tBottom - 60} n={5} />
      <Marker x={(tL + tR) / 2} y={tBottom + 22} n={6} />
    </svg>
  );
}
