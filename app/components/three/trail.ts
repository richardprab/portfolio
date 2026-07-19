import { baseTerrain } from "./terrainBase";
import { portfolioItems } from "../../data/portfolio";

// THE ROUTE IS THE SOURCE OF TRUTH. One continuous line from basecamp to
// the summit shoulder whose height is, by construction, strictly
// increasing — the walker and its light can only ever go up. The terrain
// (terrainField.ts) conforms to this line: a graded bench is carved along
// it, so the path, the beacons and their posts always stand on ground that
// was made for them. Three-import-free.

// [theta, radius] of every turn: four switchback legs (the internships),
// then the traverse past the high camps, then the summit push.
const TURNS: Array<[number, number]> = [
  [0.2, 18.5],
  [1.15, 16.0],
  [0.35, 13.5],
  [1.2, 11.0],
  [0.55, 9.0], // last switchback turn — the upper route continues from here
  [1.05, 7.8],
  [1.7, 6.6],
  [2.35, 5.6],
  [2.9, 4.6],
  [3.25, 3.7],
];

export const TRAIL_LEG_COUNT = 4;
const SWITCHBACK_LAST_TURN = TRAIL_LEG_COUNT; // index into TURNS
const SAMPLES_PER_SEGMENT = 14;
const TRAIL_LIFT = 0.08;
// The route rises by at least this much per sample: strictly ascending.
const MIN_RISE = 0.025;

interface RoutePoint {
  x: number;
  y: number;
  z: number;
  turn: number; // fractional turn index along TURNS
}

let routeCache: RoutePoint[] | null = null;

function buildRoute(): RoutePoint[] {
  if (routeCache) return routeCache;

  // Plan view first.
  const plan: Array<{ x: number; z: number; turn: number }> = [];
  for (let s = 0; s < TURNS.length - 1; s++) {
    const [t0, r0] = TURNS[s];
    const [t1, r1] = TURNS[s + 1];
    for (let i = s === 0 ? 0 : 1; i <= SAMPLES_PER_SEGMENT; i++) {
      const f = i / SAMPLES_PER_SEGMENT;
      const theta = t0 + (t1 - t0) * f;
      const radius = r0 + (r1 - r0) * f;
      plan.push({ x: radius * Math.cos(theta), z: radius * Math.sin(theta), turn: s + f });
    }
  }

  // Heights: take the raw mountain as guidance, then fit a smooth,
  // strictly-increasing profile through it. The terrain will be carved to
  // match, so no clamping back to ground is needed.
  let ys = plan.map((p) => baseTerrain(p.x, p.z));
  for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + MIN_RISE);
  for (let pass = 0; pass < 4; pass++) {
    ys = ys.map((_, i) => {
      let sum = 0;
      let n = 0;
      for (let k = -3; k <= 3; k++) {
        const j = i + k;
        if (j >= 0 && j < ys.length) {
          sum += ys[j];
          n++;
        }
      }
      return sum / n;
    });
    for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + MIN_RISE);
  }

  routeCache = plan.map((p, i) => ({ x: p.x, y: ys[i], z: p.z, turn: p.turn }));
  return routeCache;
}

// --- Queries used by the terrain (corridor carving) --------------------------

// Distance in plan view to the route, plus the carve height there. Where
// several stretches of the route run close together (the switchback
// junction, hairpins), their heights are blended by proximity — a smooth
// saddle — instead of winner-take-all, so every line sits on its own
// carved ground and nothing hangs in the air.
export function routeInfluence(x: number, z: number): { height: number; weight: number } {
  const route = buildRoute();
  let sumW = 0;
  let sumWH = 0;
  let coverage = 1;
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i];
    const b = route[i + 1];
    const abx = b.x - a.x;
    const abz = b.z - a.z;
    const apx = x - a.x;
    const apz = z - a.z;
    const len2 = abx * abx + abz * abz || 1;
    const t = Math.min(Math.max((apx * abx + apz * abz) / len2, 0), 1);
    const px = a.x + abx * t;
    const pz = a.z + abz * t;
    const dx = x - px;
    const dz = z - pz;
    const d2 = dx * dx + dz * dz;
    if (d2 > 30) continue; // far beyond any bench influence
    // A TRUE FLAT bench (ground == route exactly) with a soft shoulder
    // beyond it. Without the flat zone, steep slopes rise right at the
    // line's edge and bury the tube. The bench widens along the upper
    // route, where the summit cone is steepest.
    const flat = 1.55 + Math.min(Math.max((a.turn - 4) / 4, 0), 1) * 0.85;
    const d = Math.sqrt(d2);
    let w = 1;
    if (d > flat) {
      const q = (d - flat) / 1.35;
      const q2 = q * q;
      w = Math.exp(-q2 * q2);
    }
    sumW += w;
    sumWH += w * (a.y + (b.y - a.y) * t);
    coverage *= 1 - Math.min(w, 0.999);
  }
  if (sumW <= 1e-6) return { height: 0, weight: 0 };
  return { height: sumWH / sumW, weight: 1 - coverage };
}

