import type { PublishConnection, ScheduledPost } from "@/lib/publishing";

export interface LinkedInConnection extends PublishConnection {
  profileName: string | null;
  profileImage: string | null;
}

export interface LinkedInPublishStats {
  drafts: number;
  scheduled: number;
  queued: number;
  published: number;
  totalImpressions: number;
  totalEngagements: number;
}

export const LINKEDIN_CHAR_LIMIT = 3000;

export const SUGGESTED_TIMES = [
  { label: "9:00 AM", value: "09:00", hint: "Peak B2B morning" },
  { label: "12:00 PM", value: "12:00", hint: "Lunch scroll" },
  { label: "5:00 PM", value: "17:00", hint: "End of workday" },
  { label: "7:00 PM", value: "19:00", hint: "Evening engagement" },
];

export const DEMO_LINKEDIN_PROFILE = {
  account: "akhilesh-sharma",
  profileName: "Akhilesh Sharma",
  profileImage: null as string | null,
};

export function linkedInAvatarUrl(name: string, seed?: string): string {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const bg = "0A66C2";
  const color = "ffffff";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bg}&color=${color}&size=128&bold=true`;
}

export function computeLinkedInStats(posts: ScheduledPost[]): LinkedInPublishStats {
  const linkedin = posts.filter((p) => p.platform === "linkedin");
  const published = linkedin.filter((p) => p.status === "published");

  return {
    drafts: linkedin.filter((p) => p.status === "draft").length,
    scheduled: linkedin.filter((p) => p.status === "scheduled").length,
    queued: linkedin.filter((p) => p.status === "queued").length,
    published: published.length,
    totalImpressions: published.reduce((s, p) => s + p.impressions, 0),
    totalEngagements: published.reduce((s, p) => s + p.engagements, 0),
  };
}

export function filterLinkedInPosts(posts: ScheduledPost[]): ScheduledPost[] {
  return posts.filter((p) => p.platform === "linkedin");
}

export function formatLinkedInHandle(account: string | null): string {
  if (!account) return "";
  return account.startsWith("@") ? account : `@${account}`;
}
