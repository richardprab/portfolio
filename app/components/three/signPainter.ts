import * as THREE from "three";
import { siOpenjdk, siScipy } from "simple-icons/icons";
import { SKILLS, SKILL_ITEM_COUNT, isSimpleIcon, type Skill } from "../../data/skills";

// Paints signage into canvas textures so text is physically part of the
// world: lit, fogged, grained and bloomed with everything else, visible from
// any distance — nothing fades in or out.

const INK = {
  bg: "#26324b",
  bgLow: "#1f2940",
  fg: "#eae4d6",
  secondary: "#9aa6bd",
  accent: "#f2a541",
  line: "rgba(234, 228, 214, 0.22)",
};

function fontStack(varName: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

async function makeCanvas(width: number, height: number) {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Fonts API unavailable: paint with fallbacks.
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, INK.bg);
  grad.addColorStop(1, INK.bgLow);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  return { canvas, ctx };
}

function toTexture(canvas: HTMLCanvasElement, anisotropy: number): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

// Uppercase mono with simulated tracking, like the .instrument class.
function drawInstrument(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  mono: string
) {
  ctx.fillStyle = color;
  ctx.font = `500 ${size}px ${mono}`;
  const tracking = size * 0.18;
  let cx = x;
  for (const ch of text.toUpperCase()) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + tracking;
  }
  return cx - tracking;
}

// Canvas-paintable glyphs for the skills whose DOM icons are React
// components (no path data reachable): simple-icons stand-ins where one
// exists, a monogram stamp tile otherwise.
const ICON_FALLBACKS: Record<string, { path: string } | { monogram: string }> = {
  Java: { path: siOpenjdk.path },
  Matplotlib: { path: siScipy.path },
  AWS: { monogram: "AW" },
  Azure: { monogram: "AZ" },
  Tableau: { monogram: "TB" },
};

// Brand colors that vanish on the dark board get lifted to paper.
function legibleHex(hex: string | undefined): string {
  if (!hex) return INK.fg;
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 60 ? INK.fg : `#${hex.replace("#", "")}`;
}

// One skill's mark: its brand glyph (24-unit simple-icons path scaled up)
// or a bordered monogram stamp. Returns the advance width.
function drawSkillIcon(
  ctx: CanvasRenderingContext2D,
  skill: Skill,
  x: number,
  y: number,
  size: number,
  mono: string
): number {
  const color = legibleHex(skill.color);
  const glyph = isSimpleIcon(skill.icon) ? { path: skill.icon.path } : ICON_FALLBACKS[skill.name];
  ctx.save();
  if (glyph && "path" in glyph) {
    ctx.translate(x, y - size + size * 0.12);
    ctx.scale(size / 24, size / 24);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.92;
    ctx.fill(new Path2D(glyph.path));
  } else {
    const top = y - size + size * 0.12;
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.92;
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 1.5, top + 1.5, size - 3, size - 3);
    ctx.fillStyle = color;
    ctx.font = `500 ${Math.round(size * 0.42)}px ${mono}`;
    const label = glyph && "monogram" in glyph ? glyph.monogram : skill.name.slice(0, 2).toUpperCase();
    const w = ctx.measureText(label).width;
    ctx.fillText(label, x + (size - w) / 2, top + size * 0.66);
  }
  ctx.restore();
  return size;
}

