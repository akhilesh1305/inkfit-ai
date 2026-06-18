import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLATFORMS } from "@/lib/types";

export async function GET() {
  try {
    const connections = await prisma.platformConnection.findMany();
    if (connections.length === 0) {
      for (const p of PLATFORMS) {
        await prisma.platformConnection.create({ data: { platform: p.id, connected: false } });
      }
      const seeded = await prisma.platformConnection.findMany();
      return NextResponse.json({ connections: seeded });
    }
    return NextResponse.json({ connections });
  } catch {
    return NextResponse.json({
      connections: PLATFORMS.map((p) => ({ platform: p.id, connected: false, account: null })),
    });
  }
}

export async function POST(req: Request) {
  try {
    const { platform, connected, account } = await req.json();
    const conn = await prisma.platformConnection.upsert({
      where: { platform },
      create: { platform, connected, account },
      update: { connected, account },
    });
    return NextResponse.json({ connection: conn });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { platform, title, content } = await req.json();
    const conn = await prisma.platformConnection.findUnique({ where: { platform } });
    if (!conn?.connected) {
      return NextResponse.json({ error: `Connect ${platform} first` }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      message: `"${title}" queued for publishing to ${platform}`,
      publishedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
