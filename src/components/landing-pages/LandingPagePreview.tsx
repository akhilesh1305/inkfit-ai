"use client";

import type { LandingPageOutput } from "@/lib/landing-page";
import { Check, Star, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LandingPagePreviewProps {
  output: LandingPageOutput;
  className?: string;
}

export function LandingPagePreview({ output, className }: LandingPagePreviewProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/10 bg-white text-zinc-900 shadow-2xl",
        className
      )}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="mx-auto max-w-[200px] flex-1 truncate rounded-md bg-white px-3 py-1 text-center text-[10px] text-zinc-500">
          {output.businessName.toLowerCase().replace(/\s+/g, "")}.com
        </div>
      </div>

      <div className="max-h-[640px] overflow-y-auto">
        {/* Hero */}
        <section className="bg-gradient-to-br from-violet-600 via-violet-700 to-cyan-600 px-6 py-12 text-center text-white">
          {output.hero.badge && (
            <span className="mb-4 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              {output.hero.badge}
            </span>
          )}
          <h1 className="mx-auto max-w-lg text-2xl font-extrabold leading-tight sm:text-3xl">
            {output.hero.headline}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/85">
            {output.hero.subheadline}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-violet-700"
            >
              {output.hero.primaryCta}
            </button>
            <button
              type="button"
              className="rounded-lg border-2 border-white/40 px-5 py-2.5 text-sm font-semibold text-white"
            >
              {output.hero.secondaryCta}
            </button>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-10">
          <h2 className="mb-6 text-center text-xl font-bold text-zinc-900">Features</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {output.features.map((f, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <Check className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-zinc-900">{f.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-600">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-zinc-100 px-6 py-10">
          <h2 className="mb-6 text-center text-xl font-bold text-zinc-900">Benefits</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {output.benefits.map((b, i) => (
              <div key={i} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">{b.title}</h3>
                  <p className="mt-0.5 text-xs text-zinc-600">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 py-10">
          <h2 className="mb-6 text-center text-xl font-bold text-zinc-900">
            What customers say
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {output.testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                <p className="text-xs italic leading-relaxed text-zinc-600">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="mt-3 text-xs font-semibold text-zinc-900">{t.author}</p>
                <p className="text-[10px] text-zinc-500">{t.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-zinc-200 px-6 py-10">
          <h2 className="mb-4 text-center text-xl font-bold text-zinc-900">FAQ</h2>
          <div className="mx-auto max-w-lg">
            {output.faq.map((item, i) => (
              <div key={i} className="border-b border-zinc-200">
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-zinc-900"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.question}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-zinc-400 transition",
                      openFaq === i && "rotate-180"
                    )}
                  />
                </button>
                {openFaq === i && (
                  <p className="pb-3 text-xs leading-relaxed text-zinc-600">{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-10 text-center text-white">
          <h2 className="text-xl font-bold">{output.cta.headline}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-white/85">{output.cta.subtext}</p>
          <button
            type="button"
            className="mt-5 rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-violet-700"
          >
            {output.cta.buttonText}
          </button>
        </section>
      </div>
    </div>
  );
}
