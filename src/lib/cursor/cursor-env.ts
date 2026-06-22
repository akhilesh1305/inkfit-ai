/**
 * True only for primary touch/coarse-pointer devices (phones, tablets).
 * Does NOT disable on touchscreen laptops that also have a mouse.
 */
export function isPrimaryTouchDevice(): boolean {
  if (typeof window === "undefined") return false;

  const coarseHoverNone =
    window.matchMedia("(hover: none)").matches &&
    window.matchMedia("(pointer: coarse)").matches;

  return coarseHoverNone;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const CURSOR_HTML_CLASS = "cosmos-cursor-active";
export const CURSOR_REDUCED_CLASS = "cosmos-cursor-reduced";

export function enableCustomCursorClass(reduced = false): void {
  document.documentElement.classList.add(CURSOR_HTML_CLASS);
  if (reduced) {
    document.documentElement.classList.add(CURSOR_REDUCED_CLASS);
  }
}

export function disableCustomCursorClass(): void {
  document.documentElement.classList.remove(CURSOR_HTML_CLASS, CURSOR_REDUCED_CLASS);
}
