export interface LandingPageRequest {
  businessName: string;
  industry: string;
  targetAudience: string;
  offer: string;
}

export interface LandingHero {
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  badge?: string;
}

export interface LandingFeature {
  title: string;
  description: string;
}

export interface LandingBenefit {
  title: string;
  description: string;
}

export interface LandingTestimonial {
  quote: string;
  author: string;
  role: string;
}

export interface LandingFaq {
  question: string;
  answer: string;
}

export interface LandingCta {
  headline: string;
  subtext: string;
  buttonText: string;
}

export interface LandingPageOutput {
  businessName: string;
  industry: string;
  hero: LandingHero;
  features: LandingFeature[];
  benefits: LandingBenefit[];
  testimonials: LandingTestimonial[];
  faq: LandingFaq[];
  cta: LandingCta;
  generatedAt: string;
  live?: boolean;
}

export function generateLandingPage(req: LandingPageRequest): LandingPageOutput {
  const name = req.businessName.trim();
  const ind = req.industry.trim();
  const aud = req.targetAudience.trim();
  const offer = req.offer.trim();

  return {
    businessName: name,
    industry: ind,
    hero: {
      badge: `Built for ${aud}`,
      headline: `${offer} — without the complexity`,
      subheadline: `${name} helps ${aud} succeed in ${ind} with tools that deliver measurable results from day one.`,
      primaryCta: "Get started free",
      secondaryCta: "See how it works",
    },
    features: [
      {
        title: "Launch in minutes",
        description: `Go from signup to live ${ind} workflows in under 5 minutes — no consultants required.`,
      },
      {
        title: "Built for your audience",
        description: `Every template and automation is designed specifically for ${aud}.`,
      },
      {
        title: "AI-powered creation",
        description: `Generate content, campaigns, and assets tuned to ${name}'s brand voice.`,
      },
      {
        title: "Publish everywhere",
        description: "One workspace for LinkedIn, email, blog, and social — schedule and ship faster.",
      },
      {
        title: "Analytics that matter",
        description: `Track what resonates with ${aud} — not vanity metrics.`,
      },
      {
        title: "Team-ready",
        description: "Invite collaborators, manage clients, and scale your agency workflow.",
      },
    ],
    benefits: [
      {
        title: "Save 10+ hours per week",
        description: `Automate repetitive ${ind} tasks so ${aud} can focus on strategy and growth.`,
      },
      {
        title: "Consistent brand voice",
        description: "AI trained on your guidelines — every piece sounds unmistakably like you.",
      },
      {
        title: "Higher conversion",
        description: `Landing pages, emails, and posts optimized for how ${aud} actually buy.`,
      },
      {
        title: "Scale without hiring",
        description: "Deliver agency-quality output without expanding headcount.",
      },
    ],
    testimonials: [
      {
        quote: `${name} cut our content production time in half. Our ${ind} pipeline has never been healthier.`,
        author: "Sarah Chen",
        role: `Head of Marketing, ${ind} SaaS`,
      },
      {
        quote: `Finally a tool that understands ${aud}. The ${offer.toLowerCase()} alone was worth the switch.`,
        author: "Marcus Rivera",
        role: "Founder & CEO",
      },
      {
        quote: "We onboarded our whole team in a day. The ROI was obvious within the first week.",
        author: "Priya Patel",
        role: "Agency Director",
      },
    ],
    faq: [
      {
        question: `Who is ${name} for?`,
        answer: `${name} is built for ${aud} in ${ind} who want to create, publish, and optimize content faster without sacrificing quality.`,
      },
      {
        question: "How fast can I get started?",
        answer: "Most users publish their first piece of content within 15 minutes of signing up.",
      },
      {
        question: "Do I need technical skills?",
        answer: "No. If you can paste text and click generate, you can use the full platform.",
      },
      {
        question: "Can I try it before committing?",
        answer: `Yes — start free and explore ${offer} with no credit card required.`,
      },
      {
        question: "Does it work for teams?",
        answer: "Absolutely. Invite teammates, manage multiple clients, and use white-label options on higher plans.",
      },
    ],
    cta: {
      headline: `Ready to transform your ${ind} results?`,
      subtext: `Join thousands of ${aud} using ${name} to ship better content, faster.`,
      buttonText: `Start with ${offer}`,
    },
    generatedAt: new Date().toISOString(),
  };
}

export function landingPageToMarkdown(output: LandingPageOutput): string {
  const lines: string[] = [
    `# ${output.businessName} — Landing Page`,
    "",
    "## Hero",
    `**${output.hero.headline}**`,
    "",
    output.hero.subheadline,
    "",
    `- ${output.hero.primaryCta}`,
    `- ${output.hero.secondaryCta}`,
    "",
    "## Features",
    ...output.features.flatMap((f) => [`### ${f.title}`, f.description, ""]),
    "## Benefits",
    ...output.benefits.flatMap((b) => [`### ${b.title}`, b.description, ""]),
    "## Testimonials",
    ...output.testimonials.flatMap((t) => [
      `> "${t.quote}"`,
      `> — **${t.author}**, ${t.role}`,
      "",
    ]),
    "## FAQ",
    ...output.faq.flatMap((f) => [`### ${f.question}`, f.answer, ""]),
    "## CTA",
    `**${output.cta.headline}**`,
    "",
    output.cta.subtext,
    "",
    `[${output.cta.buttonText}]`,
  ];
  return lines.join("\n");
}

