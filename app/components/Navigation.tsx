"use client";

import { motion } from "framer-motion";
import { useAscentStore } from "./three/store";
import { SECTION_IDS } from "./three/camps";

// One entry per camp on the mountain; indices double as the compact
// mobile labels.
const NAV_ITEMS = [
  { index: "00", label: "Base", href: "#home" },
  { index: "01", label: "Gear", href: "#skills" },
  { index: "02", label: "Route", href: "#experience" },
  { index: "03", label: "Sites", href: "#portfolio" },
  { index: "04", label: "Summit", href: "#resume" },
];

// Fast travel targets for anchored mode, in camp-index space. A section's
// TOP is dead scroll for the long camps: #portfolio's top sits at campT
// ≈2.6 while site 01's record only appears at 2.7 — landing there showed
// bare mountain until the visitor scrolled on. Land on each camp's actual
// subject instead: the sequenced camps at the start of their sequence
// (route-log intro pane; site 01 focused), the others on their dock pose.
const CAMP_TARGETS: Record<string, number> = {
  "#home": 0,
  "#skills": 1,
  "#experience": 1.66,
  "#portfolio": 2.74,
  "#resume": 4,
};

// Scroll position of a fractional camp index — the inverse of the scroll
// bridge's campTFromScroll, over the same section-center anchors.
const scrollYForCampT = (t: number): number | null => {
  const viewportHeight = window.innerHeight;
  const anchors: number[] = [];
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    anchors.push(Math.max(top + rect.height / 2 - viewportHeight / 2, 0));
  }
  for (let i = 1; i < anchors.length; i++) {
    anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
  }
  const i = Math.min(Math.max(Math.floor(t), 0), anchors.length - 2);
  return anchors[i] + (t - i) * (anchors[i + 1] - anchors[i]);
};

const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  e.preventDefault();
  if (useAscentStore.getState().anchored) {
    const target = CAMP_TARGETS[href];
    const y = target !== undefined ? scrollYForCampT(target) : null;
    if (y !== null) {
      // Instant jump ("auto" defers to the page's smooth scroll-behavior):
      // the damped camera then flies the direct line to the new camp. A
      // smooth page scroll here replays every camp in between — clicking
      // Sites from the summit cycled focus through all ten records before
      // settling.
      window.scrollTo({ top: Math.round(y), behavior: "instant" });
      return;
    }
  }
  if (href === "#home" || href === "#") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const element = document.querySelector(href);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export const Navigation = () => {
  // The camera rig's camp index doubles as the active-section indicator.
  const activeCamp = useAscentStore((s) =>
    Math.min(Math.max(Math.round(s.campT), 0), NAV_ITEMS.length - 1)
  );

  return (
    // No bar chrome: a soft scrim fading into the sky keeps the strip
    // readable while the world runs seamlessly behind it.
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-gradient-to-b from-background/80 via-background/30 to-transparent pb-3">
      <nav
        aria-label="Main navigation"
        className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-8 h-14"
      >
        <motion.a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          aria-label="Navigate to home"
          className="instrument text-primary font-semibold flex items-center gap-2 cursor-pointer"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="waypoint-dot" aria-hidden="true" />
          R.Prabowo
        </motion.a>

        <div className="flex items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === activeCamp;
            return (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                aria-label={`Navigate to ${item.label}`}
                aria-current={isActive ? "true" : undefined}
                className={`instrument px-2 sm:px-3 py-2 cursor-pointer transition-colors duration-300 border-b-2 ${
                  isActive
                    ? "text-primary border-accent"
                    : "text-secondary border-transparent hover:text-primary"
                }`}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * (index + 1), duration: 0.5 }}
              >
                <span className="text-accent">{item.index}</span>
                <span className="hidden sm:inline">&nbsp;{item.label}</span>
              </motion.a>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
