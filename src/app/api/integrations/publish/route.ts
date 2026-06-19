import { NextResponse } from "next/server";
import { gateAuth } from "@/lib/credit-api";
import { publishingService } from "@/lib/integrations/publishing-service";
import { isValidProviderId } from "@/lib/integrations/registry";
import type { IntegrationProviderId } from "@/lib/integrations/types";

export async function POST(req: Request) {
  try {
    const auth = await gateAuth("content:write");
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const providers = Array.isArray(body.providers)
      ? (body.providers as string[]).filter(isValidProviderId)
      : body.provider && isValidProviderId(body.provider)
        ? [body.provider as IntegrationProviderId]
        : await publishingService.getPublishTargets(auth.ctx.user.id);

    if (providers.length === 0) {
      return NextResponse.json({ error: "No connected publish targets" }, { status: 400 });
    }

    const payload = {
      title: String(body.title ?? "Untitled"),
      content: String(body.content ?? ""),
      contentType: body.contentType as "post" | "article" | "page" | "document" | undefined,
      scheduledAt: body.scheduledAt as string | null | undefined,
      metadata: body.metadata as Record<string, unknown> | undefined,
    };

    const results = await Promise.all(
      providers.map(async (provider) => ({
        provider,
        result: await publishingService.publish(auth.ctx.user.id, provider, payload),
      }))
    );

    const allOk = results.every((r) => r.result.success);
    return NextResponse.json({ ok: allOk, results }, { status: allOk ? 200 : 207 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
