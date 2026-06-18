"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  image: string;
  index: number;
}

export function FeatureCard({ icon: Icon, title, desc, image, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group card card-hover overflow-hidden p-0"
    >
      <div className="relative h-36 overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={600}
          height={144}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-bg via-ink-bg/30 to-transparent" />
        <div className="icon-gradient absolute bottom-4 left-4 h-11 w-11">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-content">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-content-muted">{desc}</p>
      </div>
    </motion.div>
  );
}
