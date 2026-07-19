"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { CAMPS, getCampPosition, getProjectMarkers } from "./camps";
import { focusedSiteId, getAnchors, inCampWindow, siteIdByProgress } from "./anchors";
import { TRAIL_TURN_POSITIONS, upperTrailPoints, walkerPosition } from "./trail";
import { terrainHeight } from "./terrainField";
import { useAscentStore } from "./store";
import { ascentFrame } from "./frame";
import { ASCENT_CONFIG } from "../../config/animations";

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth01 = (v: number) => {
  const t = clamp(v, 0, 1);
  return t * t * (3 - 2 * t);
};

// Hold-and-travel: while a section is on screen the fractional camp progress
// sits inside the hold zone and the camera keeps its camp pose; the travel
// happens in the scroll gap between sections, eased with a smootherstep.
// Leg 00→01 departs early: paired with the front-loaded swing below, the
// notice board must be out from behind the south ridge by the time the
// gear-manifest header scrolls in — with the full entry hold it surfaced
// a beat too late.
function shapeCampT(t: number): number {
  const hold = ASCENT_CONFIG.HOLD_ZONE;
  const i = Math.floor(t);
  const f = t - i;
  const holdIn = i === 0 ? 0.12 : hold;
  const e = clamp((f - holdIn) / (1 - holdIn - hold), 0, 1);
  const s = e * e * e * (e * (e * 6 - 15) + 10);
  return i + s;
}

