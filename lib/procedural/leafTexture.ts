"use client";

// Procedurally drawn textures for the plant renderer. Leaf cards are baked as
// neutral shading masks (light body, darker veins, soft AO gradient) so the
// renderer can drive the actual leaf color per-instance — that's what lets the
// maple carry a green→amber→copper palette without a second texture. Also a
// grayscale bark bump for surface relief. No external image assets.

import * as THREE from "three";

export type LeafKind =
  | "maple"
  | "boxwood"
  | "oak"
  | "oak-lobed"
  | "redwood"
  | "manzanita"
  | "redbud-flower"
  | "pine";

const leafCache = new Map<LeafKind, THREE.Texture>();
let barkBump: THREE.Texture | null = null;

export function getLeafTexture(kind: LeafKind): THREE.Texture {
  let tex = leafCache.get(kind);
  if (tex) return tex;
  if (kind === "boxwood") tex = drawBoxwoodLeaf();
  else if (kind === "oak") tex = drawOakLeaf();
  else if (kind === "oak-lobed") tex = drawOakLobedLeaf();
  else if (kind === "redwood") tex = drawRedwoodSpray();
  else if (kind === "manzanita") tex = drawManzanitaLeaf();
  else if (kind === "redbud-flower") tex = drawRedbudFlower();
  else if (kind === "pine") tex = drawPineTuft();
  else tex = drawMapleLeaf();
  leafCache.set(kind, tex);
  return tex;
}

export function getBarkBumpTexture(): THREE.Texture {
  if (barkBump) return barkBump;
  barkBump = drawBarkBump();
  return barkBump;
}

function makeTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

// Neutral shading mask so leaf color can be tinted per-instance.
// Body is light gray with a top→bottom AO gradient; veins are darker.
function drawMapleLeaf(): THREE.CanvasTexture {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const baseY = size * 0.97;
  const bladeY = size * 0.5;
  const lobes = [-1.35, -0.66, 0, 0.66, 1.35];
  const tipR = size * 0.46;
  const notchR = size * 0.16;

  ctx.beginPath();
  ctx.moveTo(cx, baseY);
  for (let i = 0; i < lobes.length; i++) {
    const a = lobes[i];
    const tipX = cx + Math.sin(a) * tipR;
    const tipY = bladeY - Math.cos(a) * tipR;
    const shA = a - 0.2;
    const shX = cx + Math.sin(shA) * notchR * 1.7;
    const shY = bladeY - Math.cos(shA) * notchR * 1.7;
    ctx.quadraticCurveTo(shX, shY, tipX, tipY);
    if (i < lobes.length - 1) {
      const nA = (a + lobes[i + 1]) / 2;
      const nX = cx + Math.sin(nA) * notchR;
      const nY = bladeY - Math.cos(nA) * notchR;
      ctx.lineTo(nX, nY);
    }
  }
  ctx.lineTo(cx, baseY);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, bladeY - tipR, 0, baseY);
  grad.addColorStop(0, "#dcdcdc");
  grad.addColorStop(0.55, "#c2c2c2");
  grad.addColorStop(1, "#9c9c9c");
  ctx.fillStyle = grad;
  ctx.fill();

  // Veins (slightly darker than the body).
  ctx.strokeStyle = "rgba(120,120,120,0.6)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(cx, baseY);
  ctx.lineTo(cx, bladeY);
  for (const a of lobes) {
    ctx.moveTo(cx, bladeY);
    ctx.lineTo(cx + Math.sin(a) * tipR * 0.85, bladeY - Math.cos(a) * tipR * 0.85);
  }
  ctx.stroke();

  return makeTexture(c);
}

function drawBoxwoodLeaf(): THREE.CanvasTexture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  ctx.beginPath();
  ctx.moveTo(cx, size * 0.05);
  ctx.bezierCurveTo(size * 0.94, size * 0.28, size * 0.8, size * 0.97, cx, size * 0.97);
  ctx.bezierCurveTo(size * 0.2, size * 0.97, size * 0.06, size * 0.28, cx, size * 0.05);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#d8d8d8");
  grad.addColorStop(1, "#9a9a9a");
  ctx.fillStyle = grad;
  ctx.fill();

  // Glossy highlight down one side + midrib.
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.12, size * 0.2);
  ctx.quadraticCurveTo(cx - size * 0.02, size * 0.55, cx - size * 0.06, size * 0.85);
  ctx.stroke();

  ctx.strokeStyle = "rgba(110,110,110,0.55)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(cx, size * 0.12);
  ctx.lineTo(cx, size * 0.9);
  ctx.stroke();

  return makeTexture(c);
}

