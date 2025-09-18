import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // clean (idempotent-ish for dev)
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.eventSlot.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.user.deleteMany();
  await prisma.content?.deleteMany?.();

  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin',
      passwordHash,
    },
  });

  const tours = await prisma.$transaction([
    prisma.tour.create({
      data: {
        title: 'Wald & Wiese',
        description: 'Gemütliche Runde durch Wald und Wiesen mit unseren sanften Alpakas.',
        durationMin: 75,
        priceCents: 3500,
        capacity: 10,
        imageUrl: null,
      },
    }),
    prisma.tour.create({
      data: {
        title: 'Sonnenuntergangs-Tour',
        description: 'Golden Hour mit Alpakas – perfekte Fotos garantiert.',
        durationMin: 90,
        priceCents: 4900,
        capacity: 8,
        imageUrl: null,
      },
    }),
  ]);

  const [t1, t2] = tours;
  const now = new Date();

  function addHours(date, h) {
    const d = new Date(date);
    d.setHours(d.getHours() + h);
    return d;
  }

  await prisma.$transaction([
    prisma.eventSlot.create({
      data: { tourId: t1.id, start: addHours(now, 24), end: addHours(now, 25), capacity: 10 },
    }),
    prisma.eventSlot.create({
      data: { tourId: t1.id, start: addHours(now, 48), end: addHours(now, 49), capacity: 10 },
    }),
    prisma.eventSlot.create({
      data: { tourId: t2.id, start: addHours(now, 72), end: addHours(now, 73), capacity: 8 },
    }),
  ]);

  console.log('Seed completed. Admin:', admin.email);

  // Content-Defaults
  try {
    await prisma.$transaction([
      prisma.content.upsert({ where: { key: 'hero.title' }, update: { value: 'Alpaka Wanderungen' }, create: { key: 'hero.title', value: 'Alpaka Wanderungen' } }),
      prisma.content.upsert({ where: { key: 'hero.subtitle' }, update: { value: 'Erlebe unvergessliche Touren mit unseren Alpakas in der Natur. Jetzt Termin reservieren und entspannen!' }, create: { key: 'hero.subtitle', value: 'Erlebe unvergessliche Touren mit unseren Alpakas in der Natur. Jetzt Termin reservieren und entspannen!' } }),
      prisma.content.upsert({ where: { key: 'hero.cta' }, update: { value: 'Jetzt Termin buchen' }, create: { key: 'hero.cta', value: 'Jetzt Termin buchen' } }),
    ]);
  } catch {}
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
