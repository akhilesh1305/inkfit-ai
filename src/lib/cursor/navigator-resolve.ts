import type { NavigatorHoverState, NavigatorScene } from "./navigator-types";
import { DASHBOARD_INTENSITY, LANDING_INTENSITY } from "./navigator-types";

const SCAN_INSIGHTS = [
  "Trending up",
  "+12% this week",
  "Peak engagement",
  "Strong signal",
  "AI analyzing…",
  "Opportunity found",
  "Above benchmark",
];

const ASSISTANT_LABELS = {
  generate: "Ready",
  analytics: "Insights",
  marketing: "Strategy",
  publish: "Publish",
  employee: "Assist",
} as const;

function hashInsight(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return SCAN_INSIGHTS[Math.abs(h) % SCAN_INSIGHTS.length];
}

export function pageIntensity(pathname: string): number {
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    return DASHBOARD_INTENSITY;
  }
  return LANDING_INTENSITY;
}

export function isDashboardPath(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
}

function ambientScene(pathname: string): NavigatorScene | null {
  if (pathname.includes("/dashboard/employee")) return "employee";
  if (pathname.includes("/dashboard/marketing-os")) return "marketing";
  if (
    pathname.includes("/dashboard/analytics") ||
    pathname.includes("/dashboard/performance")
  ) {
    return "analytics";
  }
  return null;
}

function isGenerateControl(el: Element): boolean {
  if (el.closest("[data-ink-generate]")) return true;
  if (el.closest(".btn-primary")) return true;
  const btn = el.closest("button, [role='button']");
  if (btn) {
    const t = btn.textContent?.toLowerCase() ?? "";
    return /generate|create|launch|start|run|save/.test(t);
  }
  return false;
}

function isPublishControl(el: Element, pathname: string): boolean {
  if (pathname.includes("/publish")) return true;
  if (el.closest('[href*="/publish"], [data-ink-publish]')) return true;
  const btn = el.closest("button, a[href], [role='button']");
  if (btn) {
    const t = (btn.textContent?.toLowerCase() ?? "") + (btn.getAttribute("href") ?? "");
    return /publish|post|share|schedule/.test(t);
  }
  return false;
}

function isAnalyticsContext(el: Element, pathname: string): boolean {
  if (pathname.includes("/analytics") || pathname.includes("/performance")) return true;
  if (el.closest("[data-ink-analytics], [data-chart], .recharts-wrapper")) return true;
  return false;
}

function isMarketingContext(el: Element, pathname: string): boolean {
  if (pathname.includes("/marketing-os") || pathname.includes("/marketing-strategy")) return true;
  if (el.closest('[href*="/marketing-os"], [data-ink-marketing]')) return true;
  return false;
}

function resolveAssistantLabel(el: Element, pathname: string): string {
  const custom = el.getAttribute("data-ink-label");
  if (custom) return custom.slice(0, 18);

  if (isPublishControl(el, pathname)) return ASSISTANT_LABELS.publish;
  if (isAnalyticsContext(el, pathname)) return ASSISTANT_LABELS.analytics;
  if (isMarketingContext(el, pathname)) return ASSISTANT_LABELS.marketing;
  if (isGenerateControl(el)) return ASSISTANT_LABELS.generate;
  if (pathname.includes("/dashboard/employee")) return ASSISTANT_LABELS.employee;

  const aria = el.getAttribute("aria-label");
  if (aria) return aria.slice(0, 18);

  const text = el.textContent?.trim();
  if (text && text.length <= 18) return text;

  return "";
}

function isScanTarget(el: Element, pathname: string): Element | null {
  const scanAttr = el.closest("[data-ink-scan]");
  if (scanAttr) return scanAttr;

  if (!isDashboardPath(pathname)) return null;

  return el.closest(
    ".card, .card-hover, .card-popular, [data-chart], .recharts-wrapper, [data-ink-magnetic]"
  );
}

export function resolveNavigatorHover(
  target: Element | null,
  pathname: string
): NavigatorHoverState {
  const empty: NavigatorHoverState = {
    scene: ambientScene(pathname) ?? "default",
    assistantLabel: "",
    scanInsight: "",
    scanRect: null,
    magneticRect: null,
  };

  if (!target || target.closest(".cosmos-cursor-layer, .navigator-cursor-layer")) {
    return empty;
  }

  const inputEl = target.closest(
    "input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable=true]"
  );
  if (inputEl) {
    return { ...empty, scene: "input" };
  }

  const interactive = target.closest(
    'button, a[href], [role="button"], .btn-primary, .btn-secondary, .btn-ghost, [data-ink-button], [data-ink-assistant]'
  );

  if (interactive && !interactive.hasAttribute("disabled")) {
    const label = resolveAssistantLabel(interactive, pathname);
    const scanEl = isScanTarget(target, pathname);
    return {
      scene: label ? "assistant" : ambientScene(pathname) ?? "default",
      assistantLabel: label,
      scanInsight: scanEl ? hashInsight(scanEl.id || scanEl.className) : "",
      scanRect: scanEl?.getBoundingClientRect() ?? null,
      magneticRect: null,
    };
  }

  const scanEl = isScanTarget(target, pathname);
  if (scanEl) {
    const rect = scanEl.getBoundingClientRect();
    const insight =
      scanEl.getAttribute("data-ink-insight") ?? hashInsight(scanEl.id || scanEl.className);
    return {
      scene: "scan",
      assistantLabel: isAnalyticsContext(target, pathname) ? ASSISTANT_LABELS.analytics : "",
      scanInsight: insight.slice(0, 24),
      scanRect: rect,
      magneticRect: rect,
    };
  }

  const cardEl = target.closest(".card, .card-hover, .card-popular, [data-ink-magnetic]");
  if (cardEl) {
    return {
      scene: "assistant",
      assistantLabel: "",
      scanInsight: "",
      scanRect: null,
      magneticRect: cardEl.getBoundingClientRect(),
    };
  }

  const ambient = ambientScene(pathname);
  if (ambient) {
    return {
      scene: ambient,
      assistantLabel:
        ambient === "analytics"
          ? ASSISTANT_LABELS.analytics
          : ambient === "marketing"
            ? ASSISTANT_LABELS.marketing
            : ambient === "employee"
              ? ASSISTANT_LABELS.employee
              : "",
      scanInsight: "",
      scanRect: null,
      magneticRect: null,
    };
  }

  return empty;
}

export function orbScale(scene: NavigatorScene, clicking: boolean, warpActive: boolean): number {
  let base = 1;
  if (clicking) {
    base = scene === "assistant" ? 1.18 : 0.9;
  } else {
    switch (scene) {
      case "assistant":
        base = 1.55;
        break;
      case "employee":
        base = 1.22;
        break;
      case "analytics":
      case "scan":
        base = 1.14;
        break;
      case "marketing":
        base = 1.16;
        break;
      case "input":
        base = 0.78;
        break;
      default:
        base = 1;
    }
  }
  return warpActive ? base * 1.08 : base;
}
