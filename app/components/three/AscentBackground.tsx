"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { ContourFallback } from "../ContourFallback";
import { AltitudeHUD } from "../AltitudeHUD";
import { SoundToggle } from "../SoundToggle";
import { SplashScreen } from "../SplashScreen";
import { ASCENT_ENABLED } from "../../config/features";
import { SECTION_IDS } from "./camps";
import { useAscentStore } from "./store";
import { ascentFrame } from "./frame";

// Dev-only handle for headless verification scripts (road/frame probing).
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as unknown as { __ascentDebug?: object }).__ascentDebug = {
    frame: ascentFrame,
    store: useAscentStore,
  };
}

// Keeps three.js out of the initial chunk; the scene loads after hydration.
const AscentCanvas = dynamic(() => import("./AscentCanvas"), { ssr: false });

function campTFromScroll(y: number, anchors: number[]): number {
  if (anchors.length < 2 || y <= anchors[0]) return 0;
  for (let i = 0; i < anchors.length - 1; i++) {
    if (y < anchors[i + 1]) {
      return i + (y - anchors[i]) / (anchors[i + 1] - anchors[i]);
    }
  }
  return anchors.length - 1;
}

// Pixel position of a fractional camp index, inverting campTFromScroll.
function scrollOfCampT(t: number, anchors: number[]): number {
  const i = Math.min(Math.max(Math.floor(t), 0), anchors.length - 2);
  return anchors[i] + (t - i) * (anchors[i + 1] - anchors[i]);
}

function AscentExperience() {
  const [mount3D, setMount3D] = useState(false);
  // Client-only capability checks; lazy initializers keep them out of effects.
  const [webglOk] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    return !!document.createElement("canvas").getContext("webgl2");
  });
  const [quality] = useState<"low" | "high" | "soft">(() => {
    if (typeof window === "undefined") return "high";
    // Software WebGL (no hardware acceleration) still renders the world —
    // stripped of the costly layers so it stays usable.
    try {
      const gl = document.createElement("canvas").getContext("webgl2");
      const dbg = gl?.getExtension("WEBGL_debug_renderer_info");
      const renderer = dbg
        ? String(gl?.getParameter(dbg.UNMASKED_RENDERER_WEBGL) ?? "")
        : "";
      if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return "soft";
    } catch {
      // Renderer info unavailable: assume hardware.
    }
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return coarse || (memory !== undefined && memory <= 4) ? "low" : "high";
  });
  const ready = useAscentStore((s) => s.ready);
  const fallback = useAscentStore((s) => s.fallback);
  // Small screens keep the full 3D world (per Richard — the mountain ships
  // everywhere); anchored callouts still need ≥1024px, so the in-flow
  // layout runs over the live canvas with a dimmer + card scrims for
  // legibility (see .card-scrim under html[data-ascent-live]).
  const anchored = useAscentStore((s) => s.anchored);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Software WebGL rides the reduced-motion rails: demand frameloop,
    // snap easing, render only when the nearest camp or focus changes.
    // A continuously animated frameloop on SwiftShader-class rasterizers
    // is a permanent 10–15 fps churn; five crisp postcards that respond
    // instantly read far better than a slideshow pretending to be film.
    const apply = () =>
      useAscentStore.setState({ reducedMotion: mq.matches || quality === "soft" });
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [quality]);

  // Idle-deferred mount of the 3D chunk to keep LCP untouched.
  useEffect(() => {
    if (webglOk !== true) {
      if (webglOk === false) useAscentStore.setState({ fallback: true });
      return;
    }
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (w.requestIdleCallback) {
      idleId = w.requestIdleCallback(() => setMount3D(true));
    } else {
      timeoutId = setTimeout(() => setMount3D(true), 200);
    }
    return () => {
      if (idleId !== undefined && w.cancelIdleCallback) w.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [webglOk]);

  // Scroll bridge: section centers become camp anchors; page scroll maps to
  // a continuous camp index, re-measured whenever the layout changes. Leg
  // and site sequencing both derive from campT itself.
  const anchorsRef = useRef<number[]>([]);
  const { scrollY } = useScroll();

  const publishScroll = useCallback((y: number) => {
    const anchors = anchorsRef.current;
    if (anchors.length !== SECTION_IDS.length) return;
    const campT = campTFromScroll(y, anchors);
    // Sites advance by SCROLL PIXELS, not campT: the camp gaps have very
    // different pixel sizes, and equal-campT steps made site 01 → 02 cost
    // ~1.5× the scroll of the later transitions.
    const sitesFrom = scrollOfCampT(2.7, anchors);
    const sitesTo = scrollOfCampT(3.36, anchors);
    useAscentStore.setState({
      campT,
      // The walk sequences off the camera's own camp position, so its
      // first entry plays out after actual arrival: the dock opens at 1.6
      // with the route-log intro, the walker sets off at 1.84 (as the
      // intro hands over to Leg 01) and finishes at 2.4 (dock closes 2.5).
      legProgress: Math.min(Math.max((campT - 1.84) / 0.56, 0), 1),
      // Sites run from first-orbit arrival (campT ≈ 2.76) to 3.36, done
      // before the register takes over at 3.5 — in even pixel steps.
      siteProgress: Math.min(Math.max((y - sitesFrom) / (sitesTo - sitesFrom || 1), 0), 1),
    });
  }, []);

  useEffect(() => {
    const measure = () => {
      const viewportHeight = window.innerHeight;
      const anchors: number[] = [];
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        anchors.push(Math.max(top + rect.height / 2 - viewportHeight / 2, 0));
      }
      for (let i = 1; i < anchors.length; i++) {
        anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
      }
      anchorsRef.current = anchors;
      publishScroll(window.scrollY);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [publishScroll]);

  useMotionValueEvent(scrollY, "change", publishScroll);

  // Anchored mode: annotations pin to the world only when the 3D scene is
  // live and there's room for callouts.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      const on = ready && !fallback && mq.matches;
      if (on) {
        document.documentElement.setAttribute("data-anchored", "1");
      } else {
        document.documentElement.removeAttribute("data-anchored");
      }
      useAscentStore.setState({ anchored: on });
    };
    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      document.documentElement.removeAttribute("data-anchored");
      useAscentStore.setState({ anchored: false });
    };
  }, [ready, fallback]);

  const showCanvas = mount3D && webglOk === true && !fallback;
  const active = ready && !fallback;

  // Scrim hook for in-flow content: cards darken only while the live world
  // runs behind them (html[data-ascent-live] in globals.css).
  useEffect(() => {
    if (active) {
      document.documentElement.setAttribute("data-ascent-live", "1");
    } else {
      document.documentElement.removeAttribute("data-ascent-live");
    }
    return () => document.documentElement.removeAttribute("data-ascent-live");
  }, [active]);

  return (
    <>
      <div
        className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-700 ${
          active ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        {showCanvas && <AscentCanvas quality={quality} />}
        {/* In-flow mode (small screens) reads ON the world, not beside it:
            a quiet veil keeps the journey visible while the type stays
            legible over mist and snow. */}
        {active && !anchored && (
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/25 to-background/55" />
        )}
      </div>
      {/* Rings-only while the canvas warms up (the splash covers the wait);
          the mountain still joins only when there is truly no WebGL. */}
      {!active && <ContourFallback still={fallback} />}
      {active && <AltitudeHUD />}
      <SoundToggle />
      <SplashScreen />
    </>
  );
}

export const AscentBackground = () =>
  ASCENT_ENABLED ? <AscentExperience /> : <ContourFallback still />;
