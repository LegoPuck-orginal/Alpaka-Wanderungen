import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;

  try {
    const slot = await prisma.eventSlot.findUnique({
      where: { id },
      select: { capacity: true },
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    const agg = await prisma.booking.aggregate({
      _sum: { persons: true },
      where: { slotId: id, status: { in: ["pending", "confirmed"] } },
    });

    const used = agg._sum.persons ?? 0;
    const available = slot.capacity - used;

    return NextResponse.json({ available, capacity: slot.capacity, used });
  } catch (error) {
    console.error("[slots/availability] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
