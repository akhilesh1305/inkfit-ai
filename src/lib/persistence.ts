import { prisma } from "@/lib/prisma";

export type ContentFeature =
  | "blog"
  | "social"
  | "linkedin"
  | "carousel"
  | "seo"
  | "repurpose"
  | "video"
  | "landing"
  | "marketing_strategy"
  | "marketing_os"
  | "analyzer"
  | "competitor"
  | "employee"
  | "agent"
  | "other";

export interface SaveGeneratedContentInput {
  userId: string;
  workspaceId?: string | null;
  feature: ContentFeature | string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  status?: string;
}

export async function getActiveWorkspaceId(userId: string): Promise<string | null> {
  try {
    const pref = await prisma.userWorkspacePreference.findUnique({
      where: { userId },
      select: { activeWorkspaceId: true },
    });
    return pref?.activeWorkspaceId ?? null;
  } catch {
    return null;
  }
}

export async function saveGeneratedContent(input: SaveGeneratedContentInput) {
  const workspaceId = input.workspaceId ?? (await getActiveWorkspaceId(input.userId));

  const row = await prisma.generatedContent.create({
    data: {
      userId: input.userId,
      workspaceId,
      feature: input.feature,
      title: input.title.slice(0, 500),
      body: input.body,
      metadata: JSON.stringify(input.metadata ?? {}),
      status: input.status ?? "draft",
    },
  });

  try {
    const { recordGeneratedAttribution } = await import("@/lib/attribution/insights");
    await recordGeneratedAttribution({
      userId: input.userId,
      workspaceId,
      generatedContentId: row.id,
      feature: input.feature,
      title: input.title,
      body: input.body,
      metadata: input.metadata,
    });
  } catch {
    /* non-blocking */
  }

  return row;
}

export async function logPromptUse(
  userId: string,
  opts: { promptId?: string; promptText?: string; feature?: string }
) {
  try {
    await prisma.promptUseLog.create({
      data: {
        userId,
        promptId: opts.promptId ?? null,
        promptText: opts.promptText?.slice(0, 2000) ?? null,
        feature: opts.feature ?? null,
      },
    });
  } catch {
    /* non-blocking */
  }
}

export async function getBrandKitForUser(userId: string) {
  return prisma.brandKit.findUnique({ where: { userId } });
}

export async function upsertBrandKitForUser(
  userId: string,
  data: {
    companyName: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    targetAudience: string;
    writingStyle: string;
    tone: string;
    industry?: string | null;
  }
) {
  const existing = await prisma.brandKit.findUnique({ where: { userId } });
  if (existing) {
    return prisma.brandKit.update({ where: { userId }, data });
  }
  return prisma.brandKit.create({ data: { ...data, userId } });
}

export async function getBrandVoiceForUser(userId: string) {
  return prisma.brandVoiceProfile.findUnique({ where: { userId } });
}

export async function upsertBrandVoiceProfile(
  userId: string,
  data: {
    brandName: string;
    industry?: string | null;
    targetAudience: string;
    writingStyle: string;
    trainingSamples?: string | null;
    profileData: string;
  }
) {
  return prisma.brandVoiceProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export async function syncCalendarPlan(
  userId: string,
  items: {
    id: string;
    topic: string;
    date: string;
    contentType?: string;
    platformId?: string;
    status?: string;
    [key: string]: unknown;
  }[]
) {
  const workspaceId = await getActiveWorkspaceId(userId);

  await prisma.calendarEvent.deleteMany({ where: { userId } });

  for (const item of items) {
    const { id, topic, date, contentType, platformId, status, ...rest } = item;
    await prisma.calendarEvent.create({
      data: {
        id,
        userId,
        workspaceId,
        title: topic,
        type: mapCalendarType(String(contentType ?? "social")),
        date,
        status: mapCalendarStatus(String(status ?? "draft")),
        platform: platformId ? String(platformId) : null,
        metadata: JSON.stringify(rest),
      },
    });
  }
}

export async function loadCalendarPlan(userId: string) {
  const events = await prisma.calendarEvent.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });

  return events.map((e) => {
    let extra: Record<string, unknown> = {};
    try {
      extra = JSON.parse(e.metadata || "{}") as Record<string, unknown>;
    } catch {
      /* ignore */
    }
    return {
      id: e.id,
      topic: e.title,
      date: e.date,
      contentType: e.type,
      platformId: e.platform ?? undefined,
      status: e.status,
      ...extra,
    };
  });
}

function mapCalendarType(contentType: string): string {
  const map: Record<string, string> = {
    blog: "blog",
    carousel: "carousel",
    thread: "social",
    reel: "image",
    "thought-leadership": "linkedin",
    educational: "linkedin",
    story: "social",
    "case-study": "blog",
    linkedin: "linkedin",
    instagram: "social",
    newsletter: "newsletter",
  };
  return map[contentType] ?? "social";
}

function mapCalendarStatus(status: string): string {
  if (status === "in-progress") return "scheduled";
  return status;
}

export async function getWorkspaceSettings(userId: string): Promise<Record<string, unknown>> {
  try {
    const pref = await prisma.userWorkspacePreference.findUnique({
      where: { userId },
      select: { settings: true },
    });
    if (!pref?.settings) return {};
    return JSON.parse(pref.settings) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function updateWorkspaceSettings(
  userId: string,
  patch: Record<string, unknown>
) {
  const current = await getWorkspaceSettings(userId);
  const merged = { ...current, ...patch };

  return prisma.userWorkspacePreference.upsert({
    where: { userId },
    create: {
      userId,
      settings: JSON.stringify(merged),
    },
    update: {
      settings: JSON.stringify(merged),
    },
  });
}
