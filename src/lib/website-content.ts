export type WebsiteTone =
  | "Professional"
  | "Friendly"
  | "Casual"
  | "Authoritative"
  | "Conversational";

export const WEBSITE_TONES: WebsiteTone[] = [
  "Professional",
  "Friendly",
  "Casual",
  "Authoritative",
  "Conversational",
];

export interface WebsiteGeneratorRequest {
  businessName: string;
  industry: string;
  targetAudience: string;
  tone: WebsiteTone;
}

export interface WebsitePage {
  id: string;
  title: string;
  content: string;
}

export interface WebsiteContentOutput {
  businessName: string;
  pages: WebsitePage[];
  generatedAt: string;
}

function tonePhrase(tone: WebsiteTone): string {
  const map: Record<WebsiteTone, string> = {
    Professional: "trusted and results-driven",
    Friendly: "approachable and human",
    Casual: "relaxed and easy-going",
    Authoritative: "expert-led and confident",
    Conversational: "clear and engaging",
  };
  return map[tone];
}

export function generateWebsiteContent(req: WebsiteGeneratorRequest): WebsiteContentOutput {
  const { businessName, industry, targetAudience, tone } = req;
  const name = businessName.trim();
  const aud = targetAudience.trim();
  const ind = industry.trim();
  const voice = tonePhrase(tone);

  const pages: WebsitePage[] = [
    {
      id: "homepage",
      title: "Homepage",
      content: `# ${name} — ${ind} Solutions Built for ${aud}

## Hero Headline
Transform how ${aud} succeed in ${ind}.

## Subheadline
${name} delivers ${voice} solutions that help you move faster, grow smarter, and stand out in a crowded market.

## Primary CTA
Get Started Free →

## Secondary CTA
See How It Works

## Value Proposition
We combine deep ${ind} expertise with modern technology to solve the problems ${aud} face every day — without the complexity.

## Social Proof Strip
Trusted by growing teams in ${ind} · 4.9/5 average rating · 10,000+ users

## Key Benefits
- **Save time** — Automate repetitive work and focus on what matters
- **Grow faster** — Proven frameworks designed for ${aud}
- **Stay ahead** — Built for the way ${ind} works in 2026

## Feature Highlights
→ Smart workflows tailored to ${aud}
→ Seamless onboarding in under 5 minutes
→ Expert support when you need it

## Closing CTA
Ready to elevate your ${ind} strategy? Join ${name} today.`,
    },
    {
      id: "about-us",
      title: "About Us",
      content: `# About ${name}

## Our Story
${name} was founded with a simple belief: ${aud} deserve better tools for ${ind}. What started as a frustration with outdated solutions became a mission to build something ${voice} — and genuinely useful.

## Our Mission
To empower ${aud} with ${ind} solutions that are powerful, intuitive, and built for real-world results.

## Our Vision
A world where every team in ${ind} has access to enterprise-grade capabilities without enterprise-grade complexity.

## What We Stand For
**Innovation** — We push boundaries so you don't have to.
**Integrity** — Transparent pricing, honest communication, no hidden agendas.
**Impact** — We measure success by your outcomes, not our features list.

## The Team
We're a diverse group of ${ind} practitioners, engineers, and designers united by one goal: helping ${aud} win.

## By the Numbers
- Founded with a focus on ${ind}
- Serving ${aud} across multiple markets
- 98% customer satisfaction rate

## Join Us
We're always looking for talented people who care about ${ind} and ${aud}. Explore careers at ${name}.`,
    },
    {
      id: "services",
      title: "Services",
      content: `# Our Services

${name} offers end-to-end ${ind} services designed for ${aud}. Every engagement is delivered with a ${tone.toLowerCase()} approach and measurable outcomes.

## Service 1: Strategy & Consulting
Define your ${ind} roadmap with expert guidance tailored to ${aud}.
- Market analysis and competitive positioning
- Go-to-market planning
- KPI framework design

## Service 2: Implementation
Turn strategy into action with hands-on deployment support.
- Platform setup and configuration
- Team training and onboarding
- Integration with your existing stack

## Service 3: Managed Solutions
Ongoing optimization so you can focus on growth.
- Monthly performance reviews
- Content and campaign management
- Dedicated success manager

## Service 4: Custom Development
Bespoke solutions when off-the-shelf isn't enough.
- Custom workflows for ${aud}
- API integrations
- White-label options

## How We Work
1. **Discover** — Understand your goals and challenges
2. **Design** — Build a tailored plan for ${ind} success
3. **Deliver** — Execute with transparency and speed
4. **Optimize** — Iterate based on real data

## CTA
Let's discuss which service fits your needs. Book a free consultation with ${name}.`,
    },
    {
      id: "features",
      title: "Features",
      content: `# Features

Everything ${aud} need to excel in ${ind} — in one platform.

## Core Features

### Smart Dashboard
Real-time insights into your ${ind} performance. Track what matters, ignore the noise.

### AI-Powered Workflows
Automate repetitive tasks so your team focuses on high-impact work.

### Collaboration Hub
Keep ${aud} aligned with shared workspaces, comments, and version history.

### Analytics & Reporting
Export-ready reports that prove ROI to stakeholders.

### Integrations
Connect with the tools you already use — CRM, email, social, and more.

### Security & Compliance
Enterprise-grade encryption, SSO, and role-based access controls.

## Why ${name}?
| Feature | ${name} | Others |
|---------|---------|--------|
| Setup time | < 5 min | Days |
| Built for ${ind} | ✓ | Generic |
| Support | Human experts | Chatbots |
| Pricing | Transparent | Hidden fees |

## Coming Soon
- Mobile app for on-the-go ${ind} management
- Advanced AI content generation
- Multi-language support

## CTA
Explore all features with a free trial →`,
    },
    {
      id: "faq",
      title: "FAQ",
      content: `# Frequently Asked Questions

## General

**What is ${name}?**
${name} is a ${ind} platform built specifically for ${aud}. We help you streamline workflows, create better content, and grow your business with ${voice} tools.

**Who is ${name} for?**
${name} is designed for ${aud} who want professional ${ind} results without hiring a full agency.

**How is ${name} different from competitors?**
We're purpose-built for ${ind}, not adapted from a generic tool. Every feature reflects real challenges ${aud} face.

## Pricing & Plans

**Is there a free trial?**
Yes — start free with no credit card required. Upgrade when you're ready.

**Can I change plans later?**
Absolutely. Scale up or down anytime from your account settings.

**Do you offer discounts for teams?**
Yes. Contact us for volume pricing for teams of 5+.

## Getting Started

**How long does setup take?**
Most ${aud} are fully onboarded in under 15 minutes.

**Do you offer onboarding support?**
Every plan includes guided onboarding. Pro and Enterprise plans include a dedicated success manager.

**Can I import existing data?**
Yes. We support imports from common ${ind} tools and CSV uploads.

## Support

**How do I get help?**
Email support@, live chat, and a comprehensive help center are available on all plans.

**What are your support hours?**
Monday–Friday, 9 AM–6 PM in your local timezone. Enterprise plans include 24/7 priority support.`,
    },
    {
      id: "contact",
      title: "Contact Page",
      content: `# Contact ${name}

We'd love to hear from you. Whether you're exploring ${ind} solutions for ${aud} or need support — our team is here.

## Get in Touch

**Sales Inquiries**
Interested in ${name} for your team? Our sales team helps ${aud} find the right plan.
📧 sales@${name.toLowerCase().replace(/\s+/g, "")}.com

**Customer Support**
Existing customers — we're here to help.
📧 support@${name.toLowerCase().replace(/\s+/g, "")}.com
💬 Live chat available in-app

**Partnerships**
Explore co-marketing, integrations, and reseller opportunities.
📧 partners@${name.toLowerCase().replace(/\s+/g, "")}.com

## Office
${name} Headquarters
[Your Street Address]
[City, State ZIP]

## Business Hours
Monday – Friday: 9:00 AM – 6:00 PM
Saturday – Sunday: Closed

## Contact Form Fields
- Full Name *
- Work Email *
- Company Name
- Phone Number
- How can we help? * (dropdown: Sales / Support / Partnership / Other)
- Message *

## CTA
Submit → We'll respond within 1 business day.

## Follow Us
Stay connected for ${ind} tips, product updates, and insights for ${aud}.
LinkedIn · Twitter/X · Instagram`,
    },
  ];

  return {
    businessName: name,
    pages,
    generatedAt: new Date().toISOString(),
  };
}

export function formatWebsiteForCopy(output: WebsiteContentOutput): string {
  return output.pages
    .map((p) => `=== ${p.title.toUpperCase()} ===\n\n${p.content}`)
    .join("\n\n\n");
}

export function formatWebsiteForExport(output: WebsiteContentOutput): string {
  return output.pages.map((p) => `# ${p.title}\n\n${p.content}`).join("\n\n---\n\n");
}
