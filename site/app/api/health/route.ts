import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Schnelltest: einfache Query, die keine Tabellen ändert
    const users = await prisma.user.count();
    return NextResponse.json({ ok: true, db: true, users });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, db: false, error: msg }, { status: 500 });
  }
}
