"use client";

import type { ReactNode } from "react";
import { registerAnchorElement, type AnchorSide } from "./three/anchors";

interface AnnotationProps {
  anchorId: string;
  side: AnchorSide;
  // "top" hangs the card below the anchor — for callouts too tall to center.
  valign?: "center" | "top";
  children: ReactNode;
  className?: string;
}

// A survey callout. In anchored mode (html[data-anchored], set once the 3D
// world is live on a large screen) the projector pins it beside its world
// anchor — the card floats free, with no leader line or anchor dot (they
// read as artifacts over the world); otherwise it lays out in normal
// document flow — which is the mobile and no-WebGL presentation.
export const Annotation = ({ anchorId, side, valign = "center", children, className }: AnnotationProps) => {
  return (
    <div
      ref={(el) => registerAnchorElement(anchorId, el)}
      data-side={side}
      data-valign={valign}
      data-visible="1"
      className={`annotation ${className ?? ""}`}
    >
      <div className="annotation-inner">{children}</div>
    </div>
  );
};
