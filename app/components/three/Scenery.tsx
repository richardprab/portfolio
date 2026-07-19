"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { terrainHeight } from "./terrainField";
import { approachCap, routeInfluence } from "./trail";
import { BOARD, SUMMIT_POINT, getProjectMarkers } from "./camps";

// Scattered substance: boulders across the slopes, sparse pines below the
// treeline. Deterministic placement, kept clear of the route, the board,
// the camps and the amphitheater; instanced so it's three draw calls total.

interface SceneryProps {
  quality: "low" | "high" | "soft";
}

function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 48271) % 2147483647;
    return s / 2147483647;
  };
}

const TREELINE = 15;

function clearOfLandmarks(x: number, z: number): boolean {
  // Rocks and trees keep well off the route so nothing ever crowds the line.
  if (routeInfluence(x, z).weight > 0.03) return false;
  if (approachCap(x, z) !== Infinity) return false;
  const d2 = (px: [number, number, number]) => {
    const dx = x - px[0];
    const dz = z - px[2];
    return dx * dx + dz * dz;
  };
  if (d2(BOARD.position) < 30) return false;
  if (d2(SUMMIT_POINT) < 20) return false;
  for (const marker of getProjectMarkers()) {
    if (d2(marker.position) < 7) return false;
  }
  return true;
}

interface Placement {
  x: number;
  y: number;
  z: number;
  scale: number;
  rot: number;
}

function scatter(
  seed: number,
  count: number,
  rMin: number,
  rMax: number,
  accept: (x: number, z: number, y: number) => boolean
): Placement[] {
  const rand = lcg(seed);
  const placements: Placement[] = [];
  let guard = count * 14;
  while (placements.length < count && guard-- > 0) {
    const theta = rand() * Math.PI * 2;
    const r = rMin + Math.sqrt(rand()) * (rMax - rMin);
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    if (!clearOfLandmarks(x, z)) continue;
    const y = terrainHeight(x, z);
    if (!accept(x, z, y)) continue;
    placements.push({ x, y, z, scale: 0.4 + rand() * 0.9, rot: rand() * Math.PI * 2 });
  }
  return placements;
}

export const Scenery = ({ quality }: SceneryProps) => {
  const rocksRef = useRef<THREE.InstancedMesh>(null);
  const trunksRef = useRef<THREE.InstancedMesh>(null);
  const canopiesRef = useRef<THREE.InstancedMesh>(null);

  const { rocks, trees } = useMemo(() => {
    const rockCount = quality === "high" ? 130 : quality === "low" ? 70 : 40;
    const treeCount = quality === "high" ? 80 : quality === "low" ? 45 : 22;
    return {
      // Boulders live on the open mid slopes.
      rocks: scatter(83251, rockCount, 10, 72, (x, z, y) => y > 2 && y < 30),
      // Pines stay below the treeline, out on the lower aprons.
      trees: scatter(46109, treeCount, 30, 80, (x, z, y) => y > 1.2 && y < TREELINE),
    };
  }, [quality]);

  const geometries = useMemo(
    () => ({
      rock: new THREE.IcosahedronGeometry(0.55, 0),
      trunk: new THREE.CylinderGeometry(0.05, 0.08, 0.5, 5),
      canopy: new THREE.ConeGeometry(0.42, 1.5, 6),
    }),
    []
  );

  const materials = useMemo(
    () => ({
      rock: new THREE.MeshStandardMaterial({ color: "#3d485f", roughness: 0.95 }),
      trunk: new THREE.MeshStandardMaterial({ color: "#463c33", roughness: 0.95 }),
      canopy: new THREE.MeshStandardMaterial({ color: "#1f2c40", roughness: 0.9 }),
    }),
    []
  );

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [geometries, materials]);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();

    const rocksMesh = rocksRef.current;
    if (rocksMesh) {
      rocks.forEach((p, i) => {
        dummy.position.set(p.x, p.y + 0.12 * p.scale, p.z);
        dummy.rotation.set(p.rot * 0.35, p.rot, p.rot * 0.6);
        dummy.scale.set(p.scale * (0.8 + (i % 3) * 0.25), p.scale * 0.75, p.scale);
        dummy.updateMatrix();
        rocksMesh.setMatrixAt(i, dummy.matrix);
      });
      rocksMesh.instanceMatrix.needsUpdate = true;
      rocksMesh.frustumCulled = false;
    }

    const trunks = trunksRef.current;
    const canopies = canopiesRef.current;
    if (trunks && canopies) {
      trees.forEach((p, i) => {
        dummy.rotation.set(0, p.rot, 0);
        dummy.position.set(p.x, p.y + 0.22 * p.scale, p.z);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        trunks.setMatrixAt(i, dummy.matrix);
        dummy.position.set(p.x, p.y + (0.45 + 0.75) * p.scale, p.z);
        dummy.updateMatrix();
        canopies.setMatrixAt(i, dummy.matrix);
      });
      trunks.instanceMatrix.needsUpdate = true;
      canopies.instanceMatrix.needsUpdate = true;
      trunks.frustumCulled = false;
      canopies.frustumCulled = false;
    }
  }, [rocks, trees]);

  return (
    <group>
      <instancedMesh ref={rocksRef} args={[geometries.rock, materials.rock, rocks.length]} />
      <instancedMesh ref={trunksRef} args={[geometries.trunk, materials.trunk, trees.length]} />
      <instancedMesh
        ref={canopiesRef}
        args={[geometries.canopy, materials.canopy, trees.length]}
      />
    </group>
  );
};
