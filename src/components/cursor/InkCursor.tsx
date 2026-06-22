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
import {
  drawNavigatorFrame,
  initOrbiters,
  spawnClickBurst,
  spawnWarpParticles,
} from "@/lib/cursor/navigator-canvas";
import { isDashboardPath, orbScale, pageIntensity, resolveNavigatorHover } from "@/lib/cursor/navigator-resolve";
import type {
  BurstParticle,
  EnergyRing,
  NavigatorHoverState,
  NavigatorScene,
  TrailPoint,
  WarpParticle,
} from "@/lib/cursor/navigator-types";
import {
  BURST_CAP,
  LERP,
  LERP_FAST,
  MAGNET,
  ORBIT_COUNT,
  TRAIL_MAX,
  WARP_PARTICLE_CAP,
  WARP_VELOCITY_THRESHOLD,
} from "@/lib/cursor/navigator-types";
import "./cosmos-cursor.css";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function activateFallback(reason: string): void {
  cursorError("Falling back to native cursor", { reason });
  disableCustomCursorClass();
  document.documentElement.classList.add("cosmos-cursor-fallback");
}

/** @deprecated Use InkCursor — AI Navigator Cursor */
export function CosmosCursor() {
  return <InkCursor />;
}

export type CosmosScene = NavigatorScene;

