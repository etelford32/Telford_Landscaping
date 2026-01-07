"use client";

import { useEffect, useRef } from "react";

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Placeholder animation - you can customize this later
    // Simple gradient animation as a starting point
    let animationFrameId: number;
    let offset = 0;

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Create animated gradient background
      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, `rgba(22, 163, 74, ${0.1 + Math.sin(offset) * 0.05})`);
      gradient.addColorStop(0.5, `rgba(21, 128, 61, ${0.15 + Math.cos(offset) * 0.05})`);
      gradient.addColorStop(1, `rgba(134, 103, 68, ${0.1 + Math.sin(offset + 1) * 0.05})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw subtle floating particles (leaves/nature theme)
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      for (let i = 0; i < 20; i++) {
        const x = (i * 73 + offset * 20) % rect.width;
        const y = ((i * 47 + offset * 15) % rect.height);
        const size = 2 + Math.sin(offset + i) * 1;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      offset += 0.01;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}
