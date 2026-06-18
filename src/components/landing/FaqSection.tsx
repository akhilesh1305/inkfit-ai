"use client";

import { SectionHeading } from "./SectionHeading";
import { FadeIn } from "./AnimatedSections";
import { Accordion } from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What can I create with InkFit AI?",
    answer:
      "InkFit AI helps you create LinkedIn posts, blog articles, social media captions, SEO landing pages, ad copy, email campaigns, YouTube scripts, newsletters, case studies, and AI-generated images — all from one unified workspace.",
  },
  {
    question: "Which AI models power InkFit AI?",
    answer:
      "InkFit AI supports OpenAI (GPT) and Google Gemini models. You can configure your preferred provider in settings. When no API key is set, demo mode provides sample outputs so you can explore the platform.",
  },
  {
    question: "Can I generate SEO content?",
    answer:
      "Yes. Our SEO Toolkit includes keyword research, content scoring, meta title and description generation, and optimization suggestions to help your content rank higher on search engines.",
  },
  {
    question: "Can I create social media posts?",
    answer:
      "Absolutely. InkFit AI includes a LinkedIn Growth Studio, social post generator, and templates for Instagram, Facebook, X/Twitter, and more. Schedule and publish directly from your content calendar.",
  },
  {
    question: "Can I generate AI images?",
    answer:
      "Yes. The AI Image Creator generates social creatives, blog headers, ad visuals, and more. Images are tailored to your brand colors and content context.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. InkFit AI offers a free forever plan with limited generations per month. Paid plans start at ₹499/month with higher limits, Brand Kit access, and priority AI processing.",
  },
  {
    question: "Can teams collaborate?",
    answer:
      "Team collaboration is available on Creator and Agency plans. Share Brand Kits, manage content calendars together, and maintain consistent voice across your entire organization.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-white/[0.08] bg-white py-16 dark:border-slate-800 dark:bg-slate-900/50 sm:py-20">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn>
          <SectionHeading title="Frequently Asked Questions" />
        </FadeIn>
        <FadeIn delay={0.1}>
          <Accordion items={faqItems} className="mt-10" />
        </FadeIn>
      </div>
    </section>
  );
}