// Field cap at a point: a low step above the NEAREST stretch of route —
// and a terrace where converging legs run close. (A ruled chord-face
// experiment lived here briefly and was reverted: it read worse than the
// natural blend. The field's look is this rule plus routeInfluence's
// benches; road visibility is the camera floor's job, not the terrain's.)
function fieldCap(x: number, z: number): number {
  const route = buildRoute();
  let bestD2 = Infinity;
  let bestH = route[0].y;
  let terrace = Infinity;
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i];
    const b = route[i + 1];
    const abx = b.x - a.x;
    const abz = b.z - a.z;
    const apx = x - a.x;
    const apz = z - a.z;
    const len2 = abx * abx + abz * abz || 1;
    const t = Math.min(Math.max((apx * abx + apz * abz) / len2, 0), 1);
    const dx = x - (a.x + abx * t);
    const dz = z - (a.z + abz * t);
    const d2 = dx * dx + dz * dz;
    const h = a.y + (b.y - a.y) * t;
    if (d2 < bestD2) {
      bestD2 = d2;
      bestH = h;
    }
    // Any stretch this close imposes its terrace; on plain ground the
    // nearest stretch's own terrace is above its step cap, so it's inert.
    if (d2 < 1.3 * 1.3) terrace = Math.min(terrace, h + 0.24);
  }
  return Math.min(bestH + 0.15, terrace);
}

// The upper route's shelf: OUTWARD of the traverse and summit push, ground
// within the corridor may never rise above the road beside it — the line
// rides the crest of its own shoulder the whole way up, so no knoll on the
// cone's flank can stand between a camera and the road. (The road-audit
// script proved every "broken road" sighting on the upper mountain came
// from exactly such knolls, including the cap-relax wall at θ≈1.5 that the
// old field sector left uncapped.) Inward of the line the cone still rises:
// the peak stays the backdrop. Stops short of the last stretch so the
// summit knob itself — flag, register — keeps its natural dome.
function upperShelfCap(x: number, z: number): number {
  // The reference height/radius/turn BLEND across all nearby stretches
  // (inverse-square by distance): the summit push spirals with wraps only
  // ~1.5 m apart, and a nearest-only reference quantizes the corridor into
  // bare terraced treads — a giant staircase on the peak's far side. The
  // blend merges stacked corridors into one smooth steep slope.
  const route = buildRoute();
  let bestD2 = Infinity;
  let sumW = 0;
  let sumH = 0;
  let sumR = 0;
  let sumTurn = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i];
    if (a.turn < SWITCHBACK_LAST_TURN || a.turn > 8.6) continue;
    const b = route[i + 1];
    const abx = b.x - a.x;
    const abz = b.z - a.z;
    const apx = x - a.x;
    const apz = z - a.z;
    const len2 = abx * abx + abz * abz || 1;
    const t = Math.min(Math.max((apx * abx + apz * abz) / len2, 0), 1);
    const px = a.x + abx * t;
    const pz = a.z + abz * t;
    const dx = x - px;
    const dz = z - pz;
    const d2 = dx * dx + dz * dz;
    if (d2 < bestD2) bestD2 = d2;
    if (d2 < 120) {
      const w = 1 / (d2 + 0.35);
      sumW += w;
      sumH += w * (a.y + (b.y - a.y) * t);
      sumR += w * Math.hypot(px, pz);
      sumTurn += w * (a.turn + (b.turn - a.turn) * t);
    }
  }
  if (bestD2 === Infinity || sumW <= 0) return Infinity;
  const bestH = sumH / sumW;
  const bestR = sumR / sumW;
  const bestTurn = sumTurn / sumW;
  const d = Math.sqrt(bestD2);

  // The summit knob rises out of the shelf as a smooth dome (register,
  // flag and the last steps of the push live on real mountain). NO binary
  // exemptions anywhere in this cap: every hard boundary becomes a
  // grid-stepped cliff ring that snow renders as a broken white tower.
  const end = route[route.length - 1];
  const dEnd = Math.hypot(x - end.x, z - end.z);
  const knob = dEnd < 5.2 ? (1 - dEnd / 5.2) ** 2 * 26 : 0;

  // The corridor's width scales with the wrap: near the top the route
  // circles at r≈4–7, and a fixed-width shelf wider than the wrap radius
  // flattens the whole peak into a pancake (the "white wedge" bug).
  const band = Math.min(14.5, Math.max(6.0, bestR * 1.2));
  if (d > band + 6) return Infinity;

  // Inward of the road the mountain rises toward the peak as a steep but
  // SMOOTH dome bank — a binary exemption left a cliff ring that snow
  // rendered as a blank stepped wall.
  const inward = bestR - 2.2 - Math.hypot(x, z);
  if (inward > 3.2) return Infinity;
  const bank = inward > 0 ? (inward / 3.2) ** 2 * 30 : 0;

  // A low parapet at the bench edge tilting gently up with distance —
  // shallower than any sight line the choreography casts at the road. The
  // summit push past the last site is only ever presented to the crane's
  // near-vertical gaze, so there the shoulder may climb steeply and the
  // cone rebuilds into a real peak instead of a mesa. A wide quadratic
  // headwall past the band replaces the old notched relax step.
  const slopeOut = 0.16 + Math.max(0, bestTurn - 7.5) * 0.55;
  const cap = bestH + 0.06 + Math.max(0, d - 2.4) * slopeOut + bank + knob;
  const over = Math.max(0, d - band);
  return cap + (over / 9) ** 2 * 30;
}

