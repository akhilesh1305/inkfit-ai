"use client";

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Hero glow */}
      <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-gradient-to-b from-brand-600/25 via-accent-blue/15 to-transparent blur-[100px]" />

      {/* Gradient orbs */}
      <div className="absolute -left-1/4 top-0 h-[550px] w-[550px] animate-pulse-glow rounded-full bg-brand-600/20 blur-[120px]" />
      <div className="absolute -right-1/4 top-1/4 h-[450px] w-[450px] animate-pulse-glow rounded-full bg-accent-blue/18 blur-[120px] [animation-delay:2s]" />
      <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] animate-pulse-glow rounded-full bg-accent-cyan/12 blur-[100px] [animation-delay:1s]" />

      {/* Grid */}
      <div
        className="animate-grid absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(124, 58, 237, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(124, 58, 237, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 85% 65% at 50% 0%, black 15%, transparent 70%)",
        }}
      />

      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />
    </div>
  );
}
