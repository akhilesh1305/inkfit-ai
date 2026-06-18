import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DEMO_DOCUMENTS,
  type KnowledgeCategory,
  type KnowledgeSourceType,
  type KnowledgeStatus,
  type KnowledgeDocument,
} from "@/lib/knowledge-base";

function mapDoc(row: {
  id: string;
  name: string;
  category: string;
  sourceType: string;
  sourceUrl: string | null;
  content: string;
  status: string;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}): KnowledgeDocument {
  return {
    id: row.id,
    name: row.name,
    category: row.category as KnowledgeCategory,
    sourceType: row.sourceType as KnowledgeSourceType,
    sourceUrl: row.sourceUrl,
    content: row.content,
    status: row.status as KnowledgeStatus,
    fileSize: row.fileSize,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function seedForUser(userId: string) {
  const count = await prisma.knowledgeDocument.count({ where: { userId } });
  if (count > 0) return;

  for (const doc of DEMO_DOCUMENTS) {
    await prisma.knowledgeDocument.create({
      data: {
        userId,
        name: doc.name,
        category: doc.category,
        sourceType: doc.sourceType,
        sourceUrl: doc.sourceUrl,
        content: doc.content,
        status: doc.status,
        fileSize: doc.fileSize,
      },
    });
  }
}

async function fetchUrlText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "InkFitAI-KnowledgeBot/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error("Fetch failed");
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 50000) || `Content imported from ${url}`;
  } catch {
    return `Web page reference: ${url}. Add manual notes or re-import when the site is reachable.`;
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await seedForUser(session.id);

    const rows = await prisma.knowledgeDocument.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents: rows.map(mapDoc) });
  } catch {
    const now = new Date().toISOString();
    return NextResponse.json({
      documents: DEMO_DOCUMENTS.map((d, i) => ({
        id: `demo-${i}`,
        ...d,
        createdAt: now,
        updatedAt: now,
      })),
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

    if (body.action === "upload") {
      const content = String(body.content ?? "").trim();
      if (!content) {
        return NextResponse.json({ error: "No content extracted" }, { status: 400 });
      }

      const row = await prisma.knowledgeDocument.create({
        data: {
          userId: session.id,
          name: String(body.name ?? "Untitled").trim(),
          category: (body.category as KnowledgeCategory) ?? "general",
          sourceType: (body.sourceType as KnowledgeSourceType) ?? "txt",
          content: content.slice(0, 100000),
          status: "ready",
          fileSize: Number(body.fileSize) || content.length,
        },
      });

      return NextResponse.json({ document: mapDoc(row) });
    }

    if (body.action === "import-url") {
      const url = String(body.url ?? "").trim();
      if (!url.startsWith("http")) {
        return NextResponse.json({ error: "Valid URL required" }, { status: 400 });
      }

      const processing = await prisma.knowledgeDocument.create({
        data: {
          userId: session.id,
          name: new URL(url).hostname,
          category: (body.category as KnowledgeCategory) ?? "general",
          sourceType: "url",
          sourceUrl: url,
          content: "",
          status: "processing",
          fileSize: 0,
        },
      });

      const text = await fetchUrlText(url);
      const row = await prisma.knowledgeDocument.update({
        where: { id: processing.id },
        data: { content: text.slice(0, 100000), status: "ready" },
      });

      return NextResponse.json({ document: mapDoc(row) });
    }

    if (body.action === "delete") {
      await prisma.knowledgeDocument.deleteMany({
        where: { id: body.id, userId: session.id },
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "update-category") {
      const row = await prisma.knowledgeDocument.updateMany({
        where: { id: body.id, userId: session.id },
        data: { category: body.category },
      });
      if (row.count === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const updated = await prisma.knowledgeDocument.findUnique({
        where: { id: body.id },
      });
      return NextResponse.json({ document: updated ? mapDoc(updated) : null });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
