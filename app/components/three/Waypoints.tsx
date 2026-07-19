"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { easing } from "maath";
import { paintBoardTexture } from "./signPainter";
import { BOARD, CAMPS, dressingPosition, getProjectMarkers, SUMMIT_POINT } from "./camps";
import { terrainHeight } from "./terrainField";
import { focusedSiteId, siteIdByProgress } from "./anchors";
import {
  getProjectSpurs,
  legPoints,
  TRAIL_LEG_COUNT,
  TRAIL_TURN_POSITIONS,
  upperTrailPoints,
} from "./trail";
import { useAscentStore } from "./store";
import { ascentFrame } from "./frame";
import { ASCENT_CONFIG } from "../../config/animations";

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

interface BeaconHandle {
  group: THREE.Group;
  lampMaterial: THREE.MeshStandardMaterial;
}

// The manifest, painted into the notice board's material: text as part of
// the world — lit, fogged and grained with everything else, always there.
// Anisotropic filtering multiplies texture taps per pixel — ruinous on a
// software rasterizer, so the soft tier reads the board through plain
// trilinear.
const BoardFace = ({ quality }: { quality: "low" | "high" | "soft" }) => {
  const gl = useThree((s) => s.gl);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let live = true;
    let painted: THREE.CanvasTexture | null = null;
    const anisotropy = quality === "soft" ? 1 : gl.capabilities.getMaxAnisotropy();
    paintBoardTexture(anisotropy).then((t) => {
      if (!live) {
        t.dispose();
        return;
      }
      painted = t;
      setTexture(t);
    });
    return () => {
      live = false;
      painted?.dispose();
    };
  }, [gl, quality]);

  if (!texture) return null;

  return (
    <mesh position={[0, 2.35, 0.07]}>
      <planeGeometry args={[5.2, 3.3]} />
      <meshStandardMaterial
        map={texture}
        emissive="#ffffff"
        emissiveMap={texture}
        emissiveIntensity={0.3}
        roughness={0.9}
      />
    </mesh>
  );
};

// A route curve that can never sink: Catmull-Rom splines SAG below their
// control polyline between points, and the terrain is carved to fit the
// POLYLINE — so on curvy stretches the rendered tube dipped underground
// and the road appeared to end mid-slope (the long-running "blocked"
// screenshots, immune to every terrain and camera fix). The spline is
// densely resampled and every sample clamped above the rendered surface.
function groundedPoints(
  pts: Array<[number, number, number]>,
  samples: number
): THREE.Vector3[] {
  const base = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  const dense: THREE.Vector3[] = [];
  for (let i = 0; i <= samples; i++) {
    const p = base.getPoint(i / samples);
    // 0.17: the low-poly mesh's facets interpolate slightly above the
    // analytic surface between jittered vertices.
    p.y = Math.max(p.y, terrainHeight(p.x, p.z) + 0.17);
    dense.push(p);
  }
  return dense;
}

function groundedCurve(
  pts: Array<[number, number, number]>,
  samples: number
): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(groundedPoints(pts, samples));
}

// The RENDERED walking path: the walker and its lamp must ride the same
// ground-clamped curve the tubes are built from — on the polyline they
// visibly detach from the line at the clamp's wiggles.
let walkerPathCache: THREE.Vector3[] | null = null;
function getWalkerPath(): THREE.Vector3[] {
  if (walkerPathCache) return walkerPathCache;
  walkerPathCache = [];
  for (let leg = 0; leg < TRAIL_LEG_COUNT; leg++) {
    walkerPathCache.push(...groundedPoints(legPoints(leg), 60));
  }
  return walkerPathCache;
}

function walkerOnPath(t: number): THREE.Vector3 {
  const path = getWalkerPath();
  const f = Math.min(Math.max(t, 0), 1) * (path.length - 1);
  const i = Math.min(Math.floor(f), path.length - 2);
  const g = f - i;
  return path[i].clone().lerp(path[i + 1], g);
}

