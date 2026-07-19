"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SCROLL_CONFIG } from "../config/animations";
import { CAMPS, SUMMIT_ELEVATION } from "../components/three/camps";
import { experiences, portfolioItems } from "../data/portfolio";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

// The route drawn as data: camp elevations as an elevation profile.
const PROFILE_W = 264;
const PROFILE_H = 84;

const profilePoints = CAMPS.map((camp, i) => {
  const x = 8 + (i * (PROFILE_W - 16)) / (CAMPS.length - 1);
  const y = PROFILE_H - 12 - (camp.elevation / SUMMIT_ELEVATION) * (PROFILE_H - 26);
  return { x, y, camp };
});

const RouteProfile = () => (
  <svg
    viewBox={`0 0 ${PROFILE_W} ${PROFILE_H}`}
    className="w-full"
    role="img"
    aria-label="Elevation profile of the route from trailhead to summit"
  >
    {/* Baseline */}
    <line
      x1="2"
      y1={PROFILE_H - 10}
      x2={PROFILE_W - 2}
      y2={PROFILE_H - 10}
      stroke="var(--line)"
      strokeWidth="1"
    />
    {/* The climb */}
    <polyline
      points={profilePoints.map((p) => `${p.x},${p.y}`).join(" ")}
      fill="none"
      stroke="var(--line-strong)"
      strokeWidth="1.4"
    />
    {profilePoints.map((p, i) => (
      <g key={p.camp.sectionId}>
        <line x1={p.x} y1={p.y} x2={p.x} y2={PROFILE_H - 10} stroke="var(--line)" strokeWidth="1" strokeDasharray="1.5 3" />
        <circle cx={p.x} cy={p.y} r={i === CAMPS.length - 1 ? 3.4 : 2.4} fill={i === CAMPS.length - 1 ? "var(--accent)" : "var(--line-strong)"} />
        <text
          x={p.x}
          y={PROFILE_H - 1}
          textAnchor="middle"
          fill="currentColor"
          className="font-mono"
          fontSize="6.5"
          opacity="0.65"
        >
          {`0${i}`}
        </text>
      </g>
    ))}
  </svg>
);

export const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(heroScrollProgress, [0, SCROLL_CONFIG.HERO_FADE_THRESHOLD], [1, 0]);
  const heroY = useTransform(heroScrollProgress, [0, SCROLL_CONFIG.HERO_FADE_THRESHOLD], [0, SCROLL_CONFIG.HERO_Y_OFFSET]);

  const climb = SUMMIT_ELEVATION - CAMPS[0].elevation;

  const manifest = [
    { label: "Role", value: "Data / product" },
    { label: "Base", value: "1.35°N 103.82°E" },
    { label: "Route legs", value: experiences.length.toString().padStart(2, "0") },
    { label: "Sites surveyed", value: portfolioItems.length.toString().padStart(2, "0") },
    { label: "Summit", value: `${SUMMIT_ELEVATION.toLocaleString("en-US")} m` },
  ];

  return (
    <motion.main
      id="home"
      ref={heroRef}
      style={{ opacity: heroOpacity, y: heroY }}
      className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center pt-10 pb-16"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Expedition plate */}
        <motion.div
          className="instrument text-secondary flex flex-wrap items-center gap-x-3 gap-y-2 mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <span className="text-accent">Expedition log</span>
          <span aria-hidden="true">—</span>
          <span>Data / product</span>
          <span aria-hidden="true" className="hidden sm:inline">—</span>
          <span className="hidden sm:inline">Est. 2022</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-end">
          {/* Name + field note */}
          <div>
            <motion.h1
              className="text-[17vw] lg:text-9xl xl:text-[10.5rem] font-thin text-primary leading-[0.92] tracking-tight"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
            >
              Richard
            </motion.h1>
            <motion.h1
              className="text-[17vw] lg:text-9xl xl:text-[10.5rem] font-thin text-primary leading-[0.92] tracking-tight"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease }}
            >
              Prabowo
            </motion.h1>

            <motion.div
              className="mt-8 sm:mt-10 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease }}
            >
              <p className="instrument text-accent mb-3">Field note</p>
              <p className="text-secondary text-base sm:text-lg leading-relaxed">
                Building with purpose. Uncovering the &lsquo;why.&rsquo; I&apos;m a creator driven
                by curiosity, always seeking the next opportunity to learn and build
                things that truly matter.
              </p>
            </motion.div>
          </div>

          {/* Route overview: the expedition condensed to its data */}
          <motion.aside
            className="w-full max-w-xs justify-self-start lg:justify-self-end text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease }}
            aria-label="Route overview"
          >
            <div className="reg-ticks p-4">
              <p className="instrument text-secondary flex items-center justify-between mb-4">
                <span className="text-accent">Route overview</span>
                <span>Fig. 01</span>
              </p>
              <RouteProfile />
              <dl className="mt-4">
                {manifest.map((row) => (
                  <div key={row.label} className="flex items-baseline gap-3 py-1.5 border-b border-line last:border-b-0">
                    <dt className="instrument text-secondary">{row.label}</dt>
                    <span className="leader" aria-hidden="true" />
                    <dd className="font-mono text-sm text-primary">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </motion.aside>
        </div>

        {/* Ascent cue */}
        <motion.div
          className="instrument text-secondary flex items-center gap-4 mt-14 sm:mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          aria-hidden="true"
        >
          <span className="motion-safe:animate-bounce text-accent">↓</span>
          <span>Begin ascent</span>
          <span className="h-px flex-1 bg-line" />
          <span>
            {climb.toLocaleString("en-US")} m to summit
          </span>
        </motion.div>
      </div>
    </motion.main>
  );
};
