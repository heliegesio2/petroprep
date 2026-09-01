"use client";

import { useEffect, useRef } from "react";

/**
 * Constelação animada no hero (porta do canvas #hero-particles do
 * sitetocantins/index.html): pontos brancos flutuando, ligados por linhas
 * quando próximos, repelidos pelo cursor. Estático sob prefers-reduced-motion.
 */

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

const LINK_DIST = 130;
const REPEL = 150;
const MAX_SPEED = 0.28;
const MIN_SPEED = 0.06;

export function HeroParticles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduzir =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const mouse: { x: number | null; y: number | null } = { x: null, y: null };
    let particles: P[] = [];
    let raf = 0;

    const densidade = () => {
      const area = host.clientWidth * host.clientHeight;
      return Math.max(24, Math.min(80, Math.round(area / 15000)));
    };

    const resize = () => {
      canvas.width = host.clientWidth * DPR;
      canvas.height = host.clientHeight * DPR;
      canvas.style.width = `${host.clientWidth}px`;
      canvas.style.height = `${host.clientHeight}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const init = () => {
      const n = densidade();
      const w = host.clientWidth;
      const h = host.clientHeight;
      particles = Array.from({ length: n }, () => {
        const ang = Math.random() * Math.PI * 2;
        const spd = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          r: Math.random() * 1.4 + 1,
        };
      });
    };

    const frame = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < REPEL && d > 0.01) {
            const f = (1 - d / REPEL) * 0.9;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > MAX_SPEED) {
          p.vx = (p.vx / sp) * MAX_SPEED;
          p.vy = (p.vy / sp) * MAX_SPEED;
        } else if (sp < MIN_SPEED && sp > 0) {
          p.vx = (p.vx / sp) * MIN_SPEED;
          p.vy = (p.vy / sp) * MIN_SPEED;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            const t = 1 - d / LINK_DIST;
            ctx.strokeStyle = `rgba(255,255,255,${(0.12 + t * 0.4).toFixed(3)})`;
            ctx.lineWidth = 1 + t * 1.2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        if (mouse.x !== null && mouse.y !== null) {
          const md = Math.hypot(
            particles[i].x - mouse.x,
            particles[i].y - mouse.y,
          );
          if (md < REPEL * 1.35) {
            ctx.strokeStyle = `rgba(255,255,255,${(
              (1 - md / (REPEL * 1.35)) *
              0.5
            ).toFixed(3)})`;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduzir) raf = requestAnimationFrame(frame);
    };

    const aoMover = (e: MouseEvent) => {
      const rect = host.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const aoSair = () => {
      mouse.x = null;
      mouse.y = null;
    };
    const aoRedimensionar = () => {
      resize();
      init();
    };

    resize();
    init();
    frame();

    host.addEventListener("mousemove", aoMover);
    host.addEventListener("mouseleave", aoSair);
    window.addEventListener("resize", aoRedimensionar);

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("mousemove", aoMover);
      host.removeEventListener("mouseleave", aoSair);
      window.removeEventListener("resize", aoRedimensionar);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-60"
    />
  );
}
