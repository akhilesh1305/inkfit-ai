"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cursorError, cursorLog, cursorWarn } from "@/lib/cursor/cursor-debug";
import {
  disableCustomCursorClass,
  enableCustomCursorClass,
  isPrimaryTouchDevice,
  prefersReducedMotion,
} from "@/lib/cursor/cursor-env";
import "./cosmos-cursor.css";

export type CosmosScene =
  | "default"
  | "generate"
  | "analytics"
  | "marketing"
  | "employee"
  | "input"
  | "card";

interface Orbiter {
  angle: number;
  radius: number;
  speed: number;
  size: number;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface EnergyRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
}

type CursorMode = "pending" | "ready" | "fallback" | "touch";

const ORBIT_COUNT = 8;
const LERP = 0.11;
const LERP_FAST = 0.5;
const MAGNET = 0.16;
const BURST_CAP = 36;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function pickLabel(el: Element): string {
  const custom = el.getAttribute("data-ink-label");
  if (custom) return custom.slice(0, 16);
  const aria = el.getAttribute("aria-label");
  if (aria) return aria.slice(0, 16);
  const text = el.textContent?.trim();
  if (text) return text.slice(0, 16);
  return "Generate";
}

function isGenerateControl(el: Element): boolean {
  if (el.closest("[data-ink-generate]")) return true;
  if (el.closest(".btn-primary")) return true;
  const btn = el.closest("button, [role='button']");
  if (btn) {
    const t = btn.textContent?.toLowerCase() ?? "";
    return /generate|create|launch|start|run|publish|save/.test(t);
  }
  return false;
}

function pageScene(pathname: string): CosmosScene | null {
  if (pathname.includes("/dashboard/employee")) return "employee";
  if (pathname.includes("/dashboard/marketing-os")) return "marketing";
  if (pathname.includes("/dashboard/analytics") || pathname.includes("/dashboard/performance")) {
    return "analytics";
  }
  return null;
}

function resolveScene(target: Element | null, pathname: string): {
  scene: CosmosScene;
  label: string;
  magneticRect: DOMRect | null;
} {
  if (!target || target.closest(".cosmos-cursor-layer")) {
    return { scene: pageScene(pathname) ?? "default", label: "", magneticRect: null };
  }

  const inputEl = target.closest(
    "input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable=true]"
  );
  if (inputEl) return { scene: "input", label: "", magneticRect: null };

  const interactive = target.closest(
    'button, a[href], [role="button"], .btn-primary, .btn-secondary, .btn-ghost, [data-ink-button]'
  );
  if (interactive && !interactive.hasAttribute("disabled")) {
    if (isGenerateControl(interactive)) {
      return { scene: "generate", label: pickLabel(interactive), magneticRect: null };
    }
    return { scene: "generate", label: pickLabel(interactive), magneticRect: null };
  }

  const cardEl = target.closest(".card, .card-hover, .card-popular, [data-ink-magnetic]");
  if (cardEl) {
    return { scene: "card", label: "", magneticRect: cardEl.getBoundingClientRect() };
  }

  const ambient = pageScene(pathname);
  if (ambient) return { scene: ambient, label: "", magneticRect: null };

  return { scene: "default", label: "", magneticRect: null };
}

function initOrbiters(): Orbiter[] {
  return Array.from({ length: ORBIT_COUNT }, (_, i) => ({
    angle: (i / ORBIT_COUNT) * Math.PI * 2,
    radius: 18 + (i % 3) * 4,
    speed: 0.012 + (i % 4) * 0.003,
    size: 2 + (i % 3) * 0.6,
  }));
}

function orbScale(scene: CosmosScene, clicking: boolean): number {
  if (clicking) return scene === "generate" ? 1.2 : 0.88;
  switch (scene) {
    case "generate":
      return 1.65;
    case "employee":
      return 1.22;
    case "analytics":
      return 1.12;
    case "marketing":
      return 1.18;
    case "card":
      return 1.15;
    case "input":
      return 0.75;
    default:
      return 1;
  }
}

