import type {
  BurstParticle,
  EnergyRing,
  NavigatorHoverState,
  Orbiter,
  TrailPoint,
  WarpParticle,
} from "./navigator-types";
import { WARP_VELOCITY_THRESHOLD } from "./navigator-types";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function initOrbiters(count: number): Orbiter[] {
  return Array.from({ length: count }, (_, i) => ({
    angle: (i / count) * Math.PI * 2,
    radius: 18 + (i % 3) * 4,
    speed: 0.012 + (i % 4) * 0.003,
    size: 2 + (i % 3) * 0.6,
  }));
}

export function spawnClickBurst(
  x: number,
  y: number,
  bursts: BurstParticle[],
  rings: EnergyRing[],
  cap: number,
  intensity: number
): void {
  const count = Math.max(4, Math.floor(14 * intensity));
  for (let i = 0; i < count; i++) {
    if (bursts.length >= cap) bursts.shift();
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const speed = (1.5 + Math.random() * 3) * (0.5 + intensity * 0.5);
    bursts.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 400 + Math.random() * 280,
      maxLife: 680,
      size: 1.2 + Math.random() * 2 * intensity,
    });
  }
  rings.push(
    { x, y, radius: 6, maxRadius: 52 * intensity, life: 580, maxLife: 580 },
    { x, y, radius: 4, maxRadius: 34 * intensity, life: 400, maxLife: 400 }
  );
}

export function spawnWarpParticles(
  x: number,
  y: number,
  vx: number,
  vy: number,
  particles: WarpParticle[],
  cap: number,
  intensity: number
): void {
  const spawn = Math.max(1, Math.floor(3 * intensity));
  for (let i = 0; i < spawn; i++) {
    if (particles.length >= cap) particles.shift();
    const spread = (Math.random() - 0.5) * 1.2;
    particles.push({
      x: x - vx * 8 + spread * 4,
      y: y - vy * 8 + spread * 4,
      vx: -vx * 0.35 + spread,
      vy: -vy * 0.35 + spread,
      life: 180 + Math.random() * 120,
      maxLife: 300,
      size: 1 + Math.random() * 2.5 * intensity,
    });
  }
}

interface DrawFrameArgs {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  now: number;
  cx: number;
  cy: number;
  hover: NavigatorHoverState;
  intensity: number;
  orbiters: Orbiter[];
  bursts: BurstParticle[];
  rings: EnergyRing[];
  trail: TrailPoint[];
  warpParticles: WarpParticle[];
  scanPhase: number;
  velocity: number;
}

