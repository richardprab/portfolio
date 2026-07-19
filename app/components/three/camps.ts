import { portfolioItems } from "../../data/portfolio";
import { terrainHeight } from "./terrainField";
import { getProjectSpurs, switchbackCentroid, traverseMidpoint } from "./trail";

// Camp keyframes for the helical ascent. One camp per page section; the
// camera holds a camp's pose while its section is on screen and travels the
// arc between camps in the scroll gap that separates sections.

export const SECTION_IDS = ["home", "skills", "experience", "portfolio", "resume"] as const;

export interface Camp {
  sectionId: (typeof SECTION_IDS)[number];
  name: string;
  // Display altitude in metres for the HUD.
  elevation: number;
  // Helix parameters: camera sits at (radius, theta) with `clearance` of air
  // between it and the terrain underneath.
  theta: number;
  radius: number;
  clearance: number;
  // World point the camera gazes at while holding this camp.
  target: [number, number, number];
  fogDensity: number;
  // 0..1 amount of accent tint bled into the horizon (dawn / alpenglow).
  warmth: number;
}

// The basecamp notice board: camp 01 is a close-up of this sign, and the
// gear manifest is rendered as the board's face. The camera docks on the
// radial line through the board so it reads head-on.
const BOARD_THETA = -0.28;
const BOARD_RADIUS = 20.5;
const BOARD_CENTER_HEIGHT = 2.35;
const BOARD_CAMERA_DISTANCE = 6.8;

const boardX = BOARD_RADIUS * Math.cos(BOARD_THETA);
const boardZ = BOARD_RADIUS * Math.sin(BOARD_THETA);
const boardBaseY = terrainHeight(boardX, boardZ);

export const BOARD = {
  position: [boardX, boardBaseY, boardZ] as [number, number, number],
  center: [boardX, boardBaseY + BOARD_CENTER_HEIGHT, boardZ] as [number, number, number],
  // Panel front (+z) faces radially outward, straight at the docked camera.
  yaw: Math.atan2(Math.cos(BOARD_THETA), Math.sin(BOARD_THETA)),
};

const cam1Radius = BOARD_RADIUS + BOARD_CAMERA_DISTANCE;
const cam1X = cam1Radius * Math.cos(BOARD_THETA);
const cam1Z = cam1Radius * Math.sin(BOARD_THETA);
const cam1Clearance = boardBaseY + BOARD_CENTER_HEIGHT + 0.35 - terrainHeight(cam1X, cam1Z);

export const CAMPS: Camp[] = [
  {
    sectionId: "home",
    name: "Trailhead",
    elevation: 320,
    // The establishing postcard: floating above the apron with the cloud
    // sea below, the peak riding the upper third with night sky above it.
    theta: -1.62,
    radius: 44,
    clearance: 5.5,
    target: [0, 34, 0],
    fogDensity: 0.02,
    warmth: 0.5,
  },
  {
    // Docked in front of the notice board, reading it head-on.
    sectionId: "skills",
    name: "Basecamp",
    elevation: 880,
    theta: BOARD_THETA,
    radius: cam1Radius,
    clearance: cam1Clearance,
    target: BOARD.center,
    fogDensity: 0.01,
    warmth: 0.12,
  },
  {
    // Staged across the bowl from the switchback trail so every leg —
    // including the very first turn — is in frame on arrival; aimed at the
    // route itself, biased upward so the crest stays in shot.
    sectionId: "experience",
    name: "Switchback Ridge",
    elevation: 1450,
    theta: 0.25,
    radius: 26.5,
    // High enough that the flight in clears the field's sight lines with
    // no floor intervention even at brisk scroll speeds.
    clearance: 9.5,
    // Aimed low at the field itself: entering the camp reads as a pan DOWN
    // from the board to the trail's first turn.
    target: [
      switchbackCentroid()[0] * 0.8,
      switchbackCentroid()[1] + 2.5,
      switchbackCentroid()[2] * 0.8,
    ],
    fogDensity: 0.009,
    warmth: 0,
  },
  {
    // Below the traverse, looking UP the route: the beacons flank an
    // ascending line — everything still leads to the summit.
    sectionId: "portfolio",
    name: "High Camps",
    elevation: 1980,
    theta: 1.55,
    radius: 17,
    clearance: 4,
    target: [traverseMidpoint()[0], traverseMidpoint()[1] + 1.6, traverseMidpoint()[2]],
    fogDensity: 0.0065,
    warmth: 0.15,
  },
  {
    // The reveal: after the climb, the camera pulls back wide — the whole
    // lit route and the peak in one frame.
    sectionId: "resume",
    name: "Summit",
    elevation: 2400,
    // The crane shot: pull back AND rise clear ABOVE the peak, on the
    // route's bisecting azimuth (the road spans θ 0.2–3.25, mid ≈ 1.7), so
    // the camera looks DOWN the switchback face and the whole burning line
    // reads unbroken — from θ 2.3 at peak height it looked ACROSS the
    // field's crest and half the route hid behind it (see road-audit).
    // Also one seam fewer: the last site's orbit exits at θ ≈ 1.73.
    theta: 1.72,
    radius: 30,
    clearance: 56,
    target: [0, 31, 0],
    fogDensity: 0.004,
    warmth: 0.55,
  },
];

// The summit itself — register, flag and lamp live here, independent of
// where the camp-4 camera stands.
const SUMMIT_THETA = 3.4;
const SUMMIT_RADIUS = 4.5;
export const SUMMIT_POINT: [number, number, number] = [
  SUMMIT_RADIUS * Math.cos(SUMMIT_THETA),
  terrainHeight(SUMMIT_RADIUS * Math.cos(SUMMIT_THETA), SUMMIT_RADIUS * Math.sin(SUMMIT_THETA)),
  SUMMIT_RADIUS * Math.sin(SUMMIT_THETA),
];

export const SUMMIT_ELEVATION = CAMPS[CAMPS.length - 1].elevation;

export function getCampPosition(index: number): [number, number, number] {
  const c = CAMPS[index];
  const x = c.radius * Math.cos(c.theta);
  const z = c.radius * Math.sin(c.theta);
  return [x, terrainHeight(x, z) + c.clearance, z];
}

// Set dressing sits between the camera and the peak so each camp reads in
// the foreground of its held shot. Shared by the 3D props and the anchors.
export function dressingPosition(c: Camp): [number, number, number] {
  const theta = c.theta + 0.22;
  const radius = c.radius * 0.62;
  const x = radius * Math.cos(theta);
  const z = radius * Math.sin(theta);
  return [x, terrainHeight(x, z), z];
}

export const CHECKPOINT_PROJECT_ID = "canornot";

export interface ProjectMarker {
  id: string;
  title: string;
  position: [number, number, number];
  isCheckpoint: boolean;
}

// Project waypoints stand at the tips of the spurs branching off the main
// route's traverse — supplementary to the line, never on it.
let markerCache: ProjectMarker[] | null = null;

export function getProjectMarkers(): ProjectMarker[] {
  if (markerCache) return markerCache;
  const titleById = new Map(portfolioItems.map((p) => [p.id, p.title]));
  markerCache = getProjectSpurs().map((spur) => ({
    id: spur.id,
    title: titleById.get(spur.id) ?? spur.id,
    // Ground-truth placement: stand on the same surface that is rendered.
    position: [spur.tip[0], terrainHeight(spur.tip[0], spur.tip[2]), spur.tip[2]],
    isCheckpoint: spur.id === CHECKPOINT_PROJECT_ID,
  }));
  return markerCache;
}
