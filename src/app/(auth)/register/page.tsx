"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, User, Mail, Lock, ArrowRight } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const redirect = searchParams.get("redirect");
  const ref = searchParams.get("ref");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }

      if (plan && ["creator", "pro", "agency"].includes(plan)) {
        router.push(`/dashboard/billing?upgrade=${plan}`);
      } else if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
        router.push(redirect);
      } else {
        router.push("/onboarding");
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-content">Create your account</h1>
      <p className="mt-1 text-content-muted">
        {plan
          ? `Sign up to activate your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan`
          : "Start creating with InkFit AI — free forever"}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </div>
        )}
        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
            <input
              id="name"
              className="input-field pl-10"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
            <input
              id="email"
              type="email"
              className="input-field pl-10"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
            <input
              id="password"
              type="password"
              className="input-field pl-10"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Create Free Account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {ref && (
        <p className="mt-2 text-center text-xs text-content-subtle">Referred by a friend — thanks for joining!</p>
      )}

      <p className="mt-4 text-center text-xs text-slate-500 dark:text-content-subtle">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>
      <p className="mt-4 text-center text-sm text-content-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-400 hover:text-brand-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
