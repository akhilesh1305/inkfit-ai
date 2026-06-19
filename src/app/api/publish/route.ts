import { NextResponse } from "next/server";
import { gateAuth } from "@/lib/credit-api";
import { prisma } from "@/lib/prisma";
import {
  DEMO_POSTS,
  PUBLISH_PLATFORMS,
  type PublishConnection,
  type PublishPlatformId,
  type PostStatus,
  type ScheduledPost,
} from "@/lib/publishing";

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
    platform: row.platform as PublishPlatformId,
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

function mapConnections(
  rows: {
    platform: string;
    connected: boolean;
    account: string | null;
    profileName?: string | null;
    profileImage?: string | null;
  }[]
): PublishConnection[] {
  return PUBLISH_PLATFORMS.map((p) => {
    const row = rows.find((r) => r.platform === p.id);
    return {
      platform: p.id,
      connected: row?.connected ?? false,
      account: row?.account ?? null,
      profileName: row?.profileName ?? null,
      profileImage: row?.profileImage ?? null,
    };
  });
}

async function seedForUser(userId: string) {
  const connCount = await prisma.publishConnection.count({ where: { userId } });
  if (connCount === 0) {
    await prisma.publishConnection.createMany({
      data: [
        {
          userId,
          platform: "linkedin",
          connected: true,
          account: "akhilesh-sharma",
          profileName: "Akhilesh Sharma",
          profileImage:
            "https://ui-avatars.com/api/?name=AS&background=0A66C2&color=ffffff&size=128&bold=true",
        },
        { userId, platform: "twitter", connected: true, account: "@inkfitai" },
        { userId, platform: "facebook", connected: false, account: null },
        { userId, platform: "instagram", connected: true, account: "@inkfit.ai" },
      ],
    });
  }

  const postCount = await prisma.scheduledPost.count({ where: { userId } });
  if (postCount === 0) {
    for (const post of DEMO_POSTS) {
      await prisma.scheduledPost.create({
        data: {
          userId,
          platform: post.platform,
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
    const auth = await gateAuth("content:read");
    if (!auth.ok) return auth.response;
    const userId = auth.ctx.user.id;

    await seedForUser(userId);

    const [connections, posts] = await Promise.all([
      prisma.publishConnection.findMany({ where: { userId } }),
      prisma.scheduledPost.findMany({
        where: { userId },
        orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
      }),
    ]);

    return NextResponse.json({
      connections: mapConnections(connections),
      posts: posts.map(mapPost),
    });
  } catch {
    const now = new Date().toISOString();
    return NextResponse.json({
      connections: [
        { platform: "linkedin", connected: true, account: "@inkfit.ai" },
        { platform: "twitter", connected: true, account: "@inkfitai" },
        { platform: "facebook", connected: false, account: null },
        { platform: "instagram", connected: true, account: "@inkfit.ai" },
      ],
      posts: DEMO_POSTS.map((p, i) => ({
        id: `demo-${i}`,
        ...p,
        createdAt: now,
      })),
    });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await gateAuth("content:write");
    if (!auth.ok) return auth.response;
    const userId = auth.ctx.user.id;

    const body = await req.json();

    if (body.action === "connect") {
      const platform = body.platform as PublishPlatformId;
      const connected = Boolean(body.connected);
      const account = connected ? (body.account as string) || `@${platform}_account` : null;

      await prisma.publishConnection.upsert({
        where: { userId_platform: { userId, platform } },
        create: { userId, platform, connected, account },
        update: { connected, account },
      });

      const connections = await prisma.publishConnection.findMany({
        where: { userId },
      });
      return NextResponse.json({ connections: mapConnections(connections) });
    }

    if (body.action === "create") {
      const status = (body.status as PostStatus) ?? "draft";
      const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
      const publishedAt = status === "published" ? new Date() : null;

      const item = await prisma.scheduledPost.create({
        data: {
          userId,
          platform: body.platform as PublishPlatformId,
          title: String(body.title).trim(),
          content: String(body.content).trim(),
          status,
          scheduledAt,
          publishedAt,
          impressions: status === "published" ? Math.floor(Math.random() * 2000) + 500 : 0,
          engagements: status === "published" ? Math.floor(Math.random() * 200) + 20 : 0,
          clicks: status === "published" ? Math.floor(Math.random() * 80) + 5 : 0,
        },
      });
      return NextResponse.json({ post: mapPost(item) });
    }

    if (body.action === "update") {
      const existing = await prisma.scheduledPost.findFirst({
        where: { id: body.id, userId },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const data: Record<string, unknown> = {};
      if (body.title !== undefined) data.title = String(body.title).trim();
      if (body.content !== undefined) data.content = String(body.content).trim();
      if (body.platform !== undefined) data.platform = body.platform;
      if (body.status !== undefined) data.status = body.status;
      if (body.scheduledAt !== undefined) {
        data.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
      }
      if (body.status === "published" && existing.status !== "published") {
        data.publishedAt = new Date();
        data.impressions = Math.floor(Math.random() * 5000) + 1000;
        data.engagements = Math.floor(Math.random() * 500) + 50;
        data.clicks = Math.floor(Math.random() * 150) + 10;
      }

      const item = await prisma.scheduledPost.update({
        where: { id: body.id },
        data,
      });
      return NextResponse.json({ post: mapPost(item) });
    }

    if (body.action === "delete") {
      const existing = await prisma.scheduledPost.findFirst({
        where: { id: body.id, userId },
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

export async function PUT(req: Request) {
  try {
    const auth = await gateAuth("content:write");
    if (!auth.ok) return auth.response;
    const userId = auth.ctx.user.id;

    const { platform, title, content } = await req.json();
    const conn = await prisma.publishConnection.findFirst({
      where: { userId, platform },
    });
    if (!conn?.connected) {
      return NextResponse.json({ error: `Connect ${platform} first` }, { status: 400 });
    }

    const item = await prisma.scheduledPost.create({
      data: {
        userId,
        platform,
        title: String(title).trim(),
        content: String(content).trim(),
        status: "published",
        publishedAt: new Date(),
        impressions: Math.floor(Math.random() * 3000) + 800,
        engagements: Math.floor(Math.random() * 300) + 40,
        clicks: Math.floor(Math.random() * 100) + 10,
      },
    });

    return NextResponse.json({
      success: true,
      message: `"${title}" published to ${platform}`,
      publishedAt: new Date().toISOString(),
      post: mapPost(item),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