export function InkCursor() {
  const [portalReady, setPortalReady] = useState(false);
  const [mode, setMode] = useState<"pending" | "ready" | "fallback" | "touch">("pending");
  const [engineReady, setEngineReady] = useState(false);
  const [scene, setScene] = useState<NavigatorScene>("default");
  const [assistantLabel, setAssistantLabel] = useState("");
  const [scanInsight, setScanInsight] = useState("");
  const [clicking, setClicking] = useState(false);
  const reducedMotion = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -100, y: -100, active: false });
  const posRef = useRef({ x: -100, y: -100 });
  const prevMouseRef = useRef({ x: -100, y: -100, t: 0 });
  const velocityRef = useRef(0);
  const hoverRef = useRef<NavigatorHoverState>({
    scene: "default",
    assistantLabel: "",
    scanInsight: "",
    scanRect: null,
    magneticRect: null,
  });
  const intensityRef = useRef(1);
  const orbitersRef = useRef(initOrbiters(ORBIT_COUNT));
  const burstsRef = useRef<BurstParticle[]>([]);
  const ringsRef = useRef<EnergyRing[]>([]);
  const trailRef = useRef<TrailPoint[]>([]);
  const warpRef = useRef<WarpParticle[]>([]);
  const scanPhaseRef = useRef(0);
  const rafRef = useRef(0);
  const dprRef = useRef(1);
  const lastMoveRef = useRef(0);
  const reducedRef = useRef(false);
  const hasPositionedRef = useRef(false);
  const moveLogCountRef = useRef(0);
  const warpClassRef = useRef(false);

  useEffect(() => {
    setPortalReady(true);
    cursorLog("AI Navigator mounted (client)");
  }, []);

  useEffect(() => {
    if (isPrimaryTouchDevice()) {
      cursorLog("Primary touch device — native cursor");
      setMode("touch");
      return;
    }
    cursorLog("AI Navigator ready — rendering layer");
    setMode("ready");
  }, []);

  useEffect(() => {
    if (mode !== "ready") return;

    setEngineReady(false);

    const root = rootRef.current;
    const canvas = canvasRef.current;

    if (!root || !canvas) {
      cursorWarn("Init aborted: DOM refs missing");
      activateFallback("refs-missing");
      setMode("fallback");
      return;
    }

    reducedRef.current = reducedMotion ?? prefersReducedMotion();
    enableCustomCursorClass(reducedRef.current);
    root.style.opacity = "1";
    root.style.visibility = "visible";

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) {
      cursorWarn("Init aborted: canvas context unavailable");
      activateFallback("canvas-context");
      setMode("fallback");
      return;
    }

    cursorLog("AI Navigator engine initialized", { reducedMotion: reducedRef.current });

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

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const prev = prevMouseRef.current;
      const dt = now - prev.t;

      if (dt > 0 && dt < 120) {
        const vx = (e.clientX - prev.x) / dt;
        const vy = (e.clientY - prev.y) / dt;
        velocityRef.current = Math.hypot(vx, vy);

        if (!reducedRef.current && velocityRef.current > WARP_VELOCITY_THRESHOLD) {
          spawnWarpParticles(
            e.clientX,
            e.clientY,
            vx,
            vy,
            warpRef.current,
            WARP_PARTICLE_CAP,
            intensityRef.current
          );
        }
      }

      prevMouseRef.current = { x: e.clientX, y: e.clientY, t: now };
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
      lastMoveRef.current = now;

      trailRef.current.push({ x: e.clientX, y: e.clientY, t: now });
      if (trailRef.current.length > TRAIL_MAX) trailRef.current.shift();

      if (!hasPositionedRef.current) {
        posRef.current = { x: e.clientX, y: e.clientY };
        root.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        hasPositionedRef.current = true;
        cursorLog("First mouse position applied", { x: e.clientX, y: e.clientY });
      }

      if (moveLogCountRef.current < 3) {
        moveLogCountRef.current += 1;
        cursorLog("Mouse position update", { x: e.clientX, y: e.clientY });
      }

      const pathname = window.location.pathname;
      intensityRef.current = pageIntensity(pathname);

      const resolved = resolveNavigatorHover(document.elementFromPoint(e.clientX, e.clientY), pathname);
      hoverRef.current = resolved;
      setScene(resolved.scene);
      setAssistantLabel(resolved.assistantLabel);
      setScanInsight(resolved.scanInsight);
    };

    const onDown = (e: MouseEvent) => {
      setClicking(true);
      if (!reducedRef.current) {
        spawnClickBurst(
          e.clientX,
          e.clientY,
          burstsRef.current,
          ringsRef.current,
          BURST_CAP,
          intensityRef.current
        );
      }
    };

    const onUp = () => setClicking(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });

    const frame = (now: number) => {
      const mouse = mouseRef.current;
      const pos = posRef.current;
      const hover = hoverRef.current;
      const lerpFactor = reducedRef.current ? LERP_FAST : LERP;
      const intensity = intensityRef.current;

      let targetX = mouse.x;
      let targetY = mouse.y;

      if (hover.magneticRect) {
        const r = hover.magneticRect;
        const magnet = MAGNET * (0.5 + intensity * 0.5);
        targetX = lerp(targetX, r.left + r.width / 2, magnet);
        targetY = lerp(targetY, r.top + r.height / 2, magnet);
      }

      const idleMs = now - lastMoveRef.current;
      if (idleMs > 1400 && !reducedRef.current && mouse.active && intensity > 0.5) {
        targetY += Math.sin(now * 0.002) * 4;
        targetX += Math.cos(now * 0.0015) * 2.5;
      }

      pos.x = lerp(pos.x, targetX, lerpFactor);
      pos.y = lerp(pos.y, targetY, lerpFactor);

      if (mouse.active) {
        root.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }

      const warpActive = velocityRef.current > WARP_VELOCITY_THRESHOLD;
      if (warpClassRef.current !== warpActive) {
        warpClassRef.current = warpActive;
        root.classList.toggle("navigator-warp", warpActive);
      }

      if (!reducedRef.current) {
        const w = canvas.width / dprRef.current;
        const h = canvas.height / dprRef.current;
        scanPhaseRef.current = drawNavigatorFrame({
          ctx,
          width: w,
          height: h,
          now,
          cx: pos.x,
          cy: pos.y,
          hover,
          intensity,
          orbiters: orbitersRef.current,
          bursts: burstsRef.current,
          rings: ringsRef.current,
          trail: trailRef.current,
          warpParticles: warpRef.current,
          scanPhase: scanPhaseRef.current,
          velocity: velocityRef.current,
        });
      } else {
        ctx.clearRect(0, 0, canvas.width / dprRef.current, canvas.height / dprRef.current);
      }

      velocityRef.current *= 0.92;
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    setEngineReady(true);
    cursorLog("AI Navigator rendered successfully");

    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedRef.current = e.matches;
      document.documentElement.classList.toggle("cosmos-cursor-reduced", e.matches);
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
      cursorLog("AI Navigator cleaned up");
    };
  }, [mode, reducedMotion]);

  if (!portalReady || mode === "touch" || mode === "fallback") {
    return null;
  }

  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "/";
  const isDashboard = isDashboardPath(pathname);
  const warpActive = false;
  const scale = orbScale(scene, clicking, warpActive);
  const showAssistant = assistantLabel.length > 0;
  const showScan = scanInsight.length > 0 && (scene === "scan" || scene === "analytics");
  const showAiIcon = scene === "employee";
  const glowStrong = showAssistant || scene === "employee" || scene === "scan";
  const motionReduced = Boolean(reducedMotion);

  const layer = (
    <div
      className="cosmos-cursor-layer navigator-cursor-layer"
      aria-hidden="true"
      data-cursor-mode={engineReady ? "active" : mode}
      data-cursor-scene={scene}
      data-cursor-zone={isDashboard ? "dashboard" : "landing"}
    >
      <canvas ref={canvasRef} className="cosmos-cursor-canvas navigator-canvas" />
      <div ref={rootRef} className="cosmos-cursor-root navigator-root">
        <div className="cosmos-cursor-body navigator-body">
          <motion.div
            className="cosmos-orb-halo navigator-orb-halo"
            initial={{ opacity: 0.88, scale: 1 }}
            animate={{
              opacity: glowStrong ? 1 : 0.88,
              scale: motionReduced ? 1 : glowStrong ? 1.38 : scene === "default" ? [1, 1.06, 1] : 1,
            }}
            transition={{
              duration: scene === "employee" ? 2.2 : 0.45,
              repeat: motionReduced ? 0 : scene === "employee" || scene === "default" ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="cosmos-orb-ring navigator-orb-ring"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: showAssistant || showScan ? 1 : scene === "marketing" ? 0.45 : 0,
              scale: showAssistant || showScan ? 1 : 0.72,
            }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="cosmos-orb navigator-orb"
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              scale: clicking ? scale * 0.92 : scale,
              opacity: 1,
              boxShadow: glowStrong
                ? "0 0 28px rgba(124,58,237,0.95), 0 0 56px rgba(59,130,246,0.55), 0 0 80px rgba(6,182,212,0.3)"
                : "0 0 18px rgba(124,58,237,0.75), 0 0 36px rgba(59,130,246,0.48), 0 0 52px rgba(6,182,212,0.22)",
            }}
            transition={{
              scale: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
              boxShadow: { duration: 0.38 },
            }}
          />
          {showAssistant && (
            <motion.span
              className="navigator-assistant-label"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              key={assistantLabel}
            >
              {assistantLabel}
            </motion.span>
          )}
          {showScan && (
            <motion.span
              className="navigator-scan-insight"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              key={scanInsight}
            >
              <span className="navigator-scan-dot" />
              {scanInsight}
            </motion.span>
          )}
          {showAiIcon && (
            <motion.div
              className="cosmos-ai-icon navigator-ai-icon"
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
