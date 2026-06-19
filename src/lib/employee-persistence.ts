import { prisma } from "@/lib/prisma";
import {
  saveGeneratedContent,
  syncCalendarPlan,
} from "@/lib/persistence";
import type {
  BlogIdea,
  EmployeeRun,
  EmployeeStepId,
  ImageAsset,
  LinkedInPostDraft,
  PublishScheduleItem,
  StrategyOutput,
} from "@/lib/marketing-employee";

const OPTIMAL_TIMES = ["09:00", "12:30", "17:00", "10:00", "14:00"];

function enrichScheduleItems(items: PublishScheduleItem[]): PublishScheduleItem[] {
  return items.map((item, i) => ({
    ...item,
    suggestedTime: item.suggestedTime ?? OPTIMAL_TIMES[i % OPTIMAL_TIMES.length],
    dayOfWeek: item.dayOfWeek ?? new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
  }));
}

export async function persistEmployeeStep(
  userId: string,
  goal: string,
  stepId: EmployeeStepId,
  output: unknown
) {
  switch (stepId) {
    case "strategy": {
      const data = output as StrategyOutput;
      await prisma.marketingOSPlan.create({
        data: {
          userId,
          goal,
          title: `Employee Strategy — ${goal.slice(0, 60)}`,
          data: JSON.stringify(data),
        },
      });
      break;
    }
    case "blog_ideas": {
      const ideas = output as BlogIdea[];
      for (const idea of ideas.slice(0, 5)) {
        await saveGeneratedContent({
          userId,
          feature: "employee",
          title: idea.title,
          body: `${idea.angle}\n\nTarget keyword: ${idea.keyword}`,
          metadata: { type: "blog_idea", goal, keyword: idea.keyword },
          status: "draft",
        });
      }
      break;
    }
    case "linkedin_posts": {
      const posts = output as LinkedInPostDraft[];
      for (const post of posts) {
        await saveGeneratedContent({
          userId,
          feature: "employee",
          title: post.title,
          body: `${post.hook}\n\n${post.body}\n\n${post.cta}`,
          metadata: { type: "linkedin_post", goal },
          status: "draft",
        });
      }
      break;
    }
    case "images": {
      const images = output as ImageAsset[];
      for (const img of images) {
        await prisma.imageStudioItem.create({
          data: {
            userId,
            prompt: img.prompt,
            style: img.style,
            aspectRatio: "1:1",
            url: img.url,
          },
        });
      }
      break;
    }
    case "calendar": {
      const items = enrichScheduleItems(output as PublishScheduleItem[]);
      await syncCalendarPlan(
        userId,
        items.map((item) => ({
          id: item.id,
          topic: item.topic,
          date: item.date,
          contentType: item.contentType,
          platformId: item.platformId,
          status: "scheduled",
          suggestedTime: item.suggestedTime,
          dayOfWeek: item.dayOfWeek,
        }))
      );
      break;
    }
    default:
      break;
  }
}

export async function persistApprovedEmployeeRun(userId: string, run: EmployeeRun) {
  const approved = run.steps.filter((s) => s.status === "approved" && s.output != null);

  for (const step of approved) {
    await persistEmployeeStep(userId, run.goal, step.id, step.output);
  }
}