// The switchback trail: one glowing tube per internship leg, cairns at the
// hairpin turns, and an ember that walks the path as the visitor scrolls.
const SwitchbackTrail = () => {
  const walkerRef = useRef<THREE.Mesh>(null);

  const legGeometries = useMemo(
    () =>
      Array.from({ length: TRAIL_LEG_COUNT }, (_, leg) => {
        const curve = groundedCurve(legPoints(leg), 60);
        return new THREE.TubeGeometry(curve, 60, 0.065, 6, false);
      }),
    []
  );

  const legMaterials = useMemo(
    () =>
      legGeometries.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: "#55627e",
            emissive: "#f2a541",
            emissiveIntensity: 0.12,
            roughness: 0.8,
          })
      ),
    [legGeometries]
  );

  // The route above the switchbacks, split into short chunks so the burn
  // can TRAVEL: each chunk's glow follows a front that advances with the
  // journey (site by site, completing on the crane pull-back). The line is
  // never lit beyond what the camera can actually see — on a mountain, a
  // brightly lit road that dives behind the peak reads as broken road.
  const upperChunks = useMemo(() => {
    const pts = upperTrailPoints();
    const chunkLen = 6;
    const chunks: Array<{ geometry: THREE.TubeGeometry; u: number }> = [];
    for (let start = 0; start < pts.length - 1; start += chunkLen - 1) {
      const end = Math.min(start + chunkLen, pts.length);
      const slice = pts.slice(start, end);
      if (slice.length < 2) break;
      const segs = (slice.length - 1) * 4;
      chunks.push({
        geometry: new THREE.TubeGeometry(groundedCurve(slice, segs), segs, 0.055, 6, false),
        u: (start + end - 1) / 2 / (pts.length - 1),
      });
    }
    return chunks;
  }, []);

  const upperMaterials = useMemo(
    () =>
      upperChunks.map(
        () =>
          // Unlit road is a legible slate line: near-black "melted into
          // the rock" read as MISSING road from the traverse (the
          // "blocked" reports at Leg 4 → Site 2 were this, not geometry —
          // the carve guarantees the presented road is never occluded).
          new THREE.MeshStandardMaterial({
            color: "#55627e",
            emissive: "#f2a541",
            emissiveIntensity: 0.12,
            roughness: 0.8,
          })
      ),
    [upperChunks]
  );

  // Where each site's spur leaves the traverse, as a 0..1 fraction of the
  // upper route — the burn front tracks the focused site through these.
  const siteFractions = useMemo(() => {
    const pts = upperTrailPoints();
    const map = new Map<string, number>();
    for (const spur of getProjectSpurs()) {
      let best = 0;
      let bestD = Infinity;
      pts.forEach((p, i) => {
        const d = (p[0] - spur.base[0]) ** 2 + (p[2] - spur.base[2]) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      map.set(spur.id, best / (pts.length - 1));
    }
    return map;
  }, []);

  // (Spur tubes removed on request: the beacons stand free beside the
  // road — the connecting stubs read as stray branches.)

  const walkerMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f2a541",
        emissive: "#f2a541",
        emissiveIntensity: 3.0,
      }),
    []
  );

  const cairnGeometry = useMemo(() => new THREE.IcosahedronGeometry(0.16, 0), []);
  const cairnMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#55627e", roughness: 0.95, flatShading: true }),
    []
  );
  const walkerGeometry = useMemo(() => new THREE.SphereGeometry(0.11, 12, 12), []);

  useEffect(() => {
    return () => {
      legGeometries.forEach((g) => g.dispose());
      legMaterials.forEach((m) => m.dispose());
      upperChunks.forEach((c) => c.geometry.dispose());
      upperMaterials.forEach((m) => m.dispose());
      walkerMaterial.dispose();
      cairnGeometry.dispose();
      cairnMaterial.dispose();
      walkerGeometry.dispose();
    };
  }, [
    legGeometries,
    legMaterials,
    upperChunks,
    upperMaterials,
    walkerMaterial,
    cairnGeometry,
    cairnMaterial,
    walkerGeometry,
  ]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const { campT, reducedMotion, siteProgress } = useAscentStore.getState();
    const onCamp = Math.round(clamp(campT, 0, CAMPS.length - 1)) === 2;
    // Derive both walker and glow from the damped trail parameter, so the
    // ember and the burn always agree — and never leave the line.
    const trailT = ascentFrame.trailT;
    const active = onCamp ? Math.min(Math.floor(trailT * TRAIL_LEG_COUNT), TRAIL_LEG_COUNT - 1) : -1;

    legMaterials.forEach((material, i) => {
      // Walked legs stay warm behind you; the one underfoot burns with a
      // slow living pulse; the climb ahead waits in the dark.
      const pulse = i === active && !reducedMotion ? Math.sin(state.clock.elapsedTime * 2.2) * 0.22 : 0;
      let target = active < 0 ? 0.12 : i < active ? 0.5 : i === active ? 1.75 + pulse : 0.1;
      // The summit reveal: at the crane the WHOLE route burns — dim legs
      // read as broken road in the wide shot.
      target = Math.max(target, clamp((campT - 3.36) / 0.2, 0, 1) * 0.5);
      if (reducedMotion) material.emissiveIntensity = target;
      else easing.damp(material, "emissiveIntensity", target, 0.25, delta);
    });

    // The upper route ignites as a travelling burn: the front follows the
    // scroll-focused site through the high camps, then sweeps the summit
    // push exactly as the crane pulls back (front hits 1.0 at campT ≈ 3.56,
    // in step with the fanfare). Behind the front the line stays warm, like
    // the walked switchbacks; ahead it waits as a faint slate survey line.
    let front = 0;
    if (campT >= 2.3) {
      const scrollSite = (siteFractions.get(siteIdByProgress(siteProgress)) ?? 0) + 0.06;
      front = campT < 2.7 ? scrollSite * clamp((campT - 2.3) / 0.4, 0, 1) : scrollSite;
      // Leaving the field, the road ignites THROUGH the first sites: an
      // unlit line between the junction and site 02 read as "no road".
      front = Math.max(front, clamp((campT - 2.35) / 0.35, 0, 1) * 0.25);
      front = Math.max(front, Math.min((campT - 3.36) / 0.2, 1.06));
    }
    upperChunks.forEach((chunk, i) => {
      const material = upperMaterials[i];
      const behind = clamp((front - chunk.u) / 0.14, 0, 1);
      // The front's glow is ASYMMETRIC: a warm ember behind the front, near
      // nothing ahead of it — light bleeding forward would paint road the
      // camera may not see yet, and a lit line vanishing behind a ridge
      // reads as broken road (the very bug the carve fixed).
      const d = chunk.u - front;
      const glow = Math.exp(-((d * (d > 0 ? 30 : 8)) ** 2));
      const target = 0.12 + behind * 0.42 + glow * 1.15;
      if (reducedMotion) material.emissiveIntensity = target;
      else easing.damp(material, "emissiveIntensity", target, 0.4, delta);
    });

    const walker = walkerRef.current;
    if (walker) {
      const pos = walkerOnPath(trailT);
      const scale = onCamp ? 1 : 0;
      walker.position.set(pos.x, pos.y + 0.16, pos.z);
      if (reducedMotion) walker.scale.setScalar(scale);
      else easing.damp3(walker.scale, [scale, scale, scale], 0.3, delta);
    }
  });

  return (
    <group>
      {legGeometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={legMaterials[i]} />
      ))}
      {upperChunks.map((chunk, i) => (
        <mesh key={`upper-${i}`} geometry={chunk.geometry} material={upperMaterials[i]} />
      ))}
      {TRAIL_TURN_POSITIONS.map((pos, i) => (
        <group key={`turn-${i}`} position={[pos[0], pos[1] - 0.05, pos[2]]}>
          <mesh geometry={cairnGeometry} material={cairnMaterial} position={[0, 0.1, 0]} />
          <mesh geometry={cairnGeometry} material={cairnMaterial} position={[0.06, 0.28, 0.03]} scale={0.62} />
        </group>
      ))}
      <mesh ref={walkerRef} geometry={walkerGeometry} material={walkerMaterial} scale={0} />
    </group>
  );
};

