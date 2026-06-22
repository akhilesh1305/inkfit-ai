"use client";

import { useEffect, useRef, useState } from "react";
import "./ink-cursor.css";

type CursorMode = "default" | "button" | "card" | "input";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
}

const PARTICLE_CAP = 48;
const TRAIL_LIFE_MS = 1000;
const LERP = 0.14;
const LERP_REDUCED = 0.55;
const MAGNET_STRENGTH = 0.18;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pickLabel(el: Element): string {
  const ink = el.getAttribute("data-ink-label");
  if (ink) return ink.slice(0, 14);
  const aria = el.getAttribute("aria-label");
  if (aria) return aria.slice(0, 14);
  const title = el.getAttribute("title");
  if (title) return title.slice(0, 14);
  const text = el.textContent?.trim();
  if (text) return text.slice(0, 14);
  return "Go";
}

function resolveHover(target: Element | null): {
  mode: CursorMode;
  label: string;
  magneticRect: DOMRect | null;
} {
  if (!target || target.closest(".ink-cursor-layer")) {
    return { mode: "default", label: "", magneticRect: null };
  }

  const inputEl = target.closest(
    "input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable=true]"
  );
  if (inputEl) {
    return { mode: "input", label: "", magneticRect: null };
  }

  const buttonEl = target.closest(
    'button, a[href], [role="button"], .btn-primary, .btn-secondary, .btn-ghost, [data-ink-button]'
  );
  if (buttonEl && !buttonEl.hasAttribute("disabled")) {
    return { mode: "button", label: pickLabel(buttonEl), magneticRect: null };
  }

  const cardEl = target.closest(".card, .card-hover, .card-popular, [data-ink-magnetic]");
  if (cardEl) {
    return {
      mode: "card",
      label: "",
      magneticRect: cardEl.getBoundingClientRect(),
    };
  }

  return { mode: "default", label: "", magneticRect: null };
}

