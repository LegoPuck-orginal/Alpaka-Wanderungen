import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, text, rating, bookingCode } = body;

    if (!name || !text) {
      return NextResponse.json({ error: "Name und Text erforderlich" }, { status: 400 });
    }

    // Optional: Validiere Buchungscode (verhindert Spam)
    if (bookingCode) {
      const booking = await prisma.booking.findUnique({
        where: { code: bookingCode },
        select: { id: true, status: true },
      });

      if (!booking || booking.status !== "confirmed") {
        return NextResponse.json({ error: "Ungültiger Buchungscode" }, { status: 400 });
      }
    }

    // Erstelle Review (initial unsichtbar für Admin-Prüfung)
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
        isVisible: false, // Admin muss erst freigeben
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("[review/submit] Fehler:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
