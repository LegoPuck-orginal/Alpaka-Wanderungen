#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync, spawn } = require('child_process');

const root = process.cwd();
console.log(`[quickstart] working dir: ${root}`);

function run(cmd, args, opts = {}) {
  console.log(`[quickstart] ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (res.status !== 0) {
    console.error(`[quickstart] command failed: ${cmd} ${args.join(' ')}`);
    process.exit(res.status || 1);
  }
}

// 1) Ensure folders
fs.mkdirSync(path.join(root, 'prisma'), { recursive: true });
fs.mkdirSync(path.join(root, 'public', 'uploads'), { recursive: true });

// 2) Create .env if missing, else normalize DATABASE_URL to absolute file path
const envFile = path.join(root, '.env');
if (!fs.existsSync(envFile)) {
  const secret = crypto.randomBytes(32).toString('base64');
  const dbPath = `file:${path.join(root, 'prisma', 'data.db')}`;
  const content = [
    'NODE_ENV=production',
    `DATABASE_URL="${dbPath}"`,
    'NEXTAUTH_URL=http://127.0.0.1:3000',
    `NEXTAUTH_SECRET=${secret}`,
    '',
  ].join('\n');
  fs.writeFileSync(envFile, content, 'utf8');
  console.log('[quickstart] wrote .env');
} else {
  try {
    const txt = fs.readFileSync(envFile, 'utf8');
    let changed = false;
    const normalized = txt.split(/\r?\n/).map((line) => {
      const m = line.match(/^\s*DATABASE_URL\s*=\s*"?file:(.+?)"?\s*$/);
      if (m) {
        const raw = m[1].trim();
        const abs = raw.startsWith('/') ? raw : path.join(root, raw.replace(/^\.\//, ''));
        const newLine = `DATABASE_URL="file:${abs}"`;
        if (newLine !== line) changed = true;
        return newLine;
      }
      return line;
    }).join('\n');
    if (changed) {
      fs.writeFileSync(envFile, normalized, 'utf8');
      console.log('[quickstart] normalized DATABASE_URL to absolute path in .env');
    }
  } catch (e) {
    console.warn('[quickstart] could not normalize .env:', e?.message);
  }
}

// Mirror to .env.production if missing
const envProd = path.join(root, '.env.production');
if (!fs.existsSync(envProd)) {
  fs.copyFileSync(envFile, envProd);
  console.log('[quickstart] wrote .env.production');
} else {
  try {
    // Keep DATABASE_URL in production env aligned with .env if it differs
    const base = fs.readFileSync(envFile, 'utf8');
    const prod = fs.readFileSync(envProd, 'utf8');
    const mBase = base.match(/^\s*DATABASE_URL\s*=\s*.*$/m);
    const mProd = prod.match(/^\s*DATABASE_URL\s*=\s*.*$/m);
    if (mBase && (!mProd || mProd[0] !== mBase[0])) {
      const updated = mProd ? prod.replace(mProd[0], mBase[0]) : `${prod.trim()}\n${mBase[0]}\n`;
      fs.writeFileSync(envProd, updated, 'utf8');
      console.log('[quickstart] synced DATABASE_URL to .env.production');
    }
  } catch (e) {
    console.warn('[quickstart] could not sync .env.production:', e?.message);
  }
}

// 3) Prisma generate + db push
run('npx', ['prisma', 'generate']);
run('npx', ['prisma', 'db', 'push']);

// 4) Seed admin user
(async () => {
  const { PrismaClient } = require('@prisma/client');
  const bcrypt = require('bcryptjs');
  const prisma = new PrismaClient();
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const pass = process.env.ADMIN_PASS || 'admin123';
    const hash = await bcrypt.hash(pass, 10);
    await prisma.user.upsert({
      where: { email },
      update: { passwordHash: hash, role: 'admin', twoFactorEnabled: false, twoFactorSecret: null },
      create: { email, passwordHash: hash, role: 'admin', name: 'Admin', twoFactorEnabled: false },
    });
    console.log(`[quickstart] admin ready: ${email} / ${pass}`);
  } catch (e) {
    console.warn('[quickstart] admin seed skipped or failed:', e?.message);
  } finally {
    await prisma.$disconnect();
  }

  // 5) Build
  run('npm', ['run', 'build']);

  // 6) Start Next on 0.0.0.0:3000
  console.log('[quickstart] starting Next on 0.0.0.0:3000');
  const child = spawn('npx', ['next', 'start', '-p', '3000', '-H', '0.0.0.0'], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code ?? 0));
})();
