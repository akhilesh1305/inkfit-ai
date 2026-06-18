import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";
import {
  DEMO_INVITES,
  buildLeaderboard,
  buildReferralLink,
  buildRewards,
  computeStats,
  generateReferralCode,
  type InviteStatus,
  type ReferralInvite,
} from "@/lib/referrals";

function mapInvite(row: {
  id: string;
  name: string;
  email: string;
  status: string;
  rewardCredits: number;
  createdAt: Date;
}): ReferralInvite {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status as InviteStatus,
    rewardCredits: row.rewardCredits,
    createdAt: row.createdAt.toISOString(),
  };
}

async function seedForUser(userId: string, userName: string) {
  let profile = await prisma.referralProfile.findUnique({ where: { userId } });

  if (!profile) {
    const code = generateReferralCode(userId, userName);
    let finalCode = code;
    let attempt = 0;
    while (attempt < 5) {
      const existing = await prisma.referralProfile.findUnique({ where: { code: finalCode } });
      if (!existing) break;
      finalCode = `${code}${attempt}`;
      attempt++;
    }

    profile = await prisma.referralProfile.create({
      data: {
        userId,
        code: finalCode,
        clicks: 342,
        signups: 18,
        conversions: 8,
        creditsEarned: 950,
      },
    });
  }

  const inviteCount = await prisma.referralInvite.count({ where: { referrerId: userId } });
  if (inviteCount === 0) {
    const daysAgo = [1, 3, 5, 8, 12, 15];
    for (let i = 0; i < DEMO_INVITES.length; i++) {
      const invite = DEMO_INVITES[i];
      const d = new Date();
      d.setDate(d.getDate() - daysAgo[i]);
      await prisma.referralInvite.create({
        data: {
          referrerId: userId,
          name: invite.name,
          email: invite.email,
          status: invite.status,
          rewardCredits: invite.rewardCredits,
          createdAt: d,
        },
      });
    }
  }

  return profile;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await seedForUser(session.id, session.name);
    const invites = await prisma.referralInvite.findMany({
      where: { referrerId: session.id },
      orderBy: { createdAt: "desc" },
    });

    const baseUrl = getSiteUrl();
    const stats = computeStats(
      profile.clicks,
      profile.signups,
      profile.conversions,
      profile.creditsEarned
    );

    return NextResponse.json({
      code: profile.code,
      link: buildReferralLink(baseUrl, profile.code),
      stats,
      invites: invites.map(mapInvite),
      rewards: buildRewards(profile.conversions),
      leaderboard: buildLeaderboard(session.name, profile.conversions, profile.signups),
    });
  } catch {
    const session = await getSession();
    const code = generateReferralCode(session?.id ?? "demo", session?.name);
    const stats = computeStats(342, 18, 8, 950);
    const now = new Date().toISOString();
    return NextResponse.json({
      code,
      link: buildReferralLink(getSiteUrl(), code),
      stats,
      invites: DEMO_INVITES.map((inv, i) => ({
        id: `demo-${i}`,
        ...inv,
        createdAt: now,
      })),
      rewards: buildRewards(8),
      leaderboard: buildLeaderboard(session?.name ?? "You", 8, 18),
    });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "copy-track") {
      const profile = await prisma.referralProfile.findUnique({
        where: { userId: session.id },
      });
      if (profile) {
        await prisma.referralProfile.update({
          where: { userId: session.id },
          data: { clicks: { increment: 1 } },
        });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