export const TrailCamera = () => {
  const posTarget = useMemo(() => new THREE.Vector3(...getCampPosition(0)), []);
  const lookTarget = useMemo(() => new THREE.Vector3(...CAMPS[0].target), []);
  const lookCurrent = useMemo(() => new THREE.Vector3(...CAMPS[0].target), []);
  const markerLook = useMemo(() => new THREE.Vector3(), []);
  const hudRef = useRef({ elevation: -1, camp: "" });

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const { campT, reducedMotion, hoverProjectId, modalProjectId, legProgress, siteProgress } =
      useAscentStore.getState();
    const maxT = CAMPS.length - 1;
    const tRaw = reducedMotion ? Math.round(clamp(campT, 0, maxT)) : clamp(campT, 0, maxT);
    const t = shapeCampT(tRaw);
    const i = Math.min(Math.floor(t), CAMPS.length - 2);
    const f = clamp(t - i, 0, 1);
    const a = CAMPS[i];
    const b = CAMPS[i + 1];

    // Camp 3's pose is natively dynamic: the orbit around the scroll-focused
    // site. Travel into the camp aims straight at the first site's orbit,
    // the orbit itself carries the camera rightward through the last site,
    // and the exit continues from there into the summit pull-back — one
    // monotone chain with no seams.
    const orbitPose = (sp: number) => {
      const id = siteIdByProgress(sp);
      const markers = getProjectMarkers();
      const m = markers.find((mk) => mk.id === id) ?? markers[0];
      const th = Math.atan2(m.position[2], m.position[0]) - 0.55;
      const r = Math.hypot(m.position[0], m.position[2]) + 8.5;
      return {
        theta: th,
        radius: r,
        // High enough that the walked field below stays clear of grazing
        // self-occlusion (the leg-3/leg-4 saddle sits near the sight line).
        y: m.position[1] + 6.0,
        look: [m.position[0], m.position[1] + 1.6, m.position[2]] as [number, number, number],
      };
    };

    let thetaA = a.theta;
    let radiusA = a.radius;
    let thetaB = b.theta;
    let radiusB = b.radius;
    let lookA = a.target;
    let lookB = b.target;
    let yA: number | null = null;
    let yB: number | null = null;
    if (i === 2) {
      const o = orbitPose(siteProgress);
      thetaB = o.theta;
      radiusB = o.radius;
      yB = o.y;
      lookB = o.look;
    } else if (i === 3) {
      const o = orbitPose(siteProgress);
      thetaA = o.theta;
      radiusA = o.radius;
      yA = o.y;
      lookA = o.look;
    }

    // Leg 00→01 wraps a third of the way around the peak, and the notice
    // board hides behind the south ridge for most of that arc — while the
    // page's "read the notice board" header is already up. Front-load the
    // swing so the board clears the ridge early in the travel; the last
    // stretch of scroll only settles the dock.
    const fT = i === 0 ? 1 - Math.pow(1 - f, 2.6) : f;
    const theta = lerp(thetaA, thetaB, fT);
    const radius = lerp(radiusA, radiusB, fT);
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    let y: number;
    if (yA === null && yB === null) {
      y = terrainHeight(x, z) + lerp(a.clearance, b.clearance, fT);
    } else {
      const endA =
        yA ?? terrainHeight(radiusA * Math.cos(thetaA), radiusA * Math.sin(thetaA)) + a.clearance;
      const endB =
        yB ?? terrainHeight(radiusB * Math.cos(thetaB), radiusB * Math.sin(thetaB)) + b.clearance;
      // Blend endpoint heights — RISING EARLY on the pull-back to the
      // crane (altitude first, then distance: the low first beats of that
      // travel grazed the wraps' benches) — and never sink into a ridge.
      const fy = i === 3 ? Math.pow(f, 0.55) : f;
      y = Math.max(lerp(endA, endB, fy), terrainHeight(x, z) + 2.2);
    }
    posTarget.set(x, y, z);

    lookTarget.set(
      lerp(lookA[0], lookB[0], fT),
      lerp(lookA[1], lookB[1], fT),
      lerp(lookA[2], lookB[2], fT)
    );

    // Glance toward whatever holds the survey's attention: the hovered or
    // opened project first, else the route leg / site the scroll has focused.
    const focusId = hoverProjectId ?? modalProjectId;
    let focusPoint: [number, number, number] | null = null;
    if (focusId) {
      const marker = getProjectMarkers().find((m) => m.id === focusId);
      if (marker) focusPoint = [marker.position[0], marker.position[1] + 1.2, marker.position[2]];
    } else if (inCampWindow(campT, 2)) {
      // Follow the walker along the switchbacks: a continuous pan, not jumps.
      const walker = walkerPosition(ascentFrame.trailT);
      focusPoint = [walker[0], walker[1] + 0.6, walker[2]];
    } else if (inCampWindow(campT, 3)) {
      const siteId = focusedSiteId({ campT, legProgress, siteProgress, hoverProjectId, modalProjectId });
      const site = getAnchors().find((a) => a.id === `site-${siteId}`);
      if (site) focusPoint = site.position;
    }
    if (focusPoint) {
      // Full horizontal attention, but only a nod vertically — the horizon
      // stays in frame instead of the camera staring at the ground.
      const baseY = lookTarget.y;
      markerLook.set(focusPoint[0], focusPoint[1], focusPoint[2]);
      lookTarget.lerp(markerLook, ASCENT_CONFIG.HOVER_LOOK_BIAS);
      lookTarget.setY(baseY + (markerLook.y - baseY) * 0.22);
    }

    // Scroll-following pans: no fixed height while a climb is read. At the
    // switchbacks the camera starts low beside the first turn and rides up
    // with the walker; at the high camps it rises site by site.
    // Starts early so leaving the board reads as a pan down to the trail's
    // first turn, where the walker waits.
    const climbWindow =
      smooth01((tRaw - 1.35) / 0.45) * (1 - smooth01((tRaw - 2.35) / 0.25));
    // The line-of-sight lift rises on the SAME gentle curve as the ride —
    // the board departure is one smooth glide (fast ramps and hard floors
    // here all read as a jolt at the sign; reverted for good). It holds
    // THROUGH the travel to the first sites (until ≈2.78, when the orbit's
    // own height governs) — fading at 2.35 opened Leg 03 → Site 02.
    const losWindow =
      smooth01((tRaw - 1.35) / 0.45) * (1 - smooth01((tRaw - 2.62) / 0.16));
    if (climbWindow > 0 || losWindow > 0) {
      const wp = walkerPosition(ascentFrame.trailT);
      // The ride CRANES UP as the climb proceeds: low and intimate at the
      // first turn, high enough by leg 4 to look over the field's shoulder
      // at the junction and the first sites — from a low camera that whole
      // continuation hides behind the slope (the recurring screenshot).
      const rideHeight = 3.4 + smooth01(ascentFrame.trailT) * 4.6;
      posTarget.setY(lerp(posTarget.y, wp[1] + rideHeight, climbWindow));
      // Line-of-sight solve: lift the camera until its rays to the walker,
      // the field's top hairpin, the third hairpin AND (late in the climb)
      // the first site all clear every rise in between.
      const topTurn = TRAIL_TURN_POSITIONS[TRAIL_TURN_POSITIONS.length - 1];
      const thirdTurn = TRAIL_TURN_POSITIONS[3];
      // The early traverse (≈ turn 5, past the junction) is a standing
      // target: with the ahead-road now a legible line, that stretch
      // hiding behind the field's shoulder reads as broken road.
      const upper = upperTrailPoints();
      const firstStretch = upper[Math.floor((upper.length - 1) * 0.2)];
      const losTargets: Array<readonly [number, number, number]> = [
        wp,
        topTurn,
        thirdTurn,
        firstStretch,
      ];
      if (tRaw > 2.05) {
        const m0 = getProjectMarkers()[0];
        losTargets.push([m0.position[0], m0.position[1] + 0.6, m0.position[2]]);
      }
      let requiredY = posTarget.y;
      for (const target of losTargets) {
        for (const k of [0.3, 0.5, 0.7, 0.85]) {
          const sx = posTarget.x + (target[0] - posTarget.x) * k;
          const sz = posTarget.z + (target[2] - posTarget.z) * k;
          const need = terrainHeight(sx, sz) + 1.2;
          // Camera height so the ray at fraction k clears `need`.
          const camY = (need - target[1] * k) / (1 - k);
          if (camY > requiredY) requiredY = camY;
        }
      }
      posTarget.setY(lerp(posTarget.y, Math.min(requiredY, wp[1] + 16), losWindow));
      markerLook.set(wp[0], wp[1] + 1.2, wp[2]);
      lookTarget.lerp(markerLook, climbWindow * 0.7);
    }

    ascentFrame.fogDensity = lerp(a.fogDensity, b.fogDensity, f);
    ascentFrame.warmth = lerp(a.warmth, b.warmth, f);
    ascentFrame.dim = modalProjectId ? 1 : 0;
    // Night at the trailhead, dawn breaking as the climb rises.
    ascentFrame.dayT = tRaw / (CAMPS.length - 1);
    // The walker's damped progress: lags on fast scrolls, never leaves the trail.
    if (reducedMotion) ascentFrame.trailT = legProgress;
    else easing.damp(ascentFrame, "trailT", legProgress, 0.3, delta);

    if (reducedMotion) {
      state.camera.position.copy(posTarget);
      lookCurrent.copy(lookTarget);
      state.camera.lookAt(lookCurrent);
    } else {
      easing.damp3(state.camera.position, posTarget, ASCENT_CONFIG.CAMERA_SMOOTH_TIME, delta);
      easing.damp3(lookCurrent, lookTarget, ASCENT_CONFIG.TARGET_SMOOTH_TIME, delta);
      // Fast scrolls make the damped camera cut a chord between distant
      // poses — never let that chord pass through the mountain.
      const camGround = terrainHeight(state.camera.position.x, state.camera.position.z);
      if (state.camera.position.y < camGround + 1.7) {
        state.camera.position.setY(camGround + 1.7);
      }
      // (The per-camera sight-line floor that once lived here is gone: at
      // any human scroll speed it read as a jolt at the sign. The gentle
      // target-side lift above carries the whole job.)
      // Idle breath: a barely-there sway so held shots feel alive.
      const breathe = state.clock.elapsedTime;
      markerLook.set(
        lookCurrent.x + Math.sin(breathe * 0.23) * 0.06,
        lookCurrent.y + Math.sin(breathe * 0.31 + 1.7) * 0.04,
        lookCurrent.z
      );
      state.camera.lookAt(markerLook);
    }

    const elevation = Math.round(lerp(a.elevation, b.elevation, f) / 5) * 5;
    const campName = CAMPS[Math.round(tRaw)].name;
    if (elevation !== hudRef.current.elevation || campName !== hudRef.current.camp) {
      hudRef.current = { elevation, camp: campName };
      useAscentStore.setState({ hudElevation: elevation, hudCamp: campName });
    }
  });

  return null;
};
