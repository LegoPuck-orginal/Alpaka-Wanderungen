(async () => {
  const [{ PrismaClient }, bcryptModule] = await Promise.all([
    import('@prisma/client'),
    import('bcryptjs'),
  ]);
  const bcrypt = bcryptModule.default ?? bcryptModule;
  const prisma = new PrismaClient();

  try {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const pass = process.env.ADMIN_PASS || 'admin123';
    const passwordHash = await bcrypt.hash(pass, 10);

    await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: 'admin', twoFactorEnabled: false, twoFactorSecret: null },
      create: { email, name: 'Admin', role: 'admin', passwordHash, twoFactorEnabled: false },
    });
    console.log(`[seed] Admin bereit: ${email} / ${pass}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
