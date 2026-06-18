import { NextResponse } from "next/server";
import { generateImage } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await generateImage(body);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