export function InkCursor() {
  const [active, setActive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedRef = useRef(false);

  const mouseRef = useRef({ x: -100, y: -100, active: false });
  const posRef = useRef({ x: -100, y: -100 });
  const velRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef<{
    mode: CursorMode;
    label: string;
    magneticRect: DOMRect | null;
  }>({ mode: "default", label: "", magneticRect: null });
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef(0);
  const dprRef = useRef(1);

  useEffect(() => {
    if (isTouchDevice()) return;

    reducedRef.current = prefersReducedMotion();
    setActive(true);

    document.documentElement.classList.add("ink-cursor-active");
    if (reducedRef.current) {
      document.documentElement.classList.add("ink-cursor-reduced");
    }

    const canvas = canvasRef.current;
    const root = rootRef.current;
    const body = bodyRef.current;
    if (!canvas || !root || !body) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const resize = () => {
      dprRef.current = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dprRef.current);
      canvas.height = Math.floor(h * dprRef.current);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const spawnParticle = (x: number, y: number, burst = false) => {
      const pool = particlesRef.current;
      if (pool.length >= PARTICLE_CAP) pool.shift();

      const angle = Math.random() * Math.PI * 2;
      const speed = burst ? 1.2 + Math.random() * 2.4 : 0.15 + Math.random() * 0.45;
      const maxLife = burst ? 420 + Math.random() * 280 : TRAIL_LIFE_MS * (0.6 + Math.random() * 0.4);

      pool.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: maxLife,
        maxLife,
        size: burst ? 2 + Math.random() * 2.5 : 1 + Math.random() * 1.8,
      });
    };

    const spawnRipple = (x: number, y: number) => {
      ripplesRef.current.push({
        x,
        y,
        radius: 4,
        maxRadius: 36 + Math.random() * 14,
        life: 520,
        maxLife: 520,
      });
      if (!reducedRef.current) {
        for (let i = 0; i < 10; i++) spawnParticle(x, y, true);
      }
    };

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };

      const hover = resolveHover(document.elementFromPoint(e.clientX, e.clientY));
      hoverRef.current = hover;

      root.dataset.mode = hover.mode;
      if (labelRef.current) {
        labelRef.current.textContent = hover.label;
      }

      if (!reducedRef.current && Math.random() > 0.5) {
        spawnParticle(e.clientX, e.clientY);
      }
    };

    const onLeave = () => {
      mouseRef.current.active = false;
      root.style.opacity = "0";
    };

    const onEnter = () => {
      root.style.opacity = "1";
    };

    const onDown = (e: MouseEvent) => {
      root.dataset.clicking = "true";
      spawnRipple(e.clientX, e.clientY);
    };

    const onUp = () => {
      root.dataset.clicking = "false";
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mousedown", onDown, { passive: true });
    document.addEventListener("mouseup", onUp, { passive: true });

    let lastTrail = 0;
    const frame = (now: number) => {
      const mouse = mouseRef.current;
      const pos = posRef.current;
      const vel = velRef.current;
      const hover = hoverRef.current;
      const lerpFactor = reducedRef.current ? LERP_REDUCED : LERP;

      let targetX = mouse.x;
      let targetY = mouse.y;

      if (hover.magneticRect && hover.mode === "card") {
        const rect = hover.magneticRect;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        targetX = lerp(targetX, cx, MAGNET_STRENGTH);
        targetY = lerp(targetY, cy, MAGNET_STRENGTH);
      }

      const prevX = pos.x;
      const prevY = pos.y;
      pos.x = lerp(pos.x, targetX, lerpFactor);
      pos.y = lerp(pos.y, targetY, lerpFactor);

      vel.x = pos.x - prevX;
      vel.y = pos.y - prevY;
      const speed = Math.hypot(vel.x, vel.y);

      const stretch = reducedRef.current ? 1 : clamp(1 + speed * 0.055, 1, 1.45);
      const squash = reducedRef.current ? 1 : clamp(1 - speed * 0.028, 0.78, 1);
      const angle = Math.atan2(vel.y, vel.x) * (180 / Math.PI);

      if (mouse.active) {
        root.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        if (hover.mode === "default") {
          body.style.transform = `translate(-50%, -50%) rotate(${angle - 45}deg) scale(${stretch}, ${squash})`;
        } else {
          body.style.transform = "translate(-50%, -50%)";
        }
      }

      if (!reducedRef.current) {
        const w = canvas.width / dprRef.current;
        const h = canvas.height / dprRef.current;
        ctx.clearRect(0, 0, w, h);

        const dt = 16;
        particlesRef.current = particlesRef.current.filter((p) => {
          p.life -= dt;
          if (p.life <= 0) return false;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.02;
          const t = p.life / p.maxLife;
          const alpha = t * t * 0.85;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          grad.addColorStop(0, `rgba(167, 139, 250, ${alpha})`);
          grad.addColorStop(0.5, `rgba(59, 130, 246, ${alpha * 0.6})`);
          grad.addColorStop(1, "rgba(6, 182, 212, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          return true;
        });

        ripplesRef.current = ripplesRef.current.filter((r) => {
          r.life -= dt;
          if (r.life <= 0) return false;
          const t = 1 - r.life / r.maxLife;
          r.radius = lerp(4, r.maxRadius, t);
          const alpha = (1 - t) * 0.55;
          ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.stroke();
          return true;
        });

        if (now - lastTrail > 48 && mouse.active) {
          spawnParticle(pos.x, pos.y);
          lastTrail = now;
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedRef.current = e.matches;
      document.documentElement.classList.toggle("ink-cursor-reduced", e.matches);
      if (e.matches) particlesRef.current = [];
    };
    motionMq.addEventListener("change", onMotionChange);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.documentElement.classList.remove("ink-cursor-active", "ink-cursor-reduced");
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      motionMq.removeEventListener("change", onMotionChange);
    };
  }, []);

  if (!active) return null;

  return (
    <div className="ink-cursor-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="ink-cursor-canvas" />
      <div
        ref={rootRef}
        className="ink-cursor-root"
        data-mode="default"
        data-clicking="false"
      >
        <div ref={bodyRef} className="ink-cursor-body">
          <div className="ink-cursor-glow" />
          <div className="ink-cursor-ring" />
          <span ref={labelRef} className="ink-cursor-label" />
          <div className="ink-cursor-droplet" />
        </div>
      </div>
    </div>
  );
}
