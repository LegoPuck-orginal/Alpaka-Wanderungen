import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { path, sessionId } = await req.json();
    if (!path || !sessionId) return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
    const referrer = req.headers.get('referer') ?? undefined;
    const userAgent = req.headers.get('user-agent') ?? undefined;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || undefined;
    await prisma.pageView.create({ data: { path, sessionId, referrer, userAgent, ip } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('track error', e);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}