import { prisma } from "@/lib/prisma";
import type { WorkspaceSummary } from "@/lib/workspaces";

export async function getActiveWorkspaceIdForUser(userId: string): Promise<string | null> {
  const pref = await prisma.userWorkspacePreference.findUnique({
    where: { userId },
  });
  if (pref?.activeWorkspaceId) {
    const exists = await prisma.workspace.findFirst({
      where: { id: pref.activeWorkspaceId, ownerId: userId },
    });
    if (exists) return exists.id;
  }

  const defaultWs = await prisma.workspace.findFirst({
    where: { ownerId: userId, isDefault: true },
  });
  return defaultWs?.id ?? null;
}

export async function setActiveWorkspaceForUser(userId: string, workspaceId: string) {
  await prisma.userWorkspacePreference.upsert({
    where: { userId },
    create: { userId, activeWorkspaceId: workspaceId },
    update: { activeWorkspaceId: workspaceId },
  });
}

export function mapWorkspace(
  row: {
    id: string;
    name: string;
    slug: string;
    type: string;
    description: string | null;
    icon: string;
    color: string;
    clientId: string | null;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
  stats: { memberCount: number; contentCount: number },
  clientName?: string
): WorkspaceSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type as WorkspaceSummary["type"],
    description: row.description ?? undefined,
    icon: row.icon,
    color: row.color,
    clientId: row.clientId ?? undefined,
    clientName,
    isDefault: row.isDefault,
    memberCount: stats.memberCount,
    contentCount: stats.contentCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getWorkspaceStats(workspaceId: string) {
  const [memberCount, contentCount] = await Promise.all([
    prisma.workspaceMember.count({ where: { workspaceId } }),
    prisma.workspaceContent.count({ where: { workspaceId } }),
  ]);
  return { memberCount, contentCount };
}
