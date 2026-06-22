export type NavigatorScene =
  | "default"
  | "assistant"
  | "scan"
  | "input"
  | "employee"
  | "marketing"
  | "analytics";

export interface NavigatorHoverState {
  scene: NavigatorScene;
  assistantLabel: string;
  scanInsight: string;
  scanRect: DOMRect | null;
  magneticRect: DOMRect | null;
}

export interface Orbiter {
  angle: number;
  radius: number;
  speed: number;
  size: number;
}

export interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface EnergyRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  t: number;
}

export interface WarpParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export const ORBIT_COUNT = 8;
export const LERP = 0.11;
export const LERP_FAST = 0.5;
export const MAGNET = 0.16;
export const BURST_CAP = 36;
export const TRAIL_MAX = 14;
export const WARP_PARTICLE_CAP = 28;
export const WARP_VELOCITY_THRESHOLD = 0.65;
export const DASHBOARD_INTENSITY = 0.3;
export const LANDING_INTENSITY = 1;
