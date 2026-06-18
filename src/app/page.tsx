import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Play,
} from "lucide-react";
import { MarketingHeader } from "@/components/MarketingHeader";
import { LandingEffects } from "@/components/landing/LandingEffects";
import { HeroBackground } from "@/components/landing/HeroBackground";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { FadeIn } from "@/components/landing/AnimatedSections";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { AiDemoSection } from "@/components/landing/AiDemoSection";
import { TemplateGallery } from "@/components/landing/TemplateGallery";
import { BeforeAfterSection } from "@/components/landing/BeforeAfterSection";
import { UseCasesSection } from "@/components/landing/UseCasesSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { DashboardTabsPreview } from "@/components/landing/DashboardTabsPreview";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { BlogSection } from "@/components/landing/BlogSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function HomePage() {
  return (
    <LandingEffects>
      <MarketingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pb-4 pt-8 sm:pb-8 sm:pt-16">
        <HeroBackground />
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-12 text-center sm:pb-16 sm:pt-20">
          <div className="animate-fade-up badge mb-8">
            ✨ AI-Powered Content Studio
          </div>
          <h1 className="animate-fade-up-delay-1 text-4xl font-extrabold tracking-tight text-content sm:text-6xl lg:text-7xl lg:leading-[1.05]">
            Create Content That{" "}
            <span className="text-gradient">
              Fits Your Brand.
            </span>
          </h1>
          <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-xl font-medium text-content sm:text-2xl">
            Scale your marketing with AI.
          </p>
          <p className="animate-fade-up-delay-2 mx-auto mt-5 max-w-2xl text-body-lg text-content-muted">
            InkFit AI helps founders, creators, and businesses generate blogs, social posts,
            images, and SEO content in minutes — all from one intelligent workspace.
          </p>
          <div className="animate-fade-up-delay-3 mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="btn-primary group px-8 py-3.5 text-base"
            >
              Start Creating Free
              <ArrowRight className="h-5 w-5 transition duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/#demo" className="btn-secondary group px-8 py-3.5 text-base">
              <Play className="h-4 w-4 text-brand-400" />
              Watch Demo
            </Link>
          </div>
          <p className="animate-fade-up-delay-4 mt-6 text-sm text-content-subtle">
            Trusted by creators, startups, and growing businesses.
          </p>

          <DashboardPreview />
        </div>
      </section>

      <StatsSection />
      <AiDemoSection />
      <FeaturesGrid />
      <TemplateGallery />
      <BeforeAfterSection />
      <UseCasesSection />
      <WorkflowSection />
      <DashboardTabsPreview />

      {/* Agencies */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <FadeIn>
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-brand-600/25 to-accent-blue/25 blur-2xl" />
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] shadow-card-hover">
                  <Image
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                    alt="Team collaborating on content strategy"
                    width={800}
                    height={500}
                    className="h-72 w-full object-cover lg:h-96"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-bg/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/[0.12] bg-white/[0.06] p-4 backdrop-blur-xl">
                    <p className="text-sm font-medium text-content">10+ brands managed</p>
                    <p className="text-xs text-content-muted">From solo creators to full agencies</p>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <h2 className="text-section font-bold text-content">
                Built for agencies & startups
              </h2>
              <p className="mt-5 text-body-lg text-content-muted">
                Whether you&apos;re a solo founder building a personal brand on LinkedIn or an agency
                managing 10 client accounts, InkFit AI scales with you.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Brand Kit keeps every output on-voice",
                  "Content calendar with AI topic suggestions",
                  "Export blogs to Word & PDF",
                  "Stripe & Razorpay billing (India-ready)",
                  "OpenAI + Gemini AI support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-content-muted">
                    <Check className="h-5 w-5 shrink-0 text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/brand" className="btn-primary mt-10 inline-flex">
                Set Up Your Brand Kit <ArrowRight className="h-4 w-4" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <BlogSection />
      <FaqSection />
      <SiteFooter />
    </LandingEffects>
  );
}
