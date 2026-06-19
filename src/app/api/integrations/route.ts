import { NextResponse } from "next/server";
import { gateAuth } from "@/lib/credit-api";
import {
  connectDemo,
  disconnectIntegration,
  listConnectionsForUser,
} from "@/lib/integrations/connection-service";
import { isValidProviderId, listIntegrationProviders } from "@/lib/integrations/registry";
import { publishingService } from "@/lib/integrations/publishing-service";
import type { IntegrationProviderId } from "@/lib/integrations/types";

export async function GET() {
  try {
    const auth = await gateAuth("content:read");
    if (!auth.ok) return auth.response;

    const [connections, publishTargets] = await Promise.all([
      listConnectionsForUser(auth.ctx.user.id),
      publishingService.getPublishTargets(auth.ctx.user.id),
    ]);

    return NextResponse.json({
      providers: listIntegrationProviders(),
      connections,
      publishTargets,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const provider = String(body.provider ?? "") as IntegrationProviderId;

    if (!isValidProviderId(provider)) {
      return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
    }

    if (body.action === "disconnect") {
      const auth = await gateAuth("content:write");
      if (!auth.ok) return auth.response;
      await disconnectIntegration(auth.ctx.user.id, provider);
      const connections = await listConnectionsForUser(auth.ctx.user.id);
      return NextResponse.json({ ok: true, connections });
    }

    if (body.action === "sync") {
      const auth = await gateAuth("content:write");
      if (!auth.ok) return auth.response;
      const result = await publishingService.sync(auth.ctx.user.id, provider);
      const connections = await listConnectionsForUser(auth.ctx.user.id);
      return NextResponse.json({ result, connections });
    }

    if (body.action === "demo-connect") {
      const auth = await gateAuth("content:write");
      if (!auth.ok) return auth.response;
      await connectDemo(auth.ctx.user.id, provider, body.metadata ?? {});
      const connections = await listConnectionsForUser(auth.ctx.user.id);
      return NextResponse.json({ ok: true, connections });
    }

    if (body.action === "publish") {
      const auth = await gateAuth("content:write");
      if (!auth.ok) return auth.response;
      const result = await publishingService.publish(auth.ctx.user.id, provider, {
        title: String(body.title ?? "Untitled"),
        content: String(body.content ?? ""),
        contentType: body.contentType,
        scheduledAt: body.scheduledAt,
        metadata: body.metadata,
      });
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
