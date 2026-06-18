"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, User, ArrowRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { FadeIn } from "./AnimatedSections";

const posts = [
  {
    title: "AI Marketing Trends",
    excerpt: "Discover the top AI marketing trends shaping 2026 and how to leverage them for growth.",
    author: "InkFit Team",
    date: "Mar 12, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
  },
  {
    title: "SEO Best Practices",
    excerpt: "A complete guide to optimizing your content for search engines with AI-powered tools.",
    author: "Sarah Mitchell",
    date: "Mar 8, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=80",
  },
  {
    title: "LinkedIn Growth Strategies",
    excerpt: "Proven tactics to grow your LinkedIn presence and generate leads with thought leadership.",
    author: "James Chen",
    date: "Mar 3, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&q=80",
  },
  {
    title: "Content Marketing Guide",
    excerpt: "Everything you need to build a content engine that drives traffic, leads, and revenue.",
    author: "Priya Sharma",
    date: "Feb 28, 2026",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80",
  },
];

export function BlogSection() {
  return (
    <section id="resources" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <SectionHeading title="Resources & Insights" subtitle="Tips, guides, and strategies to level up your content game." />
        </FadeIn>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {posts.map((post, i) => (
            <FadeIn key={post.title} delay={i * 0.08}>
              <article className="group card overflow-hidden p-0 transition-shadow ">
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={600}
                    height={176}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 transition group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-content-muted">{post.excerpt}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {post.author}
                    </span>
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                  <Link
                    href="/register"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400"
                  >
                    Read article <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
