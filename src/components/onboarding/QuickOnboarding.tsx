"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";

export function QuickOnboarding() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quick_complete",
          goal: goal.trim(),
          businessName: businessName.trim() || "My Business",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("inkfit-employee-completed", "0");
        window.localStorage.setItem("inkfit-golden-path-started", new Date().toISOString());
      }

      const q = new URLSearchParams({ goal: goal.trim() });
      router.push(`/dashboard/employee?${q.toString()}`);
      router.refresh();
    } catch {
      setError("Could not save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-bg">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-brand-600/10 via-transparent to-cyan-500/5" />
      <div className="relative mx-auto max-w-lg px-4 py-12 sm:py-20">
        <div className="mb-8 flex justify-center">
          <Logo size="md" href={null} />
        </div>

        <div className="card">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-400">
              60-second setup
            </span>
          </div>
          <h1 className="text-2xl font-bold text-content">What&apos;s your marketing goal?</h1>
          <p className="mt-2 text-sm text-content-muted">
            Skip the long wizard — launch your AI Marketing Employee and get strategy, content, and
            a publishing schedule in minutes.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}
            <div>
              <label className="label" htmlFor="goal">
                Business goal
              </label>
              <textarea
                id="goal"
                className="input-field min-h-[88px]"
                placeholder='e.g. "Get 50 qualified leads per month from LinkedIn"'
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="name">
                Business name (optional)
              </label>
              <input
                id="name"
                className="input-field"
                placeholder="Acme Inc."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading || !goal.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Start AI Employee
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
