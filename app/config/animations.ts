export const ANIMATION_DELAYS = {
  NAV_ITEM: 0.1,
  EXPERIENCE_ITEM: 0.1,
  PORTFOLIO_ITEM: 0.1,
} as const;

export const SCROLL_CONFIG = {
  HERO_FADE_THRESHOLD: 0.7,
  HERO_Y_OFFSET: -100,
  HERO_SCALE: 0.8,
  EXPERIENCE_Y_RANGE: [100, -100] as [number, number],
} as const;

export const EASING_CURVES = {
  SMOOTH: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
} as const;

// Choreography constants for the 3D ascent background.
export const ASCENT_CONFIG = {
  // Fraction of each camp-to-camp scroll gap spent holding the camp pose
  // (applied at both ends), so content is read over a stable backdrop.
  HOLD_ZONE: 0.24,
  // maath smoothTimes (seconds to ~63% convergence) for the camera rig.
  CAMERA_SMOOTH_TIME: 0.55,
  TARGET_SMOOTH_TIME: 0.28,
  ATMOS_SMOOTH_TIME: 0.8,
  // How far the gaze leans toward the focused waypoint (0..1). High enough
  // that the focused annotation's anchor is always framed on screen.
  HOVER_LOOK_BIAS: 0.62,
} as const;