// Small oblong, holly-like coast live oak leaf with a spiny-toothed margin.
// Neutral mask; color comes from the per-instance palette.
function drawOakLeaf(): THREE.CanvasTexture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const maxHalf = size * 0.24;
  const baseY = 0.95;
  const tipY = 0.06;
  const steps = 9;

  const halfWidth = (yy: number, i: number) => {
    const t = (baseY - yy) / (baseY - tipY); // 0 base → 1 tip
    const prof = Math.sin(Math.PI * Math.max(0, Math.min(1, t)));
    const tooth = (i % 2 === 0 ? 0.16 : 0) * maxHalf; // spiny margin
    return prof * maxHalf + tooth;
  };

  ctx.beginPath();
  ctx.moveTo(cx, size * baseY);
  for (let i = 0; i <= steps; i++) {
    const yy = baseY - (i / steps) * (baseY - tipY);
    ctx.lineTo(cx + halfWidth(yy, i), size * yy);
  }
  for (let i = steps; i >= 0; i--) {
    const yy = baseY - (i / steps) * (baseY - tipY);
    ctx.lineTo(cx - halfWidth(yy, i), size * yy);
  }
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#cfcfcf");
  grad.addColorStop(1, "#8f8f8f");
  ctx.fillStyle = grad;
  ctx.fill();

  // Glossy sheen down one side (these leaves are shiny above) + midrib.
  ctx.strokeStyle = "rgba(255,255,255,0.32)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.08, size * 0.22);
  ctx.quadraticCurveTo(cx - size * 0.02, size * 0.55, cx - size * 0.05, size * 0.82);
  ctx.stroke();

  ctx.strokeStyle = "rgba(95,95,95,0.6)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(cx, size * 0.92);
  ctx.lineTo(cx, size * 0.1);
  ctx.stroke();

  return makeTexture(c);
}

// Small, smooth, leathery ovate manzanita leaf with a pointed tip and a glossy
// sheen. Neutral mask; color comes from the palette.
function drawManzanitaLeaf(): THREE.CanvasTexture {
  const w = 56;
  const h = 88;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  ctx.beginPath();
  ctx.moveTo(cx, h * 0.04); // pointed tip
  ctx.bezierCurveTo(w * 0.96, h * 0.32, w * 0.86, h * 0.92, cx, h * 0.96);
  ctx.bezierCurveTo(w * 0.14, h * 0.92, w * 0.04, h * 0.32, cx, h * 0.04);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#cccccc");
  grad.addColorStop(1, "#9a9a9a");
  ctx.fillStyle = grad;
  ctx.fill();

  // glossy highlight + midrib
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.1, h * 0.2);
  ctx.quadraticCurveTo(cx - w * 0.02, h * 0.5, cx - w * 0.05, h * 0.8);
  ctx.stroke();

  ctx.strokeStyle = "rgba(105,105,105,0.55)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(cx, h * 0.1);
  ctx.lineTo(cx, h * 0.9);
  ctx.stroke();

  return makeTexture(c);
}

// Classic lobed deciduous-oak leaf (valley / blue oak): an oblong blade with
// rounded lobes and sinuses. Neutral mask; color comes from the palette.
function drawOakLobedLeaf(): THREE.CanvasTexture {
  const w = 72;
  const h = 96;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const baseY = h * 0.97;
  const tipY = h * 0.05;
  const lobes = 5;
  const maxHW = w * 0.42;
  const N = 48;

  const right: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const v = i / N; // 0 base -> 1 tip
    const y = baseY - v * (baseY - tipY);
    const prof = Math.pow(Math.sin(Math.PI * Math.min(0.999, Math.max(0.001, v))), 0.55);
    const lobe = 0.45 + 0.55 * Math.abs(Math.cos(v * lobes * Math.PI));
    right.push([cx + maxHW * prof * lobe, y]);
  }

  ctx.beginPath();
  ctx.moveTo(cx, baseY);
  for (const [x, y] of right) ctx.lineTo(x, y);
  for (let i = right.length - 1; i >= 0; i--) {
    const [x, y] = right[i];
    ctx.lineTo(cx - (x - cx), y);
  }
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, tipY, 0, baseY);
  grad.addColorStop(0, "#d4d4d4");
  grad.addColorStop(1, "#9c9c9c");
  ctx.fillStyle = grad;
  ctx.fill();

  // midrib + a few lateral veins toward the lobes
  ctx.strokeStyle = "rgba(110,110,110,0.55)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(cx, baseY);
  ctx.lineTo(cx, tipY);
  for (let k = 1; k <= lobes; k++) {
    const v = (k - 0.5) / lobes;
    const y = baseY - v * (baseY - tipY);
    const prof = Math.pow(Math.sin(Math.PI * v), 0.55);
    const hw = maxHW * prof * 0.85;
    ctx.moveTo(cx, y);
    ctx.lineTo(cx + hw, y - hw * 0.3);
    ctx.moveTo(cx, y);
    ctx.lineTo(cx - hw, y - hw * 0.3);
  }
  ctx.stroke();

  return makeTexture(c);
}

