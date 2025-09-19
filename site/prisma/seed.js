/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const pass = process.env.ADMIN_PASS || 'admin123';
  const passwordHash = await bcrypt.hash(pass, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'admin', twoFactorEnabled: false, twoFactorSecret: null },
    create: { email, name: 'Admin', role: 'admin', passwordHash, twoFactorEnabled: false },
  });
  console.log(`[seed] Admin bereit: ${email} / ${pass}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
