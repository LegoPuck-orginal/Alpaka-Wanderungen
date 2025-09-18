import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const tour = await prisma.tour.findUnique({
    where: { id: params.id },
    include: {
      slots: {
        orderBy: { start: "asc" },
        select: { id: true, start: true, end: true, capacity: true },
      },
    },
  });
  if (!tour) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tour);
}
