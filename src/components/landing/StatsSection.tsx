"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FadeIn } from "./AnimatedSections";

const stats = [
  { value: 50000, suffix: "+", label: "Content Pieces Generated" },
  { value: 5000, suffix: "+", label: "Active Users" },
  { value: 85, suffix: "%", label: "Time Saved" },
  { value: 120, suffix: "+", label: "Countries Reached" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] py-20 sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-600/90 via-accent-blue/80 to-accent-cyan/70" />
      <div className="absolute inset-0 bg-ink-bg/20" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.08}>
              <motion.div
                whileInView={{ scale: [0.92, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <p className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-3 text-sm font-medium text-white/75">{stat.label}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