// The amphitheater: between the camp-2 camera and the switchback face, raw
// terrain may not rise above the trail's sightlines — and INSIDE the
// switchback field, ground between the legs may only step 0.15 above the
// nearest stretch of route (below the tube's crown, so even grazing views
// keep every leg), while the upper route carries its own shelf cap.
// Returns a height cap (relaxing smoothly at sector edges) or Infinity.
export function approachCap(x: number, z: number): number {
  const shelf = upperShelfCap(x, z);

  const r = Math.hypot(x, z);
  if (r < 7.5 || r > 27.5) return shelf;
  const th = Math.atan2(z, x);
  // The sector extends well past the hairpin turns (legs live in θ
  // 0.2–1.2): a relax band must NEVER sit inside a sight-line fan, or the
  // terrain there escapes the cap and blocks the road. On the right the
  // upper shelf takes over (θ > 1.55); on the LEFT the sector reaches past
  // the notice board (θ −0.28) because the flight's lagging camera looks
  // across θ≈0 at the trail start — the transient audit caught the old
  // −0.15 edge wall doing exactly that. The board apron simply re-grounds
  // on the capped surface.
  if (th < -0.55 || th > 1.55) return shelf;

  const thetaEdge = Math.min((th + 0.55) / 0.2, (1.55 - th) / 0.2, 1);
  if (thetaEdge <= 0) return shelf;

  let cap: number;
  let radialEdge: number;
  if (r >= 17.5) {
    // Approach floor, sloping away from the trail start — never above it.
    // (A raised board pad lived here briefly and was reverted on request.)
    cap = buildRoute()[0].y + 0.12 - Math.max(0, r - 18.5) * 0.55;
    radialEdge = Math.min((27.5 - r) / 1.2, 1);
  } else {
    // Inside the field: a low step above the nearest leg, terraced where
    // legs converge. The inner relax spreads over metres — a sub-node
    // relax band renders as a single-node cliff staircase where the
    // amphitheater meets the summit core.
    cap = fieldCap(x, z);
    radialEdge = Math.min((r - 7.5) / 3.6, 1);
  }
  const edge = Math.max(0, Math.min(thetaEdge, radialEdge));
  if (edge <= 0) return shelf;
  // Quadratic relax: stays low across most of the band (where sight lines
  // graze) and rises only at the very edge, where the summit dome backs it.
  return Math.min(cap + (1 - edge) ** 2 * 30, shelf);
}

// --- Geometry/choreography queries -------------------------------------------

const sliceCache = new Map<string, Array<[number, number, number]>>();

function slice(fromTurn: number, toTurn: number): Array<[number, number, number]> {
  const key = `${fromTurn}:${toTurn}`;
  const cached = sliceCache.get(key);
  if (cached) return cached;
  const points = buildRoute()
    .filter((p) => p.turn >= fromTurn - 1e-6 && p.turn <= toTurn + 1e-6)
    .map((p) => [p.x, p.y + TRAIL_LIFT, p.z] as [number, number, number]);
  sliceCache.set(key, points);
  return points;
}

