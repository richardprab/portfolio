import { CAMPS } from "./camps";

// Per-frame interpolated atmospherics written by TrailCamera and read by the
// terrain, sky and waypoint materials. A plain mutable object keeps this off
// React's render path entirely.
export const ascentFrame = {
  fogDensity: CAMPS[0].fogDensity,
  warmth: CAMPS[0].warmth,
  dim: 0,
  // Damped progress along the switchbacks. The walker and leg glow derive
  // their positions from this parameter, so however fast the page scrolls,
  // the ember can lag but can never leave the trail.
  trailT: 0,
  // The journey's hour: 0 = night at the trailhead, 1 = first light in
  // full blaze at the summit. Sky, terrain and lights all follow it.
  dayT: 0,
};
