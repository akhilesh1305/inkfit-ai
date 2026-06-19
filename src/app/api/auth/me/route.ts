import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAuthContext } from "@/lib/auth-guard";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ user: session });

  return NextResponse.json({
    user: ctx.user,
    platformRole: ctx.platformRole,
    effectiveRole: ctx.effectiveRole,
    workspaceRole: ctx.workspaceRole,
  });
}