export const TRAIL_TURN_POSITIONS: Array<[number, number, number]> = TURNS.slice(
  0,
  SWITCHBACK_LAST_TURN + 1
).map((_, i) => {
  const p = buildRoute().find((q) => Math.abs(q.turn - i) < 1e-6)!;
  return [p.x, p.y + TRAIL_LIFT, p.z];
});

// Ground-hugging samples along one switchback leg.
export function legPoints(leg: number): Array<[number, number, number]> {
  return slice(leg, leg + 1);
}

// The route above the switchbacks: traverse plus summit push.
export function upperTrailPoints(): Array<[number, number, number]> {
  return slice(SWITCHBACK_LAST_TURN, TURNS.length - 1);
}

// Reference points for camera staging.
export function traverseMidpoint(): [number, number, number] {
  const points = upperTrailPoints();
  return points[Math.floor(points.length * 0.42)];
}

export function switchbackCentroid(): [number, number, number] {
  const points = slice(0, SWITCHBACK_LAST_TURN);
  const sum = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
  return [sum[0] / points.length, sum[1] / points.length, sum[2] / points.length];
}

// Where the walker stands for a given 0..1 progress through the section.
export function walkerPosition(legProgress: number): [number, number, number] {
  const points = slice(0, SWITCHBACK_LAST_TURN);
  const t = Math.min(Math.max(legProgress, 0), 1) * (points.length - 1);
  const i = Math.min(Math.floor(t), points.length - 2);
  const g = t - i;
  const a = points[i];
  const b = points[i + 1];
  return [a[0] + (b[0] - a[0]) * g, a[1] + (b[1] - a[1]) * g, a[2] + (b[2] - a[2]) * g];
}

// --- Project spurs ------------------------------------------------------------

export interface ProjectSpur {
  id: string;
  base: [number, number, number];
  tip: [number, number, number];
}

let spurCache: ProjectSpur[] | null = null;

// The carved ground as trail sees it — blend AND caps, exactly what the
// terrain grid bakes, so spur planning judges the ground that will exist.
function carvedGround(x: number, z: number): number {
  const base = baseTerrain(x, z);
  const { height, weight } = routeInfluence(x, z);
  return Math.min(base * (1 - weight) + height * weight, approachCap(x, z));
}

// Short side-paths off the traverse. Each spur prefers alternating sides,
// but only takes a side whose ground actually sits level with its base —
// near the switchback junction the outer side belongs to a lower stretch
// of route, and a lamp planted there would hang below its own line.
// Assignment is by PATH ORDER, so site numbers always walk forward.
export function getProjectSpurs(): ProjectSpur[] {
  if (spurCache) return spurCache;
  const points = upperTrailPoints();
  // The traverse portion only (exclude the summit push).
  const end = Math.floor((points.length - 1) * 0.66);
  const count = portfolioItems.length;

  const stubs = Array.from({ length: count }, (_, i) => {
    const f = count === 1 ? 0.5 : 0.05 + (0.9 * i) / (count - 1);
    const idx = Math.min(Math.round(end * f), points.length - 2);
    const base = points[idx];
    const next = points[idx + 1];
    const dx = next[0] - base[0];
    const dz = next[2] - base[2];
    const len = Math.hypot(dx, dz) || 1;
    // Long enough that the beacon kit stands clear of the main line's
    // sight corridor from the orbit azimuths — the prop-aware audit caught
    // collars visibly cutting the road behind them at shorter reach.
    const reach = 1.75 + (i % 3) * 0.3;
    const preferred = i % 2 === 0 ? 1 : -1;

    const candidate = (side: number) => {
      const tx = base[0] + (-dz / len) * side * reach;
      const tz = base[2] + (dx / len) * side * reach;
      const ground = carvedGround(tx, tz);
      return { tx, tz, ground, drop: Math.abs(base[1] - TRAIL_LIFT - ground) };
    };

    let pick = candidate(preferred);
    if (pick.drop > 0.5) {
      const other = candidate(-preferred);
      if (other.drop < pick.drop) pick = other;
    }
    return {
      base,
      tip: [pick.tx, pick.ground, pick.tz] as [number, number, number],
    };
  });

  // Path order: the traverse sweeps theta monotonically, so ordering tips
  // by theta matches the walking direction.
  stubs.sort((a, b) => Math.atan2(a.tip[2], a.tip[0]) - Math.atan2(b.tip[2], b.tip[0]));

  spurCache = portfolioItems.map((item, i) => ({ id: item.id, ...stubs[i] }));
  return spurCache;
}
