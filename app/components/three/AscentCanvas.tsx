"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise, SMAA, Vignette } from "@react-three/postprocessing";
import { TrailCamera } from "./TrailCamera";
import { Atmosphere } from "./Atmosphere";
import { Mountain } from "./Mountain";
import { Waypoints } from "./Waypoints";
import { Scenery } from "./Scenery";
import { AnchorProjector } from "./AnchorProjector";
import { getCampPosition } from "./camps";
import { activeLegIndex, focusedSiteId } from "./anchors";
import { useAscentStore } from "./store";

// Dev-only: expose the live scene for headless verification probes.
function DevProbe() {
  const three = useThree();
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    (window as unknown as { __ascentScene?: object }).__ascentScene = three;
  }, [three]);
  return null;
}

// With reduced motion the frameloop is demand-driven: render a frame only
// when the nearest camp, theme, or project focus actually changes.
function InvalidateBridge() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(
    () =>
      useAscentStore.subscribe((state, prev) => {
        if (!state.reducedMotion) return;
        if (
          Math.round(state.campT) !== Math.round(prev.campT) ||
          state.palette !== prev.palette ||
          state.hoverProjectId !== prev.hoverProjectId ||
          state.modalProjectId !== prev.modalProjectId ||
          activeLegIndex(state.legProgress) !== activeLegIndex(prev.legProgress) ||
          focusedSiteId(state) !== focusedSiteId(prev)
        ) {
          invalidate();
        }
      }),
    [invalidate]
  );
  return null;
}

interface AscentCanvasProps {
  quality: "low" | "high" | "soft";
  // Fired when the GL context is lost; the parent remounts a fresh canvas.
  onContextLost: () => void;
}

export default function AscentCanvas({ quality, onContextLost }: AscentCanvasProps) {
  const reducedMotion = useAscentStore((s) => s.reducedMotion);
  const initialPosition = useMemo(() => getCampPosition(0), []);

  return (
    <Canvas
      camera={{ fov: 42, near: 0.5, far: 900, position: initialPosition }}
      dpr={quality === "high" ? [1, 1.75] : quality === "low" ? [1, 1.5] : [0.75, 1]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      frameloop={reducedMotion ? "demand" : "always"}
      onCreated={({ gl, invalidate }) => {
        // Mobile GPUs and software renderers drop the WebGL context when a
        // tab backgrounds or memory runs short. preventDefault stops the
        // browser's default teardown; the parent then remounts a fresh
        // canvas so the LIVE scene returns (in-place restore makes three
        // read a still-null context and throw).
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onContextLost();
        });
        useAscentStore.setState({ ready: true });
        invalidate();
      }}
    >
      <TrailCamera />
      <Atmosphere quality={quality} />
      <Mountain quality={quality} />
      <Scenery quality={quality} />
      <Waypoints quality={quality} />
      <AnchorProjector />
      <InvalidateBridge />
      <DevProbe />
      {/* The difference between "tech demo" and "art direction": glow on the
          lamps, film grain against banding, soft edges, a focused frame.
          On software WebGL the whole post stack is skipped — bloom's mip
          chain is what makes unaccelerated machines crawl. */}
      {quality !== "soft" && (
        <EffectComposer multisampling={0}>
          {quality === "high" ? <SMAA /> : <></>}
          <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.8} luminanceSmoothing={0.25} radius={0.75} />
          <Noise premultiply opacity={0.07} />
          <Vignette eskil={false} offset={0.26} darkness={0.52} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
