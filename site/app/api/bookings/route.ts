import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, slotId, persons } = body || {};
    if (!slotId || !persons || persons < 1) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // TODO: Auth integrieren und userId aus Session beziehen. Vorläufig optional.
    const booking = await prisma.booking.create({
      data: {
        userId: userId ?? (await ensureGuestUser()).id,
        slotId,
        persons,
        status: "pending",
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function ensureGuestUser() {
  const email = "guest@example.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  const hash = await bcrypt.hash("guest", 10);
  return prisma.user.create({
    data: { email, name: "Gast", role: "user", passwordHash: hash },
  });
}
