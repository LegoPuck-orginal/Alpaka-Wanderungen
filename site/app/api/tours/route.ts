import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tours = await prisma.tour.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      durationMin: true,
      priceCents: true,
      imageUrl: true,
    },
  });
  return NextResponse.json(tours);
}
