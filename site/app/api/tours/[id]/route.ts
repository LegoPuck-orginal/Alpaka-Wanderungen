import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      slots: {
        orderBy: { start: "asc" },
        select: { id: true, start: true, end: true, capacity: true },
      },
    },
  });
  if (!tour) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(JSON.stringify(tour), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