export const Waypoints = ({ quality }: { quality: "low" | "high" | "soft" }) => {
  const markers = useMemo(() => getProjectMarkers(), []);
  const beaconRefs = useRef(new Map<string, BeaconHandle>());
  const lightRef = useRef<THREE.PointLight>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  const embersRef = useRef<THREE.Group>(null);

  // Each summit prop grounded on the actual dome surface.
  const summitSpots = useMemo(() => {
    const place = (dx: number, dz: number): [number, number, number] => {
      const x = SUMMIT_POINT[0] + dx;
      const z = SUMMIT_POINT[2] + dz;
      return [x, terrainHeight(x, z), z];
    };
    return {
      flag: place(-1.15, -0.42),
      sign: place(0, 0),
      cairn: place(0.75, 0.32),
      lamp: place(-0.5, 0.55),
    };
  }, []);

  const geometries = useMemo(
    () => ({
      pole: new THREE.CylinderGeometry(0.05, 0.07, 1.6, 8),
      sign: new THREE.BoxGeometry(0.9, 0.5, 0.06),
      stone: new THREE.IcosahedronGeometry(0.35, 0),
      lamp: new THREE.SphereGeometry(0.08, 12, 12),
      // Tall enough to bury its foot below grade on sloped ground.
      beaconPole: new THREE.CylinderGeometry(0.018, 0.032, 1.05, 8),
      beaconHead: new THREE.OctahedronGeometry(0.13),
      flagPole: new THREE.CylinderGeometry(0.04, 0.06, 3.2, 8),
      flag: new THREE.PlaneGeometry(1.4, 0.8),
      boardPanel: new THREE.BoxGeometry(5.2, 3.3, 0.1),
      boardFrame: new THREE.BoxGeometry(5.5, 3.6, 0.06),
      boardPost: new THREE.CylinderGeometry(0.07, 0.09, 2.1, 8),
      boardRoof: new THREE.BoxGeometry(5.9, 0.14, 0.62),
      boardBolt: new THREE.CylinderGeometry(0.045, 0.045, 0.05, 6),
      lampStem: new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6),
    }),
    []
  );

  const materials = useMemo(() => {
    const palette = useAscentStore.getState().palette;
    return {
      structure: new THREE.MeshStandardMaterial({
        color: palette.structure,
        roughness: 0.95,
        flatShading: true,
      }),
      campLamp: new THREE.MeshStandardMaterial({
        color: palette.accent,
        emissive: palette.accent,
        emissiveIntensity: 0.8,
      }),
      flag: new THREE.MeshStandardMaterial({ color: palette.accent, side: THREE.DoubleSide }),
      // The notice board's face: a shade lighter than the terrain with a
      // faint glow of its own, so the manifest reads as lit signage.
      board: new THREE.MeshStandardMaterial({
        color: "#26324b",
        roughness: 0.85,
        emissive: "#141c2e",
        emissiveIntensity: 0.55,
      }),
    };
  }, []);

  const beaconMaterials = useMemo(
    () =>
      markers.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: useAscentStore.getState().palette.accent,
            emissive: useAscentStore.getState().palette.accent,
            emissiveIntensity: 0.65,
          })
      ),
    [markers]
  );


  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
      beaconMaterials.forEach((m) => m.dispose());
    };
  }, [geometries, materials, beaconMaterials]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const storeState = useAscentStore.getState();
    const { palette, campT, hoverProjectId, modalProjectId, reducedMotion } = storeState;
    const isDark = palette.starOpacity > 0;
    const nearestCamp = Math.round(clamp(campT, 0, CAMPS.length - 1));
    // The scroll-focused site counts as focus too, so post and callout light
    // up together while the visitor walks the high camps.
    const focusId =
      hoverProjectId ?? modalProjectId ?? (nearestCamp === 3 ? focusedSiteId(storeState) : null);
    const dimFactor = 1 - ascentFrame.dim * 0.5;

    const snap = reducedMotion;
    const dampColor = (mat: THREE.MeshStandardMaterial, color: string, emissiveToo: boolean) => {
      if (snap) {
        mat.color.set(color);
        if (emissiveToo) mat.emissive.set(color);
        return;
      }
      easing.dampC(mat.color, color, ASCENT_CONFIG.ATMOS_SMOOTH_TIME, delta);
      if (emissiveToo) easing.dampC(mat.emissive, color, ASCENT_CONFIG.ATMOS_SMOOTH_TIME, delta);
    };

    dampColor(materials.structure, palette.structure, false);
    dampColor(materials.campLamp, palette.accent, true);
    dampColor(materials.flag, palette.accent, false);

    const campLampTarget = (isDark ? 2.6 : 0.7) * dimFactor;
    if (snap) materials.campLamp.emissiveIntensity = campLampTarget;
    else easing.damp(materials.campLamp, "emissiveIntensity", campLampTarget, 0.5, delta);

    // One travelling lamp: it lives at the active camp and jumps to the
    // hovered project's waypoint, keeping the scene to a single point light.
    const light = lightRef.current;
    if (light) {
      const focusMarker = focusId ? markers.find((m) => m.id === focusId) : undefined;
      let lx: number, ly: number, lz: number;
      if (focusMarker) {
        [lx, ly, lz] = focusMarker.position;
        ly += 1.8;
      } else if (nearestCamp === 1) {
        // At basecamp the lamp hangs over the notice board, lighting it.
        lx = BOARD.position[0];
        ly = BOARD.position[1] + 4.3;
        lz = BOARD.position[2];
      } else if (nearestCamp === 2) {
        // On the switchbacks the lamp travels with the walker, on the
        // rendered path.
        const wpv = walkerOnPath(ascentFrame.trailT);
        lx = wpv.x;
        ly = wpv.y + 1.1;
        lz = wpv.z;
      } else if (nearestCamp === 4) {
        lx = SUMMIT_POINT[0];
        ly = SUMMIT_POINT[1] + 2.2;
        lz = SUMMIT_POINT[2];
      } else {
        const camp = CAMPS[nearestCamp];
        const [dx, dy, dz] = dressingPosition(camp);
        lx = dx;
        ly = dy + 2.0;
        lz = dz;
      }
      const intensity = (isDark ? 10 : 2) * (focusMarker ? 1.8 : 1) * dimFactor;
      if (snap) {
        light.position.set(lx, ly, lz);
        light.intensity = intensity;
        light.color.set(palette.accent);
      } else {
        easing.damp3(light.position, [lx, ly, lz], 0.25, delta);
        easing.damp(light, "intensity", intensity, 0.25, delta);
        easing.dampC(light.color, palette.accent, ASCENT_CONFIG.ATMOS_SMOOTH_TIME, delta);
      }
      // The embers drift around the camps' own fires — never around a
      // focused project beacon, where the drifting dots read as artifacts
      // over the record card.
      if (embersRef.current) {
        // Hidden only over a focused site's record; at the camps (intro
        // dressing, the sign's lamps, the summit) they belong. When the
        // lamp JUMPS between camps the swarm TELEPORTS — damping it across
        // tens of metres streaked the particles through the world.
        embersRef.current.visible = !focusMarker;
        const ex = embersRef.current.position;
        const jump = Math.hypot(ex.x - lx, ex.z - lz);
        if (snap || jump > 8) embersRef.current.position.set(lx, ly - 0.8, lz);
        else easing.damp3(embersRef.current.position, [lx, ly - 0.8, lz], 0.4, delta);
      }
    }


    markers.forEach((marker, idx) => {
      const handle = beaconRefs.current.get(marker.id);
      const material = beaconMaterials[idx];
      if (!material) return;
      const focused = marker.id === focusId;
      const intensity = (focused ? 3.4 : 0.7) * dimFactor * (isDark ? 1 : 0.8);
      const scale = focused ? 1.35 : 1;
      dampColor(material, palette.accent, true);
      if (snap) {
        material.emissiveIntensity = intensity;
        handle?.group.scale.setScalar(scale);
      } else {
        easing.damp(material, "emissiveIntensity", intensity, 0.3, delta);
        if (handle) easing.damp3(handle.group.scale, [scale, scale, scale], 0.3, delta);
      }
    });

    if (flagRef.current && !reducedMotion) {
      flagRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.12;
    }
  });

  const registerBeacon = (id: string) => (group: THREE.Group | null) => {
    if (group) {
      const lampMaterial = beaconMaterials[markers.findIndex((m) => m.id === id)];
      beaconRefs.current.set(id, { group, lampMaterial });
    } else {
      beaconRefs.current.delete(id);
    }
  };

  return (
    <group>
      {/* The basecamp notice board: camp 01's close-up subject. The gear
          manifest (a DOM plate) renders as its face. */}
      <group position={BOARD.position} rotation={[0, BOARD.yaw, 0]}>
        <mesh geometry={geometries.boardPost} material={materials.structure} position={[-2.35, 1.05, -0.06]} />
        <mesh geometry={geometries.boardPost} material={materials.structure} position={[2.35, 1.05, -0.06]} />
        <mesh geometry={geometries.boardFrame} material={materials.structure} position={[0, 2.35, -0.05]} />
        <mesh geometry={geometries.boardPanel} material={materials.board} position={[0, 2.35, 0]} />
        <BoardFace quality={quality} />
        {/* A little roof, corner bolts and lamp stems: a built thing, not
            a floating rectangle. */}
        <mesh
          geometry={geometries.boardRoof}
          material={materials.structure}
          position={[0, 4.22, 0.08]}
          rotation={[0.12, 0, 0]}
        />
        {[
          [-2.42, 0.78],
          [2.42, 0.78],
          [-2.42, 3.92],
          [2.42, 3.92],
        ].map(([bx, by], k) => (
          <mesh
            key={`bolt-${k}`}
            geometry={geometries.boardBolt}
            material={materials.campLamp}
            position={[bx, by, 0.09]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.8}
          />
        ))}
        <mesh geometry={geometries.lampStem} material={materials.structure} position={[-2.5, 4.42, 0.12]} />
        <mesh geometry={geometries.lampStem} material={materials.structure} position={[2.5, 4.42, 0.12]} />
        <mesh geometry={geometries.lamp} material={materials.campLamp} position={[-2.5, 4.25, 0.12]} />
        <mesh geometry={geometries.lamp} material={materials.campLamp} position={[2.5, 4.25, 0.12]} />
      </group>

      <SwitchbackTrail />

      {CAMPS.map((camp, i) => {
        // Only the trailhead keeps generic dressing: camp 01 has the notice
        // board, 02 the trail, 03 the spur lamps and hut, and the summit is
        // dressed separately with each prop grounded on the steep dome.
        if (i !== 0) return null;
        // Slightly larger props at wider camps so set dressing stays legible
        // from afar, while staying small enough to read as scenery.
        const scale = 0.85 + camp.radius * 0.008;
        return (
          <group
            key={camp.sectionId}
            position={i === CAMPS.length - 1 ? SUMMIT_POINT : dressingPosition(camp)}
            rotation={[0, -camp.theta + Math.PI / 2, 0]}
            scale={scale}
          >
            <mesh geometry={geometries.pole} material={materials.structure} position={[0, 0.8, 0]} />
            <mesh geometry={geometries.sign} material={materials.structure} position={[0, 1.35, 0]} />
            <mesh geometry={geometries.stone} material={materials.structure} position={[0.7, 0.18, 0.3]} />
            <mesh
              geometry={geometries.stone}
              material={materials.structure}
              position={[0.75, 0.45, 0.32]}
              scale={0.7}
            />
            <mesh
              geometry={geometries.stone}
              material={materials.structure}
              position={[0.72, 0.63, 0.28]}
              scale={0.45}
            />
            <mesh geometry={geometries.lamp} material={materials.campLamp} position={[-0.5, 1.5, 0.2]} />
            <mesh
              geometry={geometries.beaconPole}
              material={materials.structure}
              position={[-0.5, 0.95, 0.2]}
            />
          </group>
        );
      })}

      {/* Summit dressing: the dome drops away fast, so every prop stands on
          its own ground instead of sharing one floating plane. */}
      <group>
        <group position={summitSpots.flag}>
          <mesh geometry={geometries.flagPole} material={materials.structure} position={[0, 1.6, 0]} />
          <mesh ref={flagRef} geometry={geometries.flag} material={materials.flag} position={[0.7, 2.8, 0]} />
        </group>
        <group position={summitSpots.sign}>
          <mesh geometry={geometries.pole} material={materials.structure} position={[0, 0.8, 0]} />
          <mesh
            geometry={geometries.sign}
            material={materials.structure}
            position={[0, 1.35, 0]}
            rotation={[0, 1.2, 0]}
          />
        </group>
        <group position={summitSpots.cairn}>
          <mesh geometry={geometries.stone} material={materials.structure} position={[0, 0.16, 0]} />
          <mesh geometry={geometries.stone} material={materials.structure} position={[0.06, 0.42, 0.04]} scale={0.62} />
        </group>
        <group position={summitSpots.lamp}>
          <mesh geometry={geometries.beaconPole} material={materials.structure} position={[0, 0.22, 0]} />
          <mesh geometry={geometries.lamp} material={materials.campLamp} position={[0, 0.78, 0]} />
        </group>
      </group>

      {/* Every site — the checkpoint included — wears the same planted
          beacon: pole sunk below grade with a flat stone collar at its
          foot. (The checkpoint's taller pole and pennant were removed on
          request; its record card still carries the Checkpoint chip.) */}
      {markers.map((marker, idx) => (
        <group key={marker.id} ref={registerBeacon(marker.id)} position={marker.position}>
          <mesh
            geometry={geometries.stone}
            material={materials.structure}
            position={[0, 0.03, 0]}
            scale={[0.85, 0.3, 0.85]}
          />
          <mesh geometry={geometries.beaconPole} material={materials.structure} position={[0, 0.22, 0]} />
          <mesh geometry={geometries.beaconHead} material={beaconMaterials[idx]} position={[0, 0.78, 0]} />
        </group>
      ))}

      <pointLight ref={lightRef} distance={14} decay={2} intensity={0} color="#f2a541" />

      {/* Embers and summit flurry: transparent particle passes the software
          rasterizer can't afford — the soft tier goes without. */}
      {quality !== "soft" && (
        <>
          {/* Embers drifting around the active camp's lamp. */}
          <group ref={embersRef}>
            <Sparkles count={26} scale={[7, 3.5, 7]} size={2.4} speed={0.28} opacity={0.45} color="#f2a541" noise={1} />
          </group>

          {/* A quiet snow flurry hanging over the summit. */}
          <group position={[SUMMIT_POINT[0], SUMMIT_POINT[1] + 4, SUMMIT_POINT[2]]}>
            <Sparkles count={70} scale={[17, 9, 17]} size={1.6} speed={0.16} opacity={0.3} color="#dfe6f5" noise={0.6} />
          </group>
        </>
      )}
    </group>
  );
};