function activateFallback(reason: string): void {
  cursorError("Falling back to native cursor", { reason });
  disableCustomCursorClass();
  document.documentElement.classList.add("cosmos-cursor-fallback");
}

/** @deprecated Use InkCursor — same component, cosmos branding */
export function CosmosCursor() {
  return <InkCursor />;
}

export function InkCursor() {
  const [portalReady, setPortalReady] = useState(false);
  const [mode, setMode] = useState<CursorMode>("pending");
  const [engineReady, setEngineReady] = useState(false);
  const [scene, setScene] = useState<CosmosScene>("default");
  const [label, setLabel] = useState("");
  const [clicking, setClicking] = useState(false);
  const reducedMotion = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -100, y: -100, active: false });
  const posRef = useRef({ x: -100, y: -100 });
  const hoverRef = useRef({ scene: "default" as CosmosScene, label: "", magneticRect: null as DOMRect | null });
  const orbitersRef = useRef<Orbiter[]>(initOrbiters());
  const burstsRef = useRef<BurstParticle[]>([]);
  const ringsRef = useRef<EnergyRing[]>([]);
  const rafRef = useRef(0);
  const dprRef = useRef(1);
  const timeRef = useRef(0);
  const lastMoveRef = useRef(0);
  const reducedRef = useRef(false);
  const hasPositionedRef = useRef(false);
  const moveLogCountRef = useRef(0);

  useEffect(() => {
    setPortalReady(true);
    cursorLog("Component mounted (client)");
  }, []);

  useEffect(() => {
    if (isPrimaryTouchDevice()) {
      cursorLog("Primary touch device detected — using native cursor");
      setMode("touch");
      return;
    }
    cursorLog("Environment OK — rendering cursor layer");
    setMode("ready");
  }, []);

  useEffect(() => {
    if (mode !== "ready") return;

    setEngineReady(false);

    const root = rootRef.current;
    const canvas = canvasRef.current;

    if (!root || !canvas) {
      cursorWarn("Init aborted: DOM refs missing on ready pass");
      activateFallback("refs-missing");
      setMode("fallback");
      return;
    }

    reducedRef.current = reducedMotion ?? prefersReducedMotion();

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) {
      cursorWarn("Init aborted: canvas 2d context unavailable");
      activateFallback("canvas-context");
      setMode("fallback");
      return;
    }

    enableCustomCursorClass(reducedRef.current);
    root.style.opacity = "1";
    root.style.visibility = "visible";

    cursorLog("Cursor engine initialized", {
      reducedMotion: reducedRef.current,
      zIndex: getComputedStyle(root).zIndex,
    });

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

    const spawnBurst = (x: number, y: number) => {
      for (let i = 0; i < 14; i++) {
        if (burstsRef.current.length >= BURST_CAP) burstsRef.current.shift();
        const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
        const speed = 1.5 + Math.random() * 3;
        burstsRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 500 + Math.random() * 300,
          maxLife: 800,
          size: 1.5 + Math.random() * 2,
        });
      }
      ringsRef.current.push(
        { x, y, radius: 6, maxRadius: 48, life: 600, maxLife: 600 },
        { x, y, radius: 4, maxRadius: 32, life: 420, maxLife: 420 }
      );
    };

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
      lastMoveRef.current = performance.now();

      if (!hasPositionedRef.current) {
        posRef.current = { x: e.clientX, y: e.clientY };
        root.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        hasPositionedRef.current = true;
        cursorLog("First mouse position applied", { x: e.clientX, y: e.clientY });
      }

      if (moveLogCountRef.current < 3) {
        moveLogCountRef.current += 1;
        cursorLog("Mouse position update", { x: e.clientX, y: e.clientY, n: moveLogCountRef.current });
      }

      const resolved = resolveScene(
        document.elementFromPoint(e.clientX, e.clientY),
        window.location.pathname
      );
      hoverRef.current = resolved;
      setScene(resolved.scene);
      setLabel(resolved.label);
    };

    const onDown = (e: MouseEvent) => {
      setClicking(true);
      if (!reducedRef.current) spawnBurst(e.clientX, e.clientY);
    };

    const onUp = () => setClicking(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });

    const frame = (now: number) => {
      timeRef.current = now;
      const mouse = mouseRef.current;
      const pos = posRef.current;
      const hover = hoverRef.current;
      const lerpFactor = reducedRef.current ? LERP_FAST : LERP;

      let targetX = mouse.x;
      let targetY = mouse.y;

      if (hover.magneticRect && hover.scene === "card") {
        const r = hover.magneticRect;
        targetX = lerp(targetX, r.left + r.width / 2, MAGNET);
        targetY = lerp(targetY, r.top + r.height / 2, MAGNET);
      }

      const idleMs = now - lastMoveRef.current;
      const isIdle = idleMs > 1200;
      if (isIdle && !reducedRef.current && mouse.active) {
        targetY += Math.sin(now * 0.002) * 5;
        targetX += Math.cos(now * 0.0015) * 3;
      }

      pos.x = lerp(pos.x, targetX, lerpFactor);
      pos.y = lerp(pos.y, targetY, lerpFactor);

      if (mouse.active) {
        root.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }

      if (!reducedRef.current) {
        const w = canvas.width / dprRef.current;
        const h = canvas.height / dprRef.current;
        ctx.clearRect(0, 0, w, h);

        const cx = pos.x;
        const cy = pos.y;
        const currentScene = hover.scene;
        const orbiters = orbitersRef.current;
        const t = now * 0.001;

        const orbitPoints: { x: number; y: number }[] = [];

        for (const o of orbiters) {
          o.angle += o.speed * (currentScene === "marketing" ? 1.4 : 1);
          const r = o.radius * (currentScene === "generate" ? 1.35 : 1);
          const ox = cx + Math.cos(o.angle + t * 0.3) * r;
          const oy = cy + Math.sin(o.angle + t * 0.3) * r;
          orbitPoints.push({ x: ox, y: oy });

          if (currentScene === "analytics") {
            const barH = 6 + Math.abs(Math.sin(o.angle * 2 + t * 2)) * 14;
            const grad = ctx.createLinearGradient(ox, oy - barH, ox, oy);
            grad.addColorStop(0, "rgba(6, 182, 212, 0.9)");
            grad.addColorStop(1, "rgba(124, 58, 237, 0.2)");
            ctx.fillStyle = grad;
            ctx.fillRect(ox - 1.5, oy - barH, 3, barH);
          } else {
            const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.size * 2.5);
            grad.addColorStop(0, "rgba(196, 181, 253, 0.95)");
            grad.addColorStop(0.5, "rgba(59, 130, 246, 0.55)");
            grad.addColorStop(1, "rgba(6, 182, 212, 0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(ox, oy, o.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (currentScene === "marketing" && orbitPoints.length > 1) {
          ctx.strokeStyle = "rgba(124, 58, 237, 0.35)";
          ctx.lineWidth = 0.8;
          for (let i = 0; i < orbitPoints.length; i++) {
            const a = orbitPoints[i];
            const b = orbitPoints[(i + 2) % orbitPoints.length];
            const c = orbitPoints[(i + 4) % orbitPoints.length];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(c.x, c.y);
            ctx.stroke();
          }
          ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
          for (let i = 0; i < orbitPoints.length; i++) {
            const a = orbitPoints[i];
            const b = orbitPoints[(i + 3) % orbitPoints.length];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        const dt = 16;
        burstsRef.current = burstsRef.current.filter((p) => {
          p.life -= dt;
          if (p.life <= 0) return false;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy *= 0.96;
          const alpha = (p.life / p.maxLife) * 0.85;
          ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          return true;
        });

        ringsRef.current = ringsRef.current.filter((ring) => {
          ring.life -= dt;
          if (ring.life <= 0) return false;
          const progress = 1 - ring.life / ring.maxLife;
          ring.radius = lerp(6, ring.maxRadius, progress);
          const alpha = (1 - progress) * 0.6;
          ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
          ctx.stroke();
          return true;
        });
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    setEngineReady(true);
    cursorLog("Cursor rendered successfully", {
      orbVisible: getComputedStyle(root.querySelector(".cosmos-orb") ?? root).opacity,
    });

    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedRef.current = e.matches;
      document.documentElement.classList.toggle("cosmos-cursor-reduced", e.matches);
      cursorLog("prefers-reduced-motion changed", { reduced: e.matches });
    };
    motionMq.addEventListener("change", onMotionChange);

    return () => {
      cancelAnimationFrame(rafRef.current);
      disableCustomCursorClass();
      document.documentElement.classList.remove("cosmos-cursor-fallback");
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      motionMq.removeEventListener("change", onMotionChange);
      cursorLog("Cursor engine cleaned up");
    };
  }, [mode, reducedMotion]);

  if (!portalReady || mode === "touch" || mode === "fallback") {
    return null;
  }

  const scale = orbScale(scene, clicking);
  const showLabel = scene === "generate" && label.length > 0;
  const showAiIcon = scene === "employee";
  const glowStrong = scene === "generate" || scene === "employee";
  const motionReduced = Boolean(reducedMotion);

  const layer = (
    <div
      className="cosmos-cursor-layer"
      aria-hidden="true"
      data-cursor-mode={engineReady ? "active" : mode}
      data-cursor-scene={scene}
    >
      <canvas ref={canvasRef} className="cosmos-cursor-canvas" />
      <div ref={rootRef} className="cosmos-cursor-root">
        <div className="cosmos-cursor-body">
          <motion.div
            className="cosmos-orb-halo"
            initial={{ opacity: 0.85, scale: 1 }}
            animate={{
              opacity: glowStrong ? 1 : 0.85,
              scale: motionReduced ? 1 : glowStrong ? 1.35 : isIdlePulse(scene) ? [1, 1.08, 1] : 1,
            }}
            transition={{
              duration: scene === "employee" ? 2.2 : 0.45,
              repeat: motionReduced ? 0 : scene === "employee" || scene === "default" ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="cosmos-orb-ring"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: showLabel ? 1 : scene === "marketing" ? 0.5 : 0,
              scale: showLabel ? 1 : 0.7,
            }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="cosmos-orb"
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              scale: clicking ? scale * 0.92 : scale,
              opacity: 1,
              boxShadow: glowStrong
                ? "0 0 28px rgba(124,58,237,0.95), 0 0 56px rgba(59,130,246,0.55), 0 0 80px rgba(6,182,212,0.3)"
                : "0 0 16px rgba(124,58,237,0.7), 0 0 32px rgba(59,130,246,0.45), 0 0 48px rgba(6,182,212,0.2)",
            }}
            transition={{
              scale: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
              boxShadow: { duration: 0.4 },
            }}
          />
          {showLabel && (
            <motion.span
              className="cosmos-label"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {label}
            </motion.span>
          )}
          {showAiIcon && (
            <motion.div
              className="cosmos-ai-icon"
              initial={{ opacity: 1, scale: 1 }}
              animate={
                motionReduced
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 1, scale: [0.9, 1.05, 0.9] }
              }
              transition={{ duration: 2, repeat: motionReduced ? 0 : Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-3 w-3" strokeWidth={2.5} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(layer, document.body);
}

function isIdlePulse(scene: CosmosScene) {
  return scene === "default" || scene === "marketing" || scene === "analytics";
}