export function drawNavigatorFrame(args: DrawFrameArgs): number {
  const {
    ctx,
    width,
    height,
    now,
    cx,
    cy,
    hover,
    intensity,
    orbiters,
    bursts,
    rings,
    trail,
    warpParticles,
    scanPhase,
    velocity,
  } = args;

  ctx.clearRect(0, 0, width, height);
  const t = now * 0.001;
  const scene = hover.scene;
  const orbitAlpha = 0.35 + intensity * 0.65;
  const warpActive = velocity > WARP_VELOCITY_THRESHOLD;

  if (hover.scanRect && (scene === "scan" || scene === "assistant")) {
    drawScanOverlay(ctx, hover.scanRect, scanPhase, intensity);
  }

  if (trail.length > 1 && warpActive) {
    drawWarpStreaks(ctx, trail, intensity, velocity);
  }

  const orbitPoints: { x: number; y: number }[] = [];
  const orbitCount = Math.max(3, Math.floor(orbiters.length * (0.3 + intensity * 0.7)));

  for (let i = 0; i < orbitCount; i++) {
    const o = orbiters[i];
    o.angle += o.speed * (scene === "marketing" ? 1.3 : 1) * (0.4 + intensity * 0.6);
    const r = o.radius * (scene === "assistant" ? 1.3 : 1) * (0.6 + intensity * 0.4);
    const ox = cx + Math.cos(o.angle + t * 0.3) * r;
    const oy = cy + Math.sin(o.angle + t * 0.3) * r;
    orbitPoints.push({ x: ox, y: oy });

    if (scene === "analytics" || scene === "scan") {
      const barH = (4 + Math.abs(Math.sin(o.angle * 2 + t * 2)) * 12) * intensity;
      const grad = ctx.createLinearGradient(ox, oy - barH, ox, oy);
      grad.addColorStop(0, `rgba(6, 182, 212, ${0.9 * orbitAlpha})`);
      grad.addColorStop(1, "rgba(124, 58, 237, 0.15)");
      ctx.fillStyle = grad;
      ctx.fillRect(ox - 1.5, oy - barH, 3, barH);
    } else {
      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.size * 2.5);
      grad.addColorStop(0, `rgba(196, 181, 253, ${0.95 * orbitAlpha})`);
      grad.addColorStop(0.5, `rgba(59, 130, 246, ${0.55 * orbitAlpha})`);
      grad.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ox, oy, o.size * (0.6 + intensity * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (scene === "marketing" && orbitPoints.length > 1 && intensity > 0.4) {
    ctx.strokeStyle = `rgba(124, 58, 237, ${0.3 * orbitAlpha})`;
    ctx.lineWidth = 0.7;
    for (let i = 0; i < orbitPoints.length; i++) {
      const a = orbitPoints[i];
      const b = orbitPoints[(i + 2) % orbitPoints.length];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  const dt = 16;

  for (let i = warpParticles.length - 1; i >= 0; i--) {
    const p = warpParticles[i];
    p.life -= dt;
    if (p.life <= 0) {
      warpParticles.splice(i, 1);
      continue;
    }
    p.x += p.vx;
    p.y += p.vy;
    const alpha = (p.life / p.maxLife) * 0.7 * intensity;
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
    grad.addColorStop(0, `rgba(6, 182, 212, ${alpha})`);
    grad.addColorStop(1, "rgba(124, 58, 237, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = bursts.length - 1; i >= 0; i--) {
    const p = bursts[i];
    p.life -= dt;
    if (p.life <= 0) {
      bursts.splice(i, 1);
      continue;
    }
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    const alpha = (p.life / p.maxLife) * 0.85;
    ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = rings.length - 1; i >= 0; i--) {
    const ring = rings[i];
    ring.life -= dt;
    if (ring.life <= 0) {
      rings.splice(i, 1);
      continue;
    }
    const progress = 1 - ring.life / ring.maxLife;
    ring.radius = lerp(6, ring.maxRadius, progress);
    const alpha = (1 - progress) * 0.65;
    ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  return (scanPhase + 0.012 * (0.4 + intensity * 0.6)) % 1;
}

function drawScanOverlay(
  ctx: CanvasRenderingContext2D,
  rect: DOMRect,
  phase: number,
  intensity: number
): void {
  const pad = 4;
  const x = rect.left - pad;
  const y = rect.top - pad;
  const w = rect.width + pad * 2;
  const h = rect.height + pad * 2;
  const alpha = 0.25 + intensity * 0.45;

  ctx.save();
  ctx.strokeStyle = `rgba(124, 58, 237, ${alpha * 0.6})`;
  ctx.lineWidth = 1;
  const corner = 10;
  ctx.beginPath();
  ctx.moveTo(x, y + corner);
  ctx.lineTo(x, y);
  ctx.lineTo(x + corner, y);
  ctx.moveTo(x + w - corner, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + corner);
  ctx.moveTo(x + w, y + h - corner);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w - corner, y + h);
  ctx.moveTo(x + corner, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + h - corner);
  ctx.stroke();

  const scanY = y + phase * h;
  const grad = ctx.createLinearGradient(x, scanY - 20, x, scanY + 20);
  grad.addColorStop(0, "rgba(6, 182, 212, 0)");
  grad.addColorStop(0.45, `rgba(6, 182, 212, ${alpha})`);
  grad.addColorStop(0.55, `rgba(124, 58, 237, ${alpha})`);
  grad.addColorStop(1, "rgba(124, 58, 237, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(x, scanY - 2, w, 4);

  ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 0.08})`;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function drawWarpStreaks(
  ctx: CanvasRenderingContext2D,
  trail: TrailPoint[],
  intensity: number,
  velocity: number
): void {
  const strength = Math.min(1, (velocity - WARP_VELOCITY_THRESHOLD) / 2) * intensity;
  if (strength <= 0) return;

  ctx.save();
  ctx.lineCap = "round";
  for (let i = 1; i < trail.length; i++) {
    const prev = trail[i - 1];
    const curr = trail[i];
    const progress = i / trail.length;
    const alpha = progress * 0.55 * strength;
    ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
    ctx.lineWidth = 1.5 + progress * 3 * strength;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.stroke();
  }
  ctx.restore();
}
