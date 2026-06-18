"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Play, Copy, Check } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { GlassCard } from "@/components/ui/glass-card";
import { FadeIn } from "./AnimatedSections";
import {
  DEMO_PROMPTS,
  DEMO_OUTPUTS,
  detectOutputType,
  type DemoOutputType,
} from "@/lib/demo-content";

function useTypewriter(text: string, active: boolean, speed = 10) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!active) {
      setDisplayed("");
      return;
    }
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, active, speed]);

  return displayed;
}

export function AiDemoSection() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [outputType, setOutputType] = useState<DemoOutputType | null>(null);
  const [typing, setTyping] = useState(false);
  const [activePromptId, setActivePromptId] = useState<DemoOutputType | null>(null);
  const [copied, setCopied] = useState(false);

  const output = outputType ? DEMO_OUTPUTS[outputType] : null;
  const typedText = useTypewriter(output?.content ?? "", typing);

  const runGenerate = useCallback((text: string, typeOverride?: DemoOutputType) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setOutputType(null);
    setTyping(false);

    setTimeout(() => {
      const type = typeOverride ?? detectOutputType(text);
      setOutputType(type);
      setLoading(false);
      setTyping(true);
    }, 1600);
  }, [loading]);

  const generate = useCallback(() => {
    runGenerate(prompt);
  }, [prompt, runGenerate]);

  const tryDemo = useCallback(
    (demo: (typeof DEMO_PROMPTS)[0]) => {
      setPrompt(demo.prompt);
      setActivePromptId(demo.id);
      runGenerate(demo.prompt, demo.id);
    },
    [runGenerate]
  );

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const OutputIcon = output?.icon ?? Sparkles;

  return (
    <section id="demo" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <div className="text-center">
            <span className="badge mb-4">Live Demo</span>
            <SectionHeading
              title="Try InkFit AI"
              subtitle="See how quickly AI can generate content for your brand."
            />
          </div>
        </FadeIn>

        {/* Quick demo prompts */}
        <FadeIn delay={0.08}>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {DEMO_PROMPTS.map((demo) => {
              const Icon = demo.icon;
              const isActive = activePromptId === demo.id;
              return (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => tryDemo(demo)}
                  disabled={loading}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition duration-300 ${
                    isActive
                      ? "border-brand-500/50 bg-brand-600/20 text-brand-300 shadow-glow"
                      : "border-white/[0.1] bg-white/[0.04] text-content-muted hover:border-brand-500/30 hover:bg-white/[0.08] hover:text-content"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {demo.label}
                </button>
              );
            })}
          </div>
        </FadeIn>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.1}>
            <GlassCard className="p-6">
              <label htmlFor="demo-prompt" className="label">
                Describe what you want to create
              </label>
              <textarea
                id="demo-prompt"
                rows={5}
                className="input-field resize-none"
                placeholder="Write a LinkedIn post about AI in healthcare"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setActivePromptId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
                }}
              />
              <p className="mt-2 text-xs text-content-subtle">
                Tip: Click a sample above or press Ctrl+Enter to generate
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={generate}
                  disabled={!prompt.trim() || loading}
                  className="btn-primary flex-1 py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => tryDemo(DEMO_PROMPTS[0])}
                  disabled={loading}
                  className="btn-secondary px-4 py-3"
                  title="Run sample demo"
                >
                  <Play className="h-4 w-4" />
                </button>
              </div>
            </GlassCard>
          </FadeIn>

          <FadeIn delay={0.2}>
            <GlassCard className="flex min-h-[360px] flex-col p-6">
              <AnimatePresence mode="wait">
                {!outputType && !loading && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-1 flex-col items-center justify-center text-center"
                  >
                    <div className="icon-gradient h-14 w-14">
                      <Sparkles className="h-7 w-7 text-white" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-content">Try a sample demo</p>
                    <p className="mt-1 max-w-xs text-sm text-content-subtle">
                      Pick LinkedIn, Blog, Instagram, SEO, or Email above to see InkFit AI in action
                    </p>
                  </motion.div>
                )}

                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-1 flex-col items-center justify-center gap-4"
                  >
                    <div className="relative">
                      <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
                      <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-brand-400" />
                    </div>
                    <p className="text-sm font-medium text-content-muted">
                      InkFit AI is crafting your content...
                    </p>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-brand-500"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {output && !loading && (
                  <motion.div
                    key="output"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-1 flex-col"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div className="icon-gradient h-8 w-8">
                        <OutputIcon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-brand-400">{output.label}</span>
                      <span className="ml-auto rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        AI Generated
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm leading-relaxed text-content-muted">
                      {typedText}
                      {typing && typedText.length < output.content.length && (
                        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-brand-500" />
                      )}
                    </div>
                    {!typing && (
                      <button
                        type="button"
                        onClick={copyOutput}
                        className="btn-secondary mt-4 w-full py-2.5 text-sm"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy to clipboard
                          </>
                        )}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