// The basecamp notice board's face: the gear manifest, painted on.
export async function paintBoardTexture(anisotropy: number): Promise<THREE.CanvasTexture> {
  const W = 2048;
  const H = 1300;
  const { canvas, ctx } = await makeCanvas(W, H);
  const mono = fontStack("--font-geist-mono", "monospace");
  const sans = fontStack("--font-geist-sans", "sans-serif");

  const margin = 128;
  ctx.textBaseline = "alphabetic";

  // Watermark: faint survey rings behind the content.
  ctx.save();
  ctx.strokeStyle = "rgba(234, 228, 214, 0.045)";
  ctx.lineWidth = 3;
  for (const radius of [140, 260, 400, 560]) {
    ctx.beginPath();
    ctx.ellipse(W - 320, H - 180, radius, radius * 0.62, -0.18, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Pushpins in the corners.
  ctx.fillStyle = INK.accent;
  for (const [px, py] of [
    [70, 70],
    [W - 70, 70],
    [70, H - 70],
    [W - 70, H - 70],
  ]) {
    ctx.beginPath();
    ctx.arc(px, py, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.arc(px + 2, py + 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK.accent;
  }

  // Title row.
  const titleEnd = drawInstrument(ctx, "Basecamp notices", margin, 204, 44, INK.accent, mono);
  drawInstrument(ctx, " — gear manifest", titleEnd, 204, 44, INK.secondary, mono);
  const itemsLabel = `${SKILL_ITEM_COUNT} items`;
  ctx.font = `500 44px ${mono}`;
  const itemsWidth = itemsLabel.length * (44 * 1.18 * 0.62);
  drawInstrument(ctx, itemsLabel, W - margin - itemsWidth, 204, 44, INK.secondary, mono);

  ctx.fillStyle = INK.line;
  ctx.fillRect(margin, 258, W - margin * 2, 3);

  // Categories in two columns, row-major like the DOM grid.
  const colWidth = (W - margin * 2 - 96) / 2;
  const colX = [margin, margin + colWidth + 96];
  const colY = [392, 392];

  SKILLS.forEach((category, i) => {
    const col = i % 2;
    let y = colY[col];
    const x = colX[col];

    const numEnd = drawInstrument(ctx, `0${i + 1}`, x, y, 38, INK.accent, mono);
    drawInstrument(ctx, ` / ${category.name}`, numEnd, y, 38, INK.secondary, mono);
    y += 34;
    ctx.fillStyle = INK.line;
    ctx.fillRect(x, y, colWidth, 3);
    y += 88;

    // Skills flow as icon+name chips, wrapping within the column.
    const nameSize = 46;
    const iconSize = 44;
    const iconGap = 16;
    const chipGap = 52;
    const lineHeight = 78;
    ctx.font = `400 ${nameSize}px ${sans}`;
    let cx = x;
    for (const skill of category.skills) {
      const nameWidth = ctx.measureText(skill.name).width;
      const chipWidth = iconSize + iconGap + nameWidth;
      if (cx > x && cx + chipWidth > x + colWidth) {
        cx = x;
        y += lineHeight;
      }
      drawSkillIcon(ctx, skill, cx, y, iconSize, mono);
      ctx.font = `400 ${nameSize}px ${sans}`;
      ctx.fillStyle = INK.fg;
      ctx.fillText(skill.name, cx + iconSize + iconGap, y);
      cx += chipWidth + chipGap;
    }

    colY[col] = y + lineHeight + 76;
  });

  // Column rule between the two manifests.
  ctx.fillStyle = "rgba(234, 228, 214, 0.1)";
  ctx.fillRect(W / 2 - 1, 330, 2, H - 480);

  // Surveyor's stamp: measure the tracked text EXACTLY, then set the
  // diamond clear of it — the old estimate under-measured and the diamond
  // landed on "2022".
  const stamp = "Surveyed — R.P. · Est. 2022";
  ctx.font = `500 26px ${mono}`;
  let stampWidth = 0;
  for (const ch of stamp.toUpperCase()) stampWidth += ctx.measureText(ch).width + 26 * 0.18;
  stampWidth -= 26 * 0.18;
  const stampStart = W - margin - stampWidth;
  drawInstrument(ctx, stamp, stampStart, H - 86, 26, INK.secondary, mono);
  ctx.save();
  ctx.translate(stampStart - 34, H - 96);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = INK.accent;
  ctx.fillRect(-8, -8, 16, 16);
  ctx.restore();

  return toTexture(canvas, anisotropy);
}

