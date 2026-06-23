"use client";

// Procedurally drawn textures for the plant renderer. Leaf cards are baked as
// neutral shading masks (light body, darker veins, soft AO gradient) so the
// renderer can drive the actual leaf color per-instance — that's what lets the
// maple carry a green→amber→copper palette without a second texture. Also a
// grayscale bark bump for surface relief. No external image assets.

import * as THREE from "three";

export type LeafKind = "maple" | "boxwood";

const leafCache = new Map<LeafKind, THREE.Texture>();
let barkBump: THREE.Texture | null = null;

export function getLeafTexture(kind: LeafKind): THREE.Texture {
  let tex = leafCache.get(kind);
  if (tex) return tex;
  tex = kind === "boxwood" ? drawBoxwoodLeaf() : drawMapleLeaf();
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
