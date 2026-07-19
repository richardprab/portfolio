"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { TERRAIN, TERRAIN_SEGMENTS, terrainHeight } from "./terrainField";
import { terrainFragmentShader, terrainVertexShader } from "./shaders";
import { useAscentStore } from "./store";
import { ascentFrame } from "./frame";
import { ASCENT_CONFIG } from "../../config/animations";

interface MountainProps {
  quality: "low" | "high" | "soft";
}

// The mesh no longer needs vertex-per-grid-node alignment: heights are
// sampled analytically at each (jittered) vertex, so the rendered surface
// still IS the surface every placement samples — just triangulated at the
// art style's own density.
// Software WebGL transforms every vertex on the CPU; the soft tier trades
// facet density for frame rate.
const MESH_SEGMENTS = 150;
const MESH_SEGMENTS_SOFT = 100;

export const Mountain = ({ quality }: MountainProps) => {
  void TERRAIN_SEGMENTS;
  const segments = quality === "soft" ? MESH_SEGMENTS_SOFT : MESH_SEGMENTS;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(TERRAIN.size, TERRAIN.size, segments, segments);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    // Deliberate low-poly: jitter interior vertices so the triangulation
    // reads as hand-built facets, not graph paper. Deterministic hash —
    // the mesh is identical every load.
    const step = TERRAIN.size / segments;
    const half = TERRAIN.size / 2;
    for (let i = 0; i < pos.count; i++) {
      const gx = pos.getX(i);
      const gz = pos.getZ(i);
      let x = gx;
      let z = gz;
      if (Math.abs(gx) < half - step && Math.abs(gz) < half - step) {
        const s = Math.sin(gx * 12.9898 + gz * 78.233) * 43758.5453;
        const s2 = Math.sin(gx * 39.3468 + gz * 11.135) * 24634.6345;
        x += ((s - Math.floor(s)) - 0.5) * step * 0.62;
        z += ((s2 - Math.floor(s2)) - 0.5) * step * 0.62;
      }
      pos.setXYZ(i, x, terrainHeight(x, z), z);
    }
    geo.computeVertexNormals();
    return geo;
  }, [segments]);

  const material = useMemo(() => {
    const palette = useAscentStore.getState().palette;
    return new THREE.ShaderMaterial({
      vertexShader: terrainVertexShader,
      fragmentShader: terrainFragmentShader,
      uniforms: {
        uBase: { value: new THREE.Color(palette.terrain) },
        uLine: { value: new THREE.Color(palette.line) },
        uFog: { value: new THREE.Color(palette.fog) },
        uAccent: { value: new THREE.Color(palette.accent) },
        uFogDensity: { value: ascentFrame.fogDensity },
        uDim: { value: 0 },
        uTime: { value: 0 },
        uDay: { value: 0 },
      },
    });
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const { palette, reducedMotion } = useAscentStore.getState();
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uDay.value = ascentFrame.dayT;
    if (reducedMotion) {
      (u.uBase.value as THREE.Color).set(palette.terrain);
      (u.uLine.value as THREE.Color).set(palette.line);
      (u.uFog.value as THREE.Color).set(palette.fog);
      u.uFogDensity.value = ascentFrame.fogDensity;
      u.uDim.value = ascentFrame.dim;
      return;
    }
    easing.dampC(u.uBase.value as THREE.Color, palette.terrain, ASCENT_CONFIG.ATMOS_SMOOTH_TIME, delta);
    easing.dampC(u.uLine.value as THREE.Color, palette.line, ASCENT_CONFIG.ATMOS_SMOOTH_TIME, delta);
    easing.dampC(u.uFog.value as THREE.Color, palette.fog, ASCENT_CONFIG.ATMOS_SMOOTH_TIME, delta);
    easing.damp(u.uFogDensity, "value", ascentFrame.fogDensity, ASCENT_CONFIG.ATMOS_SMOOTH_TIME, delta);
    easing.damp(u.uDim, "value", ascentFrame.dim, 0.35, delta);
  });

  return <mesh geometry={geometry} material={material} />;
};
