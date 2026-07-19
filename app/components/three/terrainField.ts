import { baseTerrain, TERRAIN } from "./terrainBase";
import { approachCap, routeInfluence } from "./trail";

// The final mountain: the raw peak with the route's bench carved into it —
// materialised as a PRECOMPUTED HEIGHT GRID. The rendered mesh is built from
// this exact grid and every prop/camera placement samples the same grid, so
// the mathematical surface and the drawn surface are one object: whatever
// stands on terrainHeight() stands on visible ground. (Also makes runtime
// queries O(1) instead of scanning the route polyline.)

export { TERRAIN };

// One more node than mesh quads so mesh vertices land exactly on grid nodes.
// (The full grid bakes in ~50 ms at 176² — resolution is cheap; 281² keeps
// silhouettes and steep faces smooth at ~120 ms and one draw call.)
export const TERRAIN_SEGMENTS = 280;
const GRID_N = TERRAIN_SEGMENTS + 1;
const HALF = TERRAIN.size / 2;
const STEP = TERRAIN.size / TERRAIN_SEGMENTS;

// Smooth maximum: rounds the junction where two surfaces meet instead of
// leaving a crease the grid would render as a hard line.
function smax(a: number, b: number, k: number): number {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.max(a, b) + h * h * k * 0.25;
}

function rawHeight(x: number, z: number): number {
  const base = baseTerrain(x, z);
  const { height, weight } = routeInfluence(x, z);
  const blended = weight <= 0 ? base : base * (1 - weight) + height * weight;
  // THE SUMMIT FLOOR. The raw noise hollows the cone's core on one side —
  // the mountain literally had no apex, only a high shoulder, and the
  // carved road ring bridged a hidden crater whose inner walls rendered
  // as giant snow stairs. This gentle cone guarantees a real peak; the
  // visibility caps below still cut the corridor into its flanks.
  const r = Math.hypot(x, z);
  // Beyond the core the dome fades — HARD inside the switchback sector
  // (its ground must stay well under the visibility caps) but gently
  // elsewhere, or the fade itself cliffs into giant grid facets where the
  // raw flank is low (the register quadrant). The two rates blend across
  // the sector boundary so no radial seam appears.
  const th = Math.atan2(z, x);
  const intoField = Math.min(
    Math.max((th + 0.8) / 0.5, 0),
    Math.max((1.8 - th) / 0.5, 0),
    1
  );
  const fadeRate = 0.28 + intoField * 1.22;
  const dome = 40.4 - r * 1.02 - Math.max(0, r - 8.5) ** 2 * fadeRate;
  const lifted = smax(blended, dome, 1.5);
  // The switchback amphitheater stays open: nothing in the approach sector
  // may rise above the trail's sightlines.
  return Math.min(lifted, approachCap(x, z));
}

let grid: Float32Array | null = null;

function buildGrid(): Float32Array {
  if (grid) return grid;
  grid = new Float32Array(GRID_N * GRID_N);
  // Nodes inside the route's bench never move in the relax pass below —
  // the ground under the road is sacrosanct (floating tubes were fought
  // for too long to risk them for shading).
  const protectedNode = new Uint8Array(GRID_N * GRID_N);
  for (let iz = 0; iz < GRID_N; iz++) {
    const z = -HALF + iz * STEP;
    for (let ix = 0; ix < GRID_N; ix++) {
      const x = -HALF + ix * STEP;
      grid[iz * GRID_N + ix] = rawHeight(x, z);
      if (routeInfluence(x, z).weight >= 0.5) protectedNode[iz * GRID_N + ix] = 1;
    }
  }
  // Crest relaxation: where the caps cut cliffs, the crease between the
  // flat top and the drop is a single-node razor edge that lights up as a
  // giant staircase. Two passes pull only sharp CONVEX crests toward
  // their neighbourhood, rounding the rim while leaving gentle ground
  // (and every protected bench node) untouched.
  for (let pass = 0; pass < 2; pass++) {
    const src = Float32Array.from(grid);
    for (let iz = 1; iz < GRID_N - 1; iz++) {
      for (let ix = 1; ix < GRID_N - 1; ix++) {
        const i = iz * GRID_N + ix;
        if (protectedNode[i]) continue;
        const avg =
          (src[i - 1] + src[i + 1] + src[i - GRID_N] + src[i + GRID_N]) / 4;
        const excess = src[i] - avg - 0.55;
        if (excess > 0) grid[i] = avg + 0.55 + excess * 0.35;
      }
    }
  }
  // Steep-face melt: the capped plateaus stack into grid-quantized stair
  // TERRACES on the summit's steep rims — a geometric artifact normal
  // smoothing cannot hide. Several diffusion passes over nodes that are
  // both STEEP and sharply CURVED (stair edges, top and bottom) melt the
  // staircases into continuous faces; gentle terrain fails the slope test
  // and the road's protected ground never moves.
  for (let pass = 0; pass < 8; pass++) {
    const src = Float32Array.from(grid);
    for (let iz = 1; iz < GRID_N - 1; iz++) {
      for (let ix = 1; ix < GRID_N - 1; ix++) {
        const i = iz * GRID_N + ix;
        if (protectedNode[i]) continue;
        const gx = (src[i + 1] - src[i - 1]) / (2 * STEP);
        const gz = (src[i + GRID_N] - src[i - GRID_N]) / (2 * STEP);
        if (Math.hypot(gx, gz) < 1.4) continue;
        const avg =
          (src[i - 1] + src[i + 1] + src[i - GRID_N] + src[i + GRID_N]) / 4;
        if (Math.abs(src[i] - avg) > 0.2) grid[i] = src[i] + (avg - src[i]) * 0.5;
      }
    }
  }
  return grid;
}

export function terrainHeight(x: number, z: number): number {
  const g = buildGrid();
  const fx = Math.min(Math.max((x + HALF) / STEP, 0), GRID_N - 1.001);
  const fz = Math.min(Math.max((z + HALF) / STEP, 0), GRID_N - 1.001);
  const ix = Math.floor(fx);
  const iz = Math.floor(fz);
  const tx = fx - ix;
  const tz = fz - iz;
  const h00 = g[iz * GRID_N + ix];
  const h10 = g[iz * GRID_N + ix + 1];
  const h01 = g[(iz + 1) * GRID_N + ix];
  const h11 = g[(iz + 1) * GRID_N + ix + 1];
  return h00 * (1 - tx) * (1 - tz) + h10 * tx * (1 - tz) + h01 * (1 - tx) * tz + h11 * tx * tz;
}