// Flat needle spray (the coast redwood's "green feather"): a central rachis
// with needles angled toward the tip, longest at the base. Neutral mask; color
// comes from the per-instance palette. Tall card — its length runs up +Y.
function drawRedwoodSpray(): THREE.CanvasTexture {
  const w = 48;
  const h = 96;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const baseY = h * 0.96;
  const tipY = h * 0.06;

  ctx.lineCap = "round";
  // rachis
  ctx.strokeStyle = "#b0b0b0";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx, baseY);
  ctx.lineTo(cx, tipY);
  ctx.stroke();

  // needles, angled toward the tip, fanning shorter as they climb
  ctx.strokeStyle = "#9c9c9c";
  ctx.lineWidth = 2.3;
  const pairs = 13;
  for (let i = 0; i < pairs; i++) {
    const t = i / (pairs - 1);
    const y = baseY - t * (baseY - tipY);
    const nlen = w * 0.42 * (1 - t * 0.78);
    const dy = -nlen * 0.55;
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(cx + nlen, y + dy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(cx - nlen, y + dy);
    ctx.stroke();
  }

  return makeTexture(c);
}

// A tuft of long pine needles fanning from the branch tip (Monterey pine bears
// needles in dense tufts at the ends of the shoots). Neutral mask; color from
// the palette. Tall card — its length runs up +Y.
function drawPineTuft(): THREE.CanvasTexture {
  const w = 56;
  const h = 96;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const baseY = h * 0.97;
  ctx.strokeStyle = "#9c9c9c";
  ctx.lineWidth = 1.7;
  ctx.lineCap = "round";

  const needles = 13;
  for (let i = 0; i < needles; i++) {
    const t = i / (needles - 1);
    const ang = (t - 0.5) * 1.15; // fan
    const len = h * 0.86 * (0.78 + 0.22 * Math.cos(ang)); // longest in the center
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.lineTo(cx + Math.sin(ang) * len, baseY - Math.cos(ang) * len);
    ctx.stroke();
  }

  return makeTexture(c);
}

// A small cluster of redbud blossoms (pea-flowers) for the cauliflorous bloom.
// Neutral mask; the magenta comes from the palette.
function drawRedbudFlower(): THREE.CanvasTexture {
  const size = 48;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size * 0.55;
  const blossoms: [number, number, number][] = [
    [cx, cy, 9],
    [cx - 9, cy + 3, 7],
    [cx + 9, cy + 2, 7],
    [cx - 4, cy - 7, 6.5],
    [cx + 5, cy - 6, 6.5],
    [cx, cy + 9, 6],
  ];
  for (const [x, y, r] of blossoms) {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r);
    g.addColorStop(0, "#e8e8e8");
    g.addColorStop(1, "#b4b4b4");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return makeTexture(c);
}

// Grayscale vertical-streak bump for bark relief.
function drawBarkBump(): THREE.Texture {
  const w = 64;
  const h = 128;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, w, h);

  // Vertical ridges with a little jitter.
  for (let x = 0; x < w; x += 2) {
    const base = 90 + Math.sin(x * 0.7) * 30 + Math.random() * 40;
    const v = Math.max(40, Math.min(220, base));
    ctx.strokeStyle = `rgb(${v},${v},${v})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    let y = 0;
    let xo = x + (Math.random() - 0.5);
    while (y < h) {
      const ny = y + 6 + Math.random() * 8;
      xo += (Math.random() - 0.5) * 1.5;
      ctx.moveTo(xo, y);
      ctx.lineTo(xo, ny);
      y = ny;
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.needsUpdate = true;
  return tex;
}
