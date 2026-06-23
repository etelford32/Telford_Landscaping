"use client";

// Procedurally drawn leaf-card textures. Each returns an RGBA texture with a
// transparent background and the leaf shape baked in; the renderer uses it as an
// alpha-tested map on instanced quads (the classic "leaf card" technique). No
// external image assets, so nothing to fetch or bundle.

import * as THREE from "three";

export type LeafKind = "maple" | "boxwood";

const cache = new Map<LeafKind, THREE.Texture>();

export function getLeafTexture(kind: LeafKind): THREE.Texture {
  let tex = cache.get(kind);
  if (tex) return tex;
  tex = kind === "boxwood" ? drawBoxwoodLeaf() : drawMapleLeaf();
  cache.set(kind, tex);
  return tex;
}

function makeTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

// Serrated 5-lobe palmate maple leaf, blade pointing up (+Y in UV).
function drawMapleLeaf(): THREE.CanvasTexture {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const baseY = size * 0.97; // petiole base (bottom-center)
  const bladeY = size * 0.52; // blade center
  const lobes = [-1.32, -0.66, 0, 0.66, 1.32]; // radians from vertical
  const tipR = size * 0.45;
  const notchR = size * 0.17;

  // Build the palmate silhouette.
  ctx.beginPath();
  ctx.moveTo(cx, baseY);
  for (let i = 0; i < lobes.length; i++) {
    const a = lobes[i];
    const tipX = cx + Math.sin(a) * tipR;
    const tipY = bladeY - Math.cos(a) * tipR;
    // serrated shoulder into the lobe
    const shA = a - 0.18;
    const shX = cx + Math.sin(shA) * notchR * 1.6;
    const shY = bladeY - Math.cos(shA) * notchR * 1.6;
    ctx.quadraticCurveTo(shX, shY, tipX, tipY);
    if (i < lobes.length - 1) {
      const nA = (a + lobes[i + 1]) / 2;
      const nX = cx + Math.sin(nA) * notchR;
      const nY = bladeY - Math.cos(nA) * notchR;
      ctx.quadraticCurveTo(nX, nY, nX, nY);
    }
  }
  ctx.lineTo(cx, baseY);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, bladeY - tipR, 0, baseY);
  grad.addColorStop(0, "#7CB24A");
  grad.addColorStop(0.6, "#5E9636");
  grad.addColorStop(1, "#4C7E2C");
  ctx.fillStyle = grad;
  ctx.fill();

  // Petiole + central veins for a touch of structure.
  ctx.strokeStyle = "rgba(40,70,25,0.55)";
  ctx.lineWidth = 1.4;
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

// Small glossy ovate boxwood leaf.
function drawBoxwoodLeaf(): THREE.CanvasTexture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  ctx.beginPath();
  // teardrop: rounded base, pointed tip at top
  ctx.moveTo(cx, size * 0.06);
  ctx.bezierCurveTo(size * 0.92, size * 0.3, size * 0.78, size * 0.96, cx, size * 0.96);
  ctx.bezierCurveTo(size * 0.22, size * 0.96, size * 0.08, size * 0.3, cx, size * 0.06);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#3E7438");
  grad.addColorStop(1, "#27512A");
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = "rgba(20,45,20,0.5)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx, size * 0.12);
  ctx.lineTo(cx, size * 0.9);
  ctx.stroke();

  return makeTexture(c);
}