export function landingPageToPlain(output: LandingPageOutput): string {
  return landingPageToMarkdown(output).replace(/[#*>[\]]/g, "");
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function landingPageToHtml(output: LandingPageOutput): string {
  const { hero, features, benefits, testimonials, faq, cta, businessName } = output;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escHtml(businessName)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #18181b; line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .hero { padding: 80px 0; text-align: center; background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); color: #fff; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 999px; background: rgba(255,255,255,0.15); font-size: 13px; margin-bottom: 20px; }
    .hero h1 { font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; max-width: 800px; margin: 0 auto 16px; }
    .hero p { font-size: 1.15rem; opacity: 0.9; max-width: 600px; margin: 0 auto 32px; }
    .btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn-primary { padding: 14px 28px; background: #fff; color: #7c3aed; border: none; border-radius: 10px; font-weight: 700; font-size: 16px; cursor: pointer; }
    .btn-secondary { padding: 14px 28px; background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; font-weight: 600; font-size: 16px; cursor: pointer; }
    section { padding: 72px 0; }
    section h2 { font-size: 2rem; text-align: center; margin-bottom: 48px; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .card { padding: 28px; border-radius: 16px; border: 1px solid #e4e4e7; background: #fafafa; }
    .card h3 { font-size: 1.1rem; margin-bottom: 8px; }
    .card p { color: #52525b; font-size: 0.95rem; }
    .benefits { background: #f4f4f5; }
    .testimonial { padding: 28px; border-radius: 16px; background: #fff; border: 1px solid #e4e4e7; }
    .testimonial blockquote { font-style: italic; margin-bottom: 16px; color: #3f3f46; }
    .testimonial cite { font-style: normal; font-weight: 600; font-size: 0.9rem; }
    .faq-item { border-bottom: 1px solid #e4e4e7; padding: 20px 0; }
    .faq-item h3 { font-size: 1rem; margin-bottom: 8px; }
    .faq-item p { color: #52525b; font-size: 0.95rem; }
    .cta { text-align: center; padding: 80px 24px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; }
    .cta h2 { font-size: 2rem; margin-bottom: 12px; }
    .cta p { opacity: 0.9; margin-bottom: 28px; }
  </style>
</head>
<body>
  <header class="hero">
    <div class="container">
      ${hero.badge ? `<span class="badge">${escHtml(hero.badge)}</span>` : ""}
      <h1>${escHtml(hero.headline)}</h1>
      <p>${escHtml(hero.subheadline)}</p>
      <div class="btns">
        <button class="btn-primary">${escHtml(hero.primaryCta)}</button>
        <button class="btn-secondary">${escHtml(hero.secondaryCta)}</button>
      </div>
    </div>
  </header>

  <section>
    <div class="container">
      <h2>Features</h2>
      <div class="grid-3">
        ${features
          .map(
            (f) => `<div class="card"><h3>${escHtml(f.title)}</h3><p>${escHtml(f.description)}</p></div>`
          )
          .join("\n        ")}
      </div>
    </div>
  </section>

  <section class="benefits">
    <div class="container">
      <h2>Benefits</h2>
      <div class="grid-3">
        ${benefits
          .map(
            (b) => `<div class="card"><h3>${escHtml(b.title)}</h3><p>${escHtml(b.description)}</p></div>`
          )
          .join("\n        ")}
      </div>
    </div>
  </section>

  <section>
    <div class="container">
      <h2>What customers say</h2>
      <div class="grid-3">
        ${testimonials
          .map(
            (t) =>
              `<div class="testimonial"><blockquote>"${escHtml(t.quote)}"</blockquote><cite>${escHtml(t.author)}</cite><br/><span style="color:#71717a;font-size:0.85rem">${escHtml(t.role)}</span></div>`
          )
          .join("\n        ")}
      </div>
    </div>
  </section>

  <section>
    <div class="container" style="max-width:720px">
      <h2>FAQ</h2>
      ${faq
        .map(
          (f) =>
            `<div class="faq-item"><h3>${escHtml(f.question)}</h3><p>${escHtml(f.answer)}</p></div>`
        )
        .join("\n      ")}
    </div>
  </section>

  <footer class="cta">
    <h2>${escHtml(cta.headline)}</h2>
    <p>${escHtml(cta.subtext)}</p>
    <button class="btn-primary">${escHtml(cta.buttonText)}</button>
  </footer>
</body>
</html>`;
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function slugify(name: string): string {
  return name.slice(0, 40).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "landing-page";
}
