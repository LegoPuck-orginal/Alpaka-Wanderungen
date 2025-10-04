import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ensureDefaultSlots,
  getSlotTimeOfDay,
  formatDateKey,
} from "@/lib/defaultSlots";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const tourId = searchParams.get("tourId");

  if (!start || !end) {
    return NextResponse.json({ error: "start and end required" }, { status: 400 });
  }

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const inclusiveEnd = new Date(endDate);
    inclusiveEnd.setHours(23, 59, 59, 999);

    await ensureDefaultSlots({ start: startDate, end: inclusiveEnd, tourId: tourId ?? undefined });

    const slots = await prisma.eventSlot.findMany({
      where: {
        start: { gte: startDate },
        end: { lte: inclusiveEnd },
        ...(tourId && { tourId }),
      },
      include: {
        tour: {
          select: { id: true, title: true },
        },
        bookings: {
          where: {
            status: { in: ["pending", "confirmed"] },
          },
          select: { persons: true },
        },
      },
      orderBy: { start: "asc" },
    });

    const slotsWithAvailability = slots.map((slot) => {
      const booked = slot.bookings.reduce((sum, b) => sum + b.persons, 0);
      const available = slot.capacity - booked;
      return {
        id: slot.id,
        start: slot.start,
        end: slot.end,
        capacity: slot.capacity,
        booked,
        available,
        tour: slot.tour,
        timeOfDay: getSlotTimeOfDay(slot.start),
        dateKey: formatDateKey(slot.start),
      };
    });

    return NextResponse.json({ slots: slotsWithAvailability });
  } catch (error) {
    console.error("[slots/calendar] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
