import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { positions } = body as { positions: { id: string; position: number }[] };

  // Update positions
  for (const { id, position } of positions) {
    await prisma.review.update({
      where: { id },
      data: { position },
    });
  }

  return NextResponse.json({ success: true });
}
