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

