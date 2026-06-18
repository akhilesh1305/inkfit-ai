export interface FAQItem {
  question: string;
  answer: string;
}

export interface SEOArticleRequest {
  topic: string;
  targetKeyword: string;
  audience?: string;
}

export interface SEOArticleOutput {
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  faq: FAQItem[];
  fullArticle: string;
  seoScore: number;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function computeSEOScore(
  req: SEOArticleRequest,
  output: Omit<SEOArticleOutput, "seoScore">
): number {
  let score = 55;
  const kw = req.targetKeyword.toLowerCase();
  const titleLen = output.seoTitle.length;
  const metaLen = output.metaDescription.length;

  if (titleLen >= 45 && titleLen <= 65) score += 12;
  else if (titleLen >= 30 && titleLen <= 70) score += 6;

  if (metaLen >= 140 && metaLen <= 160) score += 12;
  else if (metaLen >= 120 && metaLen <= 170) score += 6;

  if (output.seoTitle.toLowerCase().includes(kw)) score += 10;
  if (output.metaDescription.toLowerCase().includes(kw)) score += 8;

  const wordCount = output.fullArticle.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 800) score += 10;
  else if (wordCount >= 500) score += 6;

  if (output.faq.length >= 4) score += 8;
  if (output.keywords.length >= 5) score += 5;
  if (output.fullArticle.includes("##")) score += 5;

  return Math.min(98, score);
}

