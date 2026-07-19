import { createNoise2D } from "simplex-noise";

// The raw mountain: a tall steep cone with noise detail, BEFORE the route
// corridor is carved into it. Only trail.ts and terrainField.ts consume
// this; everything else uses the final terrainHeight from terrainField.

const SEED = 20260611;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const noise2D = createNoise2D(mulberry32(SEED));

export const TERRAIN = {
  size: 175,
  peak: 48,
  sigma: 46,
} as const;

export function baseTerrain(x: number, z: number): number {
  const r = Math.hypot(x, z);
  const falloff = Math.exp(-((r / TERRAIN.sigma) ** 2));

  let fbm = 0;
  let amp = 1;
  let freq = 0.018;
  let norm = 0;
  for (let i = 0; i < 4; i++) {
    fbm += amp * noise2D(x * freq, z * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  fbm /= norm;

  const ridged = 1 - Math.abs(noise2D(x * 0.025 + 31.7, z * 0.025 - 12.3));
  const cone = TERRAIN.peak * Math.pow(falloff, 1.25);
  const detail = (0.55 + 0.45 * ridged) * (0.7 + 0.3 * fbm);
  const hills = 1.6 * fbm * (1 - falloff * 0.6);
  return cone * detail + hills;
}
