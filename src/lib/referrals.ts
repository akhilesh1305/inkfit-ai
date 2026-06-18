export type InviteStatus = "clicked" | "signed_up" | "converted";

export interface ReferralStats {
  clicks: number;
  signups: number;
  conversions: number;
  creditsEarned: number;
  conversionRate: string;
  signupRate: string;
}

export interface ReferralInvite {
  id: string;
  name: string;
  email: string;
  status: InviteStatus;
  rewardCredits: number;
  createdAt: string;
}

export interface ReferralReward {
  id: string;
  title: string;
  description: string;
  credits: number;
  unlocked: boolean;
  progress: number;
  target: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  referrals: number;
  conversions: number;
  earnings: number;
  isYou?: boolean;
}

export interface ReferralDashboardData {
  code: string;
  link: string;
  stats: ReferralStats;
  invites: ReferralInvite[];
  rewards: ReferralReward[];
  leaderboard: LeaderboardEntry[];
}

export const REWARD_TIERS = [
  { target: 1, credits: 50, title: "First Referral", description: "Earn 50 credits when someone signs up" },
  { target: 5, credits: 300, title: "Growth Partner", description: "5 signups unlocks 300 bonus credits" },
  { target: 10, credits: 750, title: "Ambassador", description: "10 conversions = 750 credits + Pro trial" },
  { target: 25, credits: 2000, title: "Elite Partner", description: "25 conversions = 2,000 credits + Agency perks" },
];

export const INVITE_STATUS_META: Record<
  InviteStatus,
  { label: string; color: string; bg: string }
> = {
  clicked: { label: "Clicked", color: "text-zinc-400", bg: "bg-zinc-500/15" },
  signed_up: { label: "Signed up", color: "text-brand-300", bg: "bg-brand-500/15" },
  converted: { label: "Converted", color: "text-emerald-400", bg: "bg-emerald-500/15" },
};

export const DEMO_INVITES: Omit<ReferralInvite, "id" | "createdAt">[] = [
  {
    name: "Priya Sharma",
    email: "priya@startup.io",
    status: "converted",
    rewardCredits: 150,
  },
  {
    name: "James Okonkwo",
    email: "james@agency.co",
    status: "signed_up",
    rewardCredits: 50,
  },
  {
    name: "Maria Chen",
    email: "maria@saas.com",
    status: "converted",
    rewardCredits: 150,
  },
  {
    name: "Alex Rivera",
    email: "alex@freelance.dev",
    status: "clicked",
    rewardCredits: 0,
  },
  {
    name: "Sneha Patel",
    email: "sneha@marketing.in",
    status: "signed_up",
    rewardCredits: 50,
  },
  {
    name: "Tom Bradley",
    email: "tom@consulting.uk",
    status: "converted",
    rewardCredits: 150,
  },
];

export const DEMO_LEADERBOARD: Omit<LeaderboardEntry, "rank" | "isYou">[] = [
  { name: "Sarah Mitchell", avatar: "SM", referrals: 48, conversions: 32, earnings: 4800 },
  { name: "David Kim", avatar: "DK", referrals: 41, conversions: 28, earnings: 4200 },
  { name: "Elena Vasquez", avatar: "EV", referrals: 36, conversions: 24, earnings: 3600 },
  { name: "Ryan O'Brien", avatar: "RO", referrals: 29, conversions: 19, earnings: 2850 },
  { name: "Aisha Mohammed", avatar: "AM", referrals: 22, conversions: 15, earnings: 2250 },
];

export function generateReferralCode(userId: string, userName?: string): string {
  if (userName) {
    const slug = userName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 12);
    if (slug.length >= 4) return slug;
  }
  return `inkfit${userId.slice(-8)}`;
}

export function buildReferralLink(baseUrl: string, code: string): string {
  return `${baseUrl.replace(/\/$/, "")}/register?ref=${code}`;
}

export function computeStats(
  clicks: number,
  signups: number,
  conversions: number,
  creditsEarned: number
): ReferralStats {
  return {
    clicks,
    signups,
    conversions,
    creditsEarned,
    signupRate: clicks > 0 ? `${((signups / clicks) * 100).toFixed(1)}%` : "0%",
    conversionRate: signups > 0 ? `${((conversions / signups) * 100).toFixed(1)}%` : "0%",
  };
}

export function buildRewards(conversions: number): ReferralReward[] {
  return REWARD_TIERS.map((tier, i) => ({
    id: `tier-${i}`,
    title: tier.title,
    description: tier.description,
    credits: tier.credits,
    unlocked: conversions >= tier.target,
    progress: Math.min(conversions, tier.target),
    target: tier.target,
  }));
}

export function buildLeaderboard(
  userName: string,
  userConversions: number,
  userSignups: number
): LeaderboardEntry[] {
  const userEarnings = userConversions * 150;
  const entries: LeaderboardEntry[] = DEMO_LEADERBOARD.map((e, i) => ({
    ...e,
    rank: i + 1,
  }));

  const userEntry: LeaderboardEntry = {
    rank: 0,
    name: userName,
    avatar: userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    referrals: userSignups + 2,
    conversions: userConversions,
    earnings: userEarnings,
    isYou: true,
  };

  const combined = [...entries, userEntry].sort((a, b) => b.conversions - a.conversions);
  return combined.map((e, i) => ({ ...e, rank: i + 1 }));
}

export function formatCredits(n: number): string {
  return n.toLocaleString();
}

export function formatEarnings(credits: number): string {
  return `₹${(credits * 2).toLocaleString()}`;
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const masked = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user[0]}***`;
  return `${masked}@${domain}`;
}
