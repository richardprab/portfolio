"use client";

// Static fallback background. While the canvas is still warming up this is
// contour rings only; when there is genuinely no WebGL (or the context died,
// or the kill switch is on) it also carries a pre-rendered still of the
// trailhead postcard — the mountain ships everywhere, even without a GPU.
export const ContourFallback = ({ still = false }: { still?: boolean }) => (
  <div
    className="fixed inset-0 z-0 overflow-hidden pointer-events-none text-primary"
    aria-hidden="true"
  >
    {still && (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed
            full-viewport backdrop; next/image adds nothing here */}
        <img
          src="/ascent-still.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* The same veil the live in-flow mode wears, so type stays legible
            over the snowcap. */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/25 to-background/55" />
      </>
    )}
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
