import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-card backdrop-blur-xl",
        hover && "card-hover transition-all duration-500",
        className
      )}
    >
      {children}
    </div>
  );
}
