"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { anchorElements, getAnchors, isAnchorActive } from "./anchors";
import { useAscentStore } from "./store";

// Pins each registered annotation element to its world anchor's screen
// position, every frame, without touching React state.
export const AnchorProjector = () => {
  const anchors = useMemo(() => getAnchors(), []);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, size }) => {
    const anchored = document.documentElement.hasAttribute("data-anchored");
    const state = useAscentStore.getState();

    for (const def of anchors) {
      const el = anchorElements.get(def.id);
      if (!el) continue;

      if (!anchored) {
        // In-flow mode: make sure no stale projection transform lingers.
        if (el.style.transform) el.style.transform = "";
        continue;
      }

      // The summit register is exempt from framing and side latching: the
      // camera stands almost on top of it, so it can never be "framed" —
      // the position clamp carries it, and its side stays static.
      const needsFraming = def.id !== "summit-register";

      v.set(def.position[0], def.position[1], def.position[2]).project(camera);
      const behindCamera = v.z > 1;
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      // Keep the callout on the sheet even when its anchor drifts to an
      // edge. The card is vertically CENTERED on its anchor (translate
      // -50%), so a fixed margin guess cut off tall cards (the register)
      // on short windows — the bottom half simply spilled past the
      // viewport with no scroll to reach it. Clamp using the card's own
      // measured height instead, so it always fits top AND bottom.
      const cx = Math.min(Math.max(x, 28), size.width - 28);
      const halfH = el.getBoundingClientRect().height / 2;
      const marginTop = 130;
      const marginBottom = needsFraming ? 150 : 40;
      const lower = marginTop + halfH;
      const upper = size.height - marginBottom - halfH;
      const cy =
        lower <= upper
          ? Math.min(Math.max(y, lower), upper)
          : (marginTop + (size.height - marginBottom)) / 2;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;

      // The card opens rightward unless the anchor is clearly on the right
      // side (keeps left-opening cards off the site legend). The side is
      // only chosen while the callout is hidden: flipping a visible card
      // teleports it sideways by its own width. The register keeps its
      // static side — it shows during camera travel, when a latch would
      // catch a transient position.
      if (needsFraming && el.dataset.visible !== "1") {
        const frac = x / size.width;
        if (el.dataset.side === "left" && frac < 0.55) el.dataset.side = "right";
        else if (el.dataset.side === "right" && frac > 0.64) el.dataset.side = "left";
      }

      // Show the callout only once the camera has actually framed its
      // anchor — the text appears where you're already looking, instead of
      // fading in early and sliding across the screen as the camera settles.
      // Horizontal is the strict axis (that's where the camera swings);
      // vertically the position clamp already keeps the card readable.
      const framed = !needsFraming || (Math.abs(v.x) < 0.82 && v.y > -1.25 && v.y < 1.05);
      const visible = !behindCamera && framed && isAnchorActive(def, state);
      const flag = visible ? "1" : "0";
      if (el.dataset.visible !== flag) el.dataset.visible = flag;
    }
  });

  return null;
};
