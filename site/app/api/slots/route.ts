import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const tourId = req.nextUrl.searchParams.get("tourId");
  if (!tourId) return NextResponse.json({ error: "Missing tourId" }, { status: 400 });
  const slots = await prisma.eventSlot.findMany({
    where: { tourId },
    orderBy: { start: "asc" },
    select: { id: true, start: true, end: true, capacity: true },
  });
  return NextResponse.json(slots);
}
