export type ContentType = "blog" | "social" | "image" | "seo" | "linkedin" | "carousel";

export interface CalendarEvent {
  id: string;
  title: string;
  type: ContentType;
  date: string;
  status: "draft" | "scheduled" | "published";
  platform?: string;
  content?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: "INR" | "USD";
  interval: "month";
  description: string;
  features: string[];
  generations: number | "unlimited";
  popular?: boolean;
  target: "free" | "creator" | "pro" | "agency";
}

export const PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "INR",
    interval: "month",
    target: "free",
    generations: 20,
    description: "Try InkFit AI and explore AI content creation.",
    features: [
      "20 AI generations / month",
      "Blog & LinkedIn post generation",
      "Basic SEO score",
      "7-day content calendar",
      "1 brand profile",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    price: 499,
    currency: "INR",
    interval: "month",
    target: "creator",
    generations: 150,
    description: "For founders, freelancers, and solo creators building on LinkedIn.",
    features: [
      "150 AI generations / month",
      "LinkedIn posts, carousels & comments",
      "Image generation for social",
      "SEO meta title & description",
      "30-day content calendar",
      "Brand kit",
      "Export to Word & PDF",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 1499,
    currency: "INR",
    interval: "month",
    target: "pro",
    popular: true,
    generations: 500,
    description: "For marketers and small teams scaling content operations.",
    features: [
      "500 AI generations / month",
      "All content types + ad creatives",
      "Keyword research & competitor analysis",
      "AI topic suggestions",
      "Multi-platform publishing",
      "Team collaboration (3 seats)",
      "Priority support",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price: 4999,
    currency: "INR",
    interval: "month",
    target: "agency",
    generations: "unlimited",
    description: "For marketing agencies managing multiple client brands.",
    features: [
      "Unlimited AI generations",
      "Unlimited brand profiles & clients",
      "White-label exports",
      "API access",
      "LinkedIn, Facebook, Instagram, WordPress publishing",
      "Advanced analytics",
      "Dedicated account manager",
      "Stripe & Razorpay billing",
    ],
  },
];

export const PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", color: "#0A66C2" },
  { id: "facebook", name: "Facebook", color: "#1877F2" },
  { id: "instagram", name: "Instagram", color: "#E4405F" },
  { id: "wordpress", name: "WordPress", color: "#21759B" },
];
