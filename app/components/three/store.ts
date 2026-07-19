import { create } from "zustand";

// Bridge between the DOM (scroll, theme, hover) and the R3F canvas.
// This module must stay free of three.js imports: it is also consumed by
// regular DOM components (sections, AltitudeHUD) in the main bundle.

export interface AscentPalette {
  sky: string;
  horizon: string;
  fog: string;
  terrain: string;
  line: string;
  // Camp props (signposts, cairns, huts): lighter than contour lines so they
  // stay behind the page's heavy display text instead of competing with it.
  structure: string;
  accent: string;
  starOpacity: number;
}

// The expedition lives in a permanent alpine dusk: indigo-slate air, warm
// lamp amber, luminous contour lines, first stars out. One fixed palette —
// there is no day/night mode.
export const ASCENT_PALETTE: AscentPalette = {
  sky: "#0d1322",
  horizon: "#3a2f42",
  fog: "#16202f",
  terrain: "#1c2536",
  line: "#93a1bd",
  structure: "#55627e",
  accent: "#f2a541",
  starOpacity: 0.7,
};

export const DEFAULT_PALETTE = ASCENT_PALETTE;

interface AscentState {
  // Continuous camp index (0..CAMPS.length-1) derived from page scroll.
  campT: number;
  // 0..1 progress through the experience / portfolio sections; sequences
  // which route leg / surveyed site is in focus while the camera holds camp.
  legProgress: number;
  siteProgress: number;
  hoverProjectId: string | null;
  modalProjectId: string | null;
  palette: AscentPalette;
  reducedMotion: boolean;
  // True once the WebGL canvas has produced its first frame.
  ready: boolean;
  // True while annotations are pinned to the world (canvas live, large
  // viewport) — DOM that yields to in-world signage keys off this.
  anchored: boolean;
  // True when WebGL is unavailable or the context was lost; CSS blobs take over.
  fallback: boolean;
  // Display values written by the camera rig for the altitude HUD.
  hudElevation: number;
  hudCamp: string;
}

export const useAscentStore = create<AscentState>(() => ({
  campT: 0,
  legProgress: 0,
  siteProgress: 0,
  hoverProjectId: null,
  modalProjectId: null,
  palette: DEFAULT_PALETTE,
  reducedMotion: false,
  ready: false,
  anchored: false,
  fallback: false,
  hudElevation: 0,
  hudCamp: "",
}));
