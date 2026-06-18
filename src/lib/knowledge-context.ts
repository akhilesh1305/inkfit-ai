import { prisma } from "@/lib/prisma";
import { formatKnowledgeContext, type KnowledgeCategory } from "@/lib/knowledge-base";

export async function getKnowledgeContextForUser(userId: string): Promise<string> {
  try {
    const docs = await prisma.knowledgeDocument.findMany({
      where: { userId, status: "ready" },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: { name: true, category: true, content: true },
    });
    return formatKnowledgeContext(
      docs.map((d) => ({
        name: d.name,
        content: d.content,
        category: d.category as KnowledgeCategory,
      }))
    );
  } catch {
    return "";
  }
}

export async function appendKnowledgeToPrompt(
  userId: string,
  systemPrompt: string
): Promise<string> {
  const kb = await getKnowledgeContextForUser(userId);
  if (!kb) return systemPrompt;
  return `${systemPrompt}\n\n${kb}`;
}
