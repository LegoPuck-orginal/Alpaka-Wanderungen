import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reviews = await prisma.review.findMany({
    orderBy: { position: "asc" },
  });

  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, text, rating } = body;

  if (!name || !text) {
    return NextResponse.json({ error: "Name und Text erforderlich" }, { status: 400 });
  }

  const count = await prisma.review.count({ where: { isVisible: true } });
  if (count >= 5) {
    return NextResponse.json({ error: "Maximal 5 sichtbare Bewertungen erlaubt" }, { status: 400 });
  }

  const maxPosition = await prisma.review.findFirst({
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const review = await prisma.review.create({
    data: {
      name,
      text,
      rating: rating || 5,
      position: (maxPosition?.position || -1) + 1,
      isVisible: true,
    },
  });

  return NextResponse.json(review);
}
