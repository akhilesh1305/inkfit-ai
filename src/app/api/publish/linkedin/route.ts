import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DEMO_POSTS,
  type PostStatus,
  type ScheduledPost,
} from "@/lib/publishing";
import {
  DEMO_LINKEDIN_PROFILE,
  linkedInAvatarUrl,
  computeLinkedInStats,
  filterLinkedInPosts,
  type LinkedInConnection,
} from "@/lib/linkedin-publishing";

function mapPost(row: {
  id: string;
  platform: string;
  title: string;
  content: string;
  status: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  impressions: number;
  engagements: number;
  clicks: number;
  createdAt: Date;
}): ScheduledPost {
  return {
    id: row.id,
    platform: "linkedin",
    title: row.title,
    content: row.content,
    status: row.status as PostStatus,
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    impressions: row.impressions,
    engagements: row.engagements,
    clicks: row.clicks,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapConnection(row: {
  platform: string;
  connected: boolean;
  account: string | null;
  profileName: string | null;
  profileImage: string | null;
} | null): LinkedInConnection {
  if (!row) {
    return {
      platform: "linkedin",
      connected: false,
      account: null,
      profileName: null,
      profileImage: null,
    };
  }

  const name = row.profileName ?? DEMO_LINKEDIN_PROFILE.profileName;
  return {
    platform: "linkedin",
    connected: row.connected,
    account: row.account,
    profileName: name,
    profileImage: row.profileImage ?? linkedInAvatarUrl(name),
  };
}

async function seedLinkedIn(userId: string) {
  const conn = await prisma.publishConnection.findUnique({
    where: { userId_platform: { userId, platform: "linkedin" } },
  });

  if (!conn) {
    await prisma.publishConnection.create({
      data: {
        userId,
        platform: "linkedin",
        connected: true,
        account: DEMO_LINKEDIN_PROFILE.account,
        profileName: DEMO_LINKEDIN_PROFILE.profileName,
        profileImage: linkedInAvatarUrl(DEMO_LINKEDIN_PROFILE.profileName),
      },
    });
  }

  const postCount = await prisma.scheduledPost.count({
    where: { userId, platform: "linkedin" },
  });

  if (postCount === 0) {
    const linkedinDemo = DEMO_POSTS.filter((p) => p.platform === "linkedin");
    for (const post of linkedinDemo) {
      await prisma.scheduledPost.create({
        data: {
          userId,
          platform: "linkedin",
          title: post.title,
          content: post.content,
          status: post.status,
          scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : null,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
          impressions: post.impressions,
          engagements: post.engagements,
          clicks: post.clicks,
        },
      });
    }
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await seedLinkedIn(session.id);

    const [connectionRow, posts] = await Promise.all([
      prisma.publishConnection.findUnique({
        where: { userId_platform: { userId: session.id, platform: "linkedin" } },
      }),
      prisma.scheduledPost.findMany({
        where: { userId: session.id, platform: "linkedin" },
        orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
      }),
    ]);

    const mappedPosts = posts.map(mapPost);
    return NextResponse.json({
      connection: mapConnection(connectionRow),
      posts: mappedPosts,
      stats: computeLinkedInStats(mappedPosts),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "connect") {
      const profileName =
        String(body.profileName ?? DEMO_LINKEDIN_PROFILE.profileName).trim() ||
        DEMO_LINKEDIN_PROFILE.profileName;
      const account =
        String(body.account ?? DEMO_LINKEDIN_PROFILE.account).trim() ||
        DEMO_LINKEDIN_PROFILE.account;
      const profileImage = linkedInAvatarUrl(profileName);

      await prisma.publishConnection.upsert({
        where: { userId_platform: { userId: session.id, platform: "linkedin" } },
        create: {
          userId: session.id,
          platform: "linkedin",
          connected: true,
          account,
          profileName,
          profileImage,
        },
        update: {
          connected: true,
          account,
          profileName,
          profileImage,
        },
      });

      const row = await prisma.publishConnection.findUnique({
        where: { userId_platform: { userId: session.id, platform: "linkedin" } },
      });

      return NextResponse.json({ connection: mapConnection(row) });
    }

    if (body.action === "disconnect") {
      await prisma.publishConnection.upsert({
        where: { userId_platform: { userId: session.id, platform: "linkedin" } },
        create: {
          userId: session.id,
          platform: "linkedin",
          connected: false,
          account: null,
          profileName: null,
          profileImage: null,
        },
        update: {
          connected: false,
          account: null,
          profileName: null,
          profileImage: null,
        },
      });

      return NextResponse.json({
        connection: mapConnection({
          platform: "linkedin",
          connected: false,
          account: null,
          profileName: null,
          profileImage: null,
        }),
      });
    }

    const conn = await prisma.publishConnection.findUnique({
      where: { userId_platform: { userId: session.id, platform: "linkedin" } },
    });

    if (body.action === "create" || body.action === "publish-now") {
      if (!conn?.connected) {
        return NextResponse.json({ error: "Connect LinkedIn first" }, { status: 400 });
      }

      const isImmediate = body.action === "publish-now" || body.mode === "immediate";
      const status: PostStatus = isImmediate
        ? "published"
        : body.status === "draft"
          ? "draft"
          : "scheduled";

      const scheduledAt =
        !isImmediate && body.scheduledAt ? new Date(body.scheduledAt) : null;
      const publishedAt = isImmediate ? new Date() : null;

      const item = await prisma.scheduledPost.create({
        data: {
          userId: session.id,
          platform: "linkedin",
          title: String(body.title ?? "LinkedIn post").trim(),
          content: String(body.content).trim(),
          status,
          scheduledAt,
          publishedAt,
          impressions: isImmediate ? Math.floor(Math.random() * 8000) + 2000 : 0,
          engagements: isImmediate ? Math.floor(Math.random() * 600) + 80 : 0,
          clicks: isImmediate ? Math.floor(Math.random() * 200) + 20 : 0,
        },
      });

      const post = mapPost(item);
      const posts = filterLinkedInPosts(
        (
          await prisma.scheduledPost.findMany({
            where: { userId: session.id, platform: "linkedin" },
          })
        ).map(mapPost)
      );

      return NextResponse.json({
        post,
        stats: computeLinkedInStats(posts),
      });
    }

    if (body.action === "update") {
      const existing = await prisma.scheduledPost.findFirst({
        where: { id: body.id, userId: session.id, platform: "linkedin" },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const data: Record<string, unknown> = {};
      if (body.title !== undefined) data.title = String(body.title).trim();
      if (body.content !== undefined) data.content = String(body.content).trim();
      if (body.status !== undefined) data.status = body.status;
      if (body.scheduledAt !== undefined) {
        data.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
      }
      if (body.status === "published" && existing.status !== "published") {
        if (!conn?.connected) {
          return NextResponse.json({ error: "Connect LinkedIn first" }, { status: 400 });
        }
        data.publishedAt = new Date();
        data.impressions = Math.floor(Math.random() * 10000) + 3000;
        data.engagements = Math.floor(Math.random() * 800) + 100;
        data.clicks = Math.floor(Math.random() * 250) + 30;
      }

      const item = await prisma.scheduledPost.update({ where: { id: body.id }, data });
      return NextResponse.json({ post: mapPost(item) });
    }

    if (body.action === "delete") {
      const existing = await prisma.scheduledPost.findFirst({
        where: { id: body.id, userId: session.id, platform: "linkedin" },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      await prisma.scheduledPost.delete({ where: { id: body.id } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
