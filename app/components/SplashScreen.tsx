"use client";

import { useEffect, useState } from "react";
import { useAscentStore } from "./three/store";
import { ASCENT_BUILD } from "../config/features";

// The expedition's title card: a quiet veil over the first load while the
// world compiles behind it. Dismisses when the canvas reports ready (or the
// fallback takes over), with a floor so fast loads still get the beat and a
// hard cap so nothing can strand it. Purely visual — it never blocks input.
const MIN_SHOW_MS = 1100;
const HARD_CAP_MS = 5000;
const FADE_MS = 750;

export const SplashScreen = () => {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const started = performance.now();
    let dismissTimer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (dismissTimer !== null) return;
      const wait = Math.max(0, MIN_SHOW_MS - (performance.now() - started));
      dismissTimer = setTimeout(() => setLeaving(true), wait);
    };

    const state = useAscentStore.getState();
    if (state.ready || state.fallback) schedule();
    const unsubscribe = useAscentStore.subscribe((s) => {
      if (s.ready || s.fallback) schedule();
    });
    const cap = setTimeout(() => setLeaving(true), HARD_CAP_MS);

    return () => {
      unsubscribe();
      clearTimeout(cap);
      if (dismissTimer !== null) clearTimeout(dismissTimer);
    };
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setGone(true), FADE_MS);
    return () => clearTimeout(t);
  }, [leaving]);

  if (gone) return null;

  return (
    <div className="ascent-splash" data-leaving={leaving ? "1" : "0"} aria-hidden="true">
      <svg viewBox="0 0 32 32" className="ascent-splash-mark">
        <path d="M2 26 L11 13 L17 20 L20 17 L30 26 Z" fill="#2b3650" />
        <path d="M7 26 L17 8 L27 26 Z" fill="#3d4a63" />
        <path d="M14.6 12.3 L17 8 L19.4 12.3 L17.8 11.4 L17 12.6 L16 11.5 Z" fill="#dfe6f5" />
        <path
          d="M9.5 25 L20 21.5 L13.5 18.5 L18.5 15.5 L16.2 13.2"
          fill="none"
          stroke="#f2a541"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M17 2.2 L19.4 4.6 L17 7 L14.6 4.6 Z" fill="#f2a541" />
      </svg>
      <p className="instrument text-primary mt-5">R. Prabowo</p>
      <p className="instrument text-secondary mt-1.5">The Ascent — expedition survey</p>
      <div className="ascent-splash-line mt-6">
        <span />
      </div>
      <p className="instrument text-secondary mt-4 opacity-60">{ASCENT_BUILD}</p>
      {/* Without JS nothing can dismiss the veil: never show it. */}
      <noscript>
        <style>{`.ascent-splash{display:none}`}</style>
      </noscript>
    </div>
  );
};
