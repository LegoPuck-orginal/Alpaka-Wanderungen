import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDefaultSlots, addDays } from "@/lib/defaultSlots";

export async function GET(req: NextRequest) {
  const tourId = req.nextUrl.searchParams.get("tourId");
  if (!tourId) return NextResponse.json({ error: "Missing tourId" }, { status: 400 });
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = addDays(start, 60);
  await ensureDefaultSlots({ tourId, start, end });
  const slots = await prisma.eventSlot.findMany({
    where: { tourId, start: { gte: start, lte: end } },
    orderBy: { start: "asc" },
    select: { id: true, start: true, end: true, capacity: true },
  });
  return NextResponse.json(slots);
}
