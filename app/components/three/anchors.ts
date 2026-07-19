import { experiences, portfolioItems } from "../../data/portfolio";
import { getProjectMarkers, SUMMIT_POINT } from "./camps";

// World anchors for the map-callout annotations. Each annotation in the DOM
// names an anchor; the in-canvas projector pins the element to the anchor's
// screen position every frame. This module must stay free of three imports —
// it is consumed by regular DOM components.

export type AnchorSide = "left" | "right";

export interface AnchorDef {
  id: string;
  // Camp whose hold window makes this anchor eligible to show.
  camp: number;
  position: [number, number, number];
  side: AnchorSide;
}

const legCount = experiences.length;

export function getSiteAnchors(): AnchorDef[] {
  return getProjectMarkers().map((marker, i) => ({
    id: `site-${marker.id}`,
    camp: 3,
    // Just above the lantern-cairn.
    position: [marker.position[0], marker.position[1] + 1.0, marker.position[2]],
    side: (i % 2 === 0 ? "right" : "left") as AnchorSide,
  }));
}

let anchorCache: AnchorDef[] | null = null;

export function getAnchors(): AnchorDef[] {
  if (anchorCache) return anchorCache;
  const summit = SUMMIT_POINT;
  anchorCache = [
    // Camps 01 and 02 have no DOM annotations: the manifest is painted onto
    // the notice board, and the route legs live on the switchback trail
    // with a persistent dock panel (see trail.ts / ExperienceSection).
    ...getSiteAnchors(),
    {
      // The end-of-journey shot always leaves the register left of center,
      // so its card opens rightward, statically (see AnchorProjector).
      id: "summit-register",
      camp: 4,
      position: [summit[0], summit[1] + 2.0, summit[2]],
      side: "right",
    },
  ];
  return anchorCache;
}

// --- Focus sequencing -------------------------------------------------------

export const activeLegIndex = (legProgress: number): number =>
  Math.min(legCount - 1, Math.max(0, Math.floor(legProgress * legCount)));

export const siteIdByProgress = (siteProgress: number): string => {
  const n = portfolioItems.length;
  const i = Math.min(n - 1, Math.max(0, Math.floor(siteProgress * n)));
  return portfolioItems[i].id;
};

export interface FocusState {
  campT: number;
  legProgress: number;
  siteProgress: number;
  hoverProjectId: string | null;
  modalProjectId: string | null;
}

// Exclusive windows: each scroll position belongs to exactly one camp, so
// two camps' callouts can never be eligible (and overlap) at the same time.
export const inCampWindow = (campT: number, camp: number): boolean =>
  Math.round(campT) === camp;

export const focusedSiteId = (s: FocusState): string =>
  s.hoverProjectId ?? s.modalProjectId ?? siteIdByProgress(s.siteProgress);

// Whether a given anchor's annotation should be visible right now.
export function isAnchorActive(def: AnchorDef, s: FocusState): boolean {
  if (!inCampWindow(s.campT, def.camp)) return false;
  if (def.id.startsWith("site-")) {
    // Site records appear only once the site sequence itself is running
    // (campT 2.70, matching AscentBackground's pixel span) — showing the
    // first record earlier just adds dead scroll before site 02 — and
    // stand down before the summit register takes the stage.
    if (Math.abs(s.campT - 3) > 0.3) return false;
    return def.id === `site-${focusedSiteId(s)}`;
  }
  return true;
}

// --- DOM element registry (written by Annotation, read by the projector) ----

export const anchorElements = new Map<string, HTMLElement>();

export function registerAnchorElement(id: string, el: HTMLElement | null): void {
  if (el) anchorElements.set(id, el);
  else anchorElements.delete(id);
}
