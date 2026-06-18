export type CarouselSlideRole = "hook" | "content" | "cta";

export interface CarouselSlide {
  id: string;
  number: number;
  role: CarouselSlideRole;
  title: string;
  body: string;
}

export interface CarouselData {
  topic: string;
  slides: CarouselSlide[];
}

const CONTENT_TEMPLATES = [
  (topic: string, n: number) => ({
    title: `Mistake #${n}: Ignoring the basics`,
    body: `Most people rush into ${topic} without a clear strategy. Start with one goal, one audience, and one metric.`,
  }),
  (topic: string) => ({
    title: "The 80/20 rule applies here",
    body: `20% of your ${topic} efforts drive 80% of results. Double down on what already works instead of chasing trends.`,
  }),
  (topic: string) => ({
    title: "Consistency beats perfection",
    body: `Publishing regularly about ${topic} builds more trust than one viral post. Show up weekly — your audience will notice.`,
  }),
  (topic: string) => ({
    title: "Lead with value, not promotion",
    body: `Teach first. Sell second. The best ${topic} content solves a real problem before asking for anything in return.`,
  }),
  (topic: string) => ({
    title: "Use stories, not statements",
    body: `Data informs. Stories persuade. Wrap your ${topic} insights in real examples your audience can relate to.`,
  }),
  (topic: string) => ({
    title: "Format for scanners",
    body: `Short lines. Bold hooks. Bullet points. On mobile, readable ${topic} content wins every time.`,
  }),
  (topic: string) => ({
    title: "Engage before you publish",
    body: `Comment on 10 posts before sharing your own ${topic} content. Warm up the algorithm and your network.`,
  }),
  (topic: string) => ({
    title: "Repurpose one idea 5 ways",
    body: `Turn one ${topic} insight into a post, carousel, thread, newsletter, and video. Work smarter, not harder.`,
  }),
];

export function generateCarousel(topic: string): CarouselData {
  const t = topic.trim();

  const hook: CarouselSlide = {
    id: `slide-1-${Date.now()}`,
    number: 1,
    role: "hook",
    title: `${t}: The playbook nobody talks about`,
    body: `Swipe → for 8 actionable lessons you can use this week.`,
  };

  const contentSlides: CarouselSlide[] = CONTENT_TEMPLATES.map((fn, i) => {
    const { title, body } = fn(t, i + 1);
    return {
      id: `slide-${i + 2}-${Date.now()}`,
      number: i + 2,
      role: "content" as const,
      title,
      body,
    };
  });

  const cta: CarouselSlide = {
    id: `slide-10-${Date.now()}`,
    number: 10,
    role: "cta",
    title: "Found this useful?",
    body: `Follow for more on ${t}.\nSave this carousel · Repost to help others ♻️`,
  };

  return {
    topic: t,
    slides: [hook, ...contentSlides, cta],
  };
}

export function getSlideRoleLabel(role: CarouselSlideRole): string {
  if (role === "hook") return "Hook";
  if (role === "cta") return "CTA";
  return "Content";
}
