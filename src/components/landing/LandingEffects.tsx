"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface LandingEffectsProps {
  children: ReactNode;
}

export function LandingEffects({ children }: LandingEffectsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const meshRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onMove(e: MouseEvent) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--spotlight-x", `${x}%`);
      el.style.setProperty("--spotlight-y", `${y}%`);
    }

    function onScroll() {
      if (meshRef.current) {
        meshRef.current.style.transform = `translateY(${window.scrollY * 0.15}px)`;
      }
    }

    el.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative min-h-screen overflow-x-hidden bg-ink-bg"
      style={
        {
          "--spotlight-x": "50%",
          "--spotlight-y": "30%",
        } as React.CSSProperties
      }
    >
      {/* Animated gradient mesh */}
      <div
        ref={meshRef}
        className="pointer-events-none fixed inset-0 z-0 animate-mesh-shift"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 20%, rgba(124, 58, 237, 0.18) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 30%, rgba(59, 130, 246, 0.14) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 50% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      {/* Mouse-follow spotlight */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          background: `radial-gradient(700px circle at var(--spotlight-x) var(--spotlight-y), rgba(124, 58, 237, 0.08), transparent 45%)`,
        }}
      />

      {/* Floating orbs — kept below header area */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="animate-float absolute -left-40 top-[28%] h-[500px] w-[500px] rounded-full bg-brand-600/15 blur-[120px]" />
        <div className="animate-float-slow absolute -right-40 top-[40%] h-[450px] w-[450px] rounded-full bg-accent-blue/12 blur-[120px] [animation-delay:2s]" />
        <div className="animate-float absolute bottom-1/5 left-1/4 h-[350px] w-[350px] rounded-full bg-accent-cyan/10 blur-[100px] [animation-delay:4s]" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none fixed inset-0 z-0 animate-grid opacity-[0.15]"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(124, 58, 237, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(124, 58, 237, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 15%, transparent 75%)",
        }}
      />

      {/* Noise texture */}
      <div className="noise-overlay" aria-hidden />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