export function generateSEOArticle(req: SEOArticleRequest): SEOArticleOutput {
  const topic = req.topic.trim();
  const keyword = req.targetKeyword.trim() || topic;
  const audience = req.audience?.trim() || "professionals and business leaders";
  const kwTitle = capitalize(keyword);

  const seoTitle = `${kwTitle}: Complete Guide for ${audience.split(",")[0]?.trim() || "2026"} | Expert Tips`;
  const metaDescription = `Discover proven ${keyword} strategies for ${audience}. Learn actionable frameworks, avoid common mistakes, and rank higher with this expert guide.`;

  const keywords = [
    keyword,
    `${keyword} guide`,
    `${keyword} tips`,
    `best ${keyword} strategies`,
    `${keyword} for beginners`,
    `how to ${keyword}`,
    `${keyword} 2026`,
    `${topic} SEO`,
  ];

  const faq: FAQItem[] = [
    {
      question: `What is ${keyword} and why does it matter?`,
      answer: `${capitalize(keyword)} is a core strategy for ${audience} looking to grow visibility and authority around ${topic}. When done well, it drives organic traffic, builds trust, and supports long-term business goals.`,
    },
    {
      question: `How long does it take to see results with ${keyword}?`,
      answer: `Most teams see meaningful progress in 8–12 weeks with consistent execution. Quick wins like optimized meta tags can improve CTR within days, while ranking improvements typically take 2–3 months.`,
    },
    {
      question: `What are the biggest mistakes in ${keyword}?`,
      answer: `Common pitfalls include keyword stuffing, thin content, ignoring search intent, and skipping internal links. Focus on helpful, structured content that answers real questions your audience asks.`,
    },
    {
      question: `How do I measure success for ${topic}?`,
      answer: `Track organic traffic, keyword rankings, click-through rate, time on page, and conversions. Use Google Search Console and analytics to monitor which ${keyword} pages perform best.`,
    },
    {
      question: `Can beginners succeed with ${keyword}?`,
      answer: `Absolutely. Start with one target keyword, publish a comprehensive guide, add FAQ schema, and update content quarterly. Consistency beats perfection for ${audience}.`,
    },
  ];

  const fullArticle = `# ${kwTitle}: The Complete Guide

## Introduction

If you're searching for actionable advice on **${keyword}**, you're in the right place. This guide covers everything ${audience} need to know about ${topic} — from fundamentals to advanced tactics that drive measurable results.

Whether you're starting from scratch or refining an existing strategy, the frameworks below will help you create content that ranks and converts.

## What Is ${kwTitle}?

${capitalize(keyword)} refers to the practices, tools, and strategies used to improve visibility and performance around ${topic}. For ${audience}, mastering this area means attracting qualified traffic without relying solely on paid channels.

The landscape has shifted in 2026. Search engines reward depth, expertise, and user experience — not keyword density alone.

## Why ${kwTitle} Matters in 2026

- **Organic reach compounds** — every optimized page becomes a long-term asset
- **Trust signals** — authoritative content positions you as the go-to expert
- **Cost efficiency** — SEO delivers ROI that outlasts ad campaigns
- **Intent matching** — the right content captures buyers at every stage

Organizations that invest in ${keyword} consistently outperform competitors who treat it as an afterthought.

## Step-by-Step ${kwTitle} Framework

### 1. Research search intent

Before writing, understand what users want when they search "${keyword}". Are they learning, comparing, or ready to buy? Match your content format to their intent.

### 2. Build a keyword cluster

Use your primary keyword "${keyword}" plus related terms like ${keywords.slice(1, 4).map((k) => `"${k}"`).join(", ")}. Create a pillar page with supporting articles linked internally.

### 3. Structure for readability

Use clear H2 and H3 headings, short paragraphs, bullet lists, and FAQ sections. Google and readers both reward scannable content.

### 4. Optimize on-page elements

Craft a compelling title tag (50–60 characters), meta description (150–160 characters), and URL slug containing your target keyword naturally.

### 5. Publish and iterate

Ship your first draft, monitor performance in Search Console, and update quarterly with fresh data and examples.

## Common ${kwTitle} Mistakes to Avoid

1. **Targeting keywords you can't rank for** — start with realistic difficulty
2. **Publishing thin content** — aim for 800+ words on pillar topics
3. **Ignoring mobile experience** — most searches happen on phones
4. **Skipping internal links** — connect related pages to boost authority
5. **Set and forget** — refresh top pages every 90 days

## Advanced Tips for ${audience}

- Add FAQ schema markup for featured snippet opportunities
- Include original data, screenshots, or case studies
- Build backlinks through guest posts and digital PR
- Repurpose long-form content into LinkedIn posts and newsletters
- Track Core Web Vitals for technical SEO health

## Conclusion

${capitalize(keyword)} is not a one-time project — it's an ongoing discipline. By following the framework in this guide, ${audience} can build a sustainable content engine around ${topic}.

Start with one comprehensive page targeting "${keyword}", measure results, and scale what works. The compounding returns are worth the effort.

---

*Ready to level up your ${keyword} strategy? Save this guide and share it with your team.*`;

  const base = { seoTitle, metaDescription, keywords, faq, fullArticle };
  const seoScore = computeSEOScore(req, base);

  return { ...base, seoScore };
}

export function recalculateSEOScore(
  req: SEOArticleRequest,
  output: SEOArticleOutput
): SEOArticleOutput {
  const { seoScore, ...rest } = output;
  return { ...output, seoScore: computeSEOScore(req, rest) };
}

export function formatSEOArticleForCopy(output: SEOArticleOutput): string {
  const faqBlock = output.faq
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join("\n\n");

  return `SEO TITLE
${output.seoTitle}

META DESCRIPTION
${output.metaDescription}

KEYWORDS
${output.keywords.join(", ")}

FAQ SECTION
${faqBlock}

FULL ARTICLE
${output.fullArticle}`;
}

export function formatSEOArticleForExport(output: SEOArticleOutput): string {
  const faqMd = output.faq
    .map((f) => `### ${f.question}\n\n${f.answer}`)
    .join("\n\n");

  return `# ${output.seoTitle}

**Meta Description:** ${output.metaDescription}

**Keywords:** ${output.keywords.join(", ")}

---

## FAQ

${faqMd}

---

${output.fullArticle}`;
}
