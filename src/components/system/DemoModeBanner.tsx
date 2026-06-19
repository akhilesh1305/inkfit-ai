"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

export function DemoModeBanner() {
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    fetch("/api/system/status")
      .then((r) => r.json())
      .then((d) => setDemoMode(Boolean(d.demoMode)))
      .catch(() => {});
  }, []);

  if (!demoMode) return null;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
      <span>
        <strong className="font-semibold">Demo mode</strong> — AI API keys are not configured.
        Outputs use templates; connect OpenAI or Gemini in production for live generation.
      </span>
    </div>
  );
}
