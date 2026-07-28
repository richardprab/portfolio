"use client";

// Static fallback background for the brief moment before the canvas produces
// its first frame, and for the rare environment with no WebGL at all (or the
// NEXT_PUBLIC_ASCENT=0 kill switch): a quiet corner of the same survey map,
// drawn once in SVG. No animation, no JS work. The live 3D mountain runs
// everywhere WebGL is available — including mobile and software renderers.
export const ContourFallback = () => (
  <div
    className="fixed inset-0 z-0 overflow-hidden pointer-events-none text-primary"
    aria-hidden="true"
  >
    <svg
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Summit rings, offset toward the top right like a map detail. */}
      <g stroke="currentColor" strokeOpacity="0.10" transform="translate(1020 260)">
        {[36, 74, 118, 168, 226, 292, 368, 456, 558].map((r, i) => (
          <ellipse
            key={r}
            rx={r}
            ry={r * 0.72}
            transform={`rotate(${-14 + i * 3})`}
            strokeWidth={i % 3 === 0 ? 1.4 : 0.8}
          />
        ))}
      </g>
      {/* A second, lower knoll. */}
      <g stroke="currentColor" strokeOpacity="0.07" transform="translate(220 780)">
        {[40, 92, 154, 228, 316].map((r, i) => (
          <ellipse
            key={r}
            rx={r}
            ry={r * 0.6}
            transform={`rotate(${8 - i * 4})`}
            strokeWidth={i % 2 === 0 ? 1.2 : 0.8}
          />
        ))}
      </g>
    </svg>
  </div>
);
