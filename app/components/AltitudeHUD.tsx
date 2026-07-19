"use client";

import { useAscentStore } from "./three/store";
import { SUMMIT_ELEVATION } from "./three/camps";

// Decorative readout of the expedition's progress; the camera rig writes the
// values as the visitor climbs.
export const AltitudeHUD = () => {
  const elevation = useAscentStore((s) => s.hudElevation);
  const camp = useAscentStore((s) => s.hudCamp);

  if (!camp) return null;

  return (
    <div
      className="fixed top-[4.25rem] right-4 sm:right-8 z-30 pointer-events-none select-none hidden sm:block instrument text-secondary opacity-80 text-right"
      aria-hidden="true"
    >
      <span>{camp}</span>
      <span className="mx-2">/</span>
      <span>
        {elevation.toLocaleString("en-US")} m of {SUMMIT_ELEVATION.toLocaleString("en-US")} m
      </span>
    </div>
  );
};
