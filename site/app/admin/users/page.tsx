import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { UserCreateSchema, UserRoleSchema, UserPasswordSchema } from "@/lib/schemas";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import Image from "next/image";

async function createUser(formData: FormData) {
  'use server';
  const data = Object.fromEntries(formData as unknown as Iterable<readonly [PropertyKey, FormDataEntryValue]>) as Record<string, unknown>;
  const parsed = UserCreateSchema.safeParse(data);
  if (!parsed.success) {
    redirect(`/admin/users?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Ungültige Eingaben')}`);
  }
  const { email, name, password, role } = parsed.data;
  try {
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, name: name || '', role, passwordHash: hash } });
    revalidatePath('/admin/users');
    redirect('/admin/users?success=Benutzer+angelegt');
  } catch {
    redirect('/admin/users?error=Benutzer+konnte+nicht+angelegt+werden');
  }
}

async function updateRole(formData: FormData) {
  'use server';
  const data = Object.fromEntries(formData as unknown as Iterable<readonly [PropertyKey, FormDataEntryValue]>) as Record<string, unknown>;
  const parsed = UserRoleSchema.safeParse(data);
  if (!parsed.success) {
    redirect(`/admin/users?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Ungültige Eingaben')}`);
  }
  const { id, role } = parsed.data;
  try {
    if (role === 'user') {
      // Verhindere, dass letzter Admin entfernt wird
      const adminCount = await prisma.user.count({ where: { role: 'admin' } });
      const current = await prisma.user.findUnique({ where: { id } });
      if (current?.role === 'admin' && adminCount <= 1) {
        redirect('/admin/users?error=Letzten+Admin+kannst+du+nicht+herabstufen');
      }
    }
    await prisma.user.update({ where: { id }, data: { role } });
    revalidatePath('/admin/users');
    redirect('/admin/users?success=Rolle+aktualisiert');
  } catch {
    redirect('/admin/users?error=Rolle+konnte+nicht+aktualisiert+werden');
  }
}

async function resetPassword(formData: FormData) {
  'use server';
  const data = Object.fromEntries(formData as unknown as Iterable<readonly [PropertyKey, FormDataEntryValue]>) as Record<string, unknown>;
  const parsed = UserPasswordSchema.safeParse(data);
  if (!parsed.success) {
    redirect(`/admin/users?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Ungültige Eingaben')}`);
  }
  const { id, password } = parsed.data;
  try {
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id }, data: { passwordHash: hash } });
    revalidatePath('/admin/users');
    redirect('/admin/users?success=Passwort+gesetzt');
  } catch {
    redirect('/admin/users?error=Passwort+konnte+nicht+gesetzt+werden');
  }
}

async function deleteUser(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  try {
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) redirect('/admin/users?error=Benutzer+nicht+gefunden');
    if (u?.role === 'admin') {
      const adminCount = await prisma.user.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        redirect('/admin/users?error=Letzten+Admin+kannst+du+nicht+löschen');
      }
    }
    await prisma.user.delete({ where: { id } });
    revalidatePath('/admin/users');
    redirect('/admin/users?success=Benutzer+gelöscht');
  } catch {
    redirect('/admin/users?error=Benutzer+konnte+nicht+gelöscht+werden');
  }
}

export default async function UsersAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const sp = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 text-[var(--accent-dark)]">Benutzer verwalten</h1>
      <p className="opacity-80 mb-6">Admins anlegen, Rollen ändern und Passwörter setzen</p>
      <nav className="mb-6 text-sm"><a className="underline" href="/admin">← Zurück zum Admin</a></nav>
      {sp?.error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2">{sp.error}</div>
      )}
      {sp?.success && (
        <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 px-3 py-2">{sp.success}</div>
      )}

      <form action={createUser} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4 grid sm:grid-cols-4 gap-4 mb-8">
        <div>
          <label className="block text-sm mb-1">E-Mail</label>
          <input name="email" type="email" required className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" />
        </div>
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" />
        </div>
        <div>
          <label className="block text-sm mb-1">Passwort</label>
          <input name="password" type="password" required className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" />
        </div>
        <div>
          <label className="block text-sm mb-1">Rolle</label>
          <select name="role" defaultValue="admin" className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent">
            <option value="admin">admin</option>
            <option value="user">user</option>
          </select>
        </div>
        <div className="sm:col-span-4"><button className="px-4 py-2 rounded bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-dark)]">Benutzer anlegen</button></div>
      </form>

      <div className="grid gap-3">
        {users.map(u => (
          <div key={u.id} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold">{u.name || '—'} <span className="opacity-70">&lt;{u.email}&gt;</span></div>
                <div className="text-sm opacity-80">Rolle: {u.role}</div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <form action={updateRole} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={u.id} />
                  <select name="role" defaultValue={u.role} className="px-3 py-2 rounded border border-[var(--border)] bg-transparent">
                    <option value="admin">admin</option>
                    <option value="user">user</option>
                  </select>
                  <button className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--accent)]/10">Rolle speichern</button>
                </form>
                <form action={resetPassword} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={u.id} />
                  <input name="password" type="password" placeholder="Neues Passwort" className="px-3 py-2 rounded border border-[var(--border)] bg-transparent" />
                  <button className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--accent)]/10">Passwort setzen</button>
                </form>
                {/* 2FA Bereich */}
                <TwoFactorBlock userId={u.id} email={u.email} twoFactorEnabled={Boolean(u.twoFactorEnabled)} />
                <form action={deleteUser}>
                  <input type="hidden" name="id" value={u.id} />
                  <button className="px-3 py-2 rounded border border-[var(--border)] hover:bg-red-500/10">Löschen</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function enable2FA(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) redirect('/admin/users?error=Benutzer+nicht+gefunden');
  const secret = authenticator.generateSecret();
  await prisma.user.update({ where: { id }, data: { twoFactorSecret: secret } });
  revalidatePath('/admin/users');
}

async function verify2FA(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const token = String(formData.get('token'));
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u?.twoFactorSecret) redirect('/admin/users?error=Kein+2FA-Secret+gesetzt');
  const valid = authenticator.verify({ token, secret: u.twoFactorSecret });
  if (!valid) redirect('/admin/users?error=Code+ungültig');
  await prisma.user.update({ where: { id }, data: { twoFactorEnabled: true } });
  revalidatePath('/admin/users');
  redirect('/admin/users?success=2FA+aktiviert');
}

async function disable2FA(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  await prisma.user.update({ where: { id }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
  revalidatePath('/admin/users');
  redirect('/admin/users?success=2FA+deaktiviert');
}

async function TwoFactorBlock({ userId, email, twoFactorEnabled }: { userId: string; email: string; twoFactorEnabled: boolean }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const secret = user?.twoFactorSecret ?? null;
  const label = encodeURIComponent(`AlpakaWanderungen:${email}`);
  const issuer = encodeURIComponent('AlpakaWanderungen');
  const otpauth = secret ? `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}` : null;
  const qr = otpauth ? await QRCode.toDataURL(otpauth) : null;
  return (
    <div className="border border-[var(--border)] rounded-md p-3">
      <div className="text-sm font-medium mb-2">Zwei-Faktor-Auth</div>
      {twoFactorEnabled ? (
        <form action={disable2FA} className="flex items-center gap-2">
          <input type="hidden" name="id" value={userId} />
          <button className="btn-secondary">2FA deaktivieren</button>
        </form>
      ) : (
        <div className="flex flex-col gap-2">
          {!secret ? (
            <form action={enable2FA}>
              <input type="hidden" name="id" value={userId} />
              <button className="btn-secondary">2FA einrichten</button>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              {qr && (
                <Image
                  src={qr}
                  alt="2FA QR Code"
                  width={96}
                  height={96}
                  unoptimized
                  className="h-24 w-24 border border-[var(--border)] rounded"
                />
              )}
              <div className="text-xs opacity-80 break-all">
                <div>Secret: <code>{secret}</code></div>
                <div>Scanne den QR-Code mit deiner Authenticator-App und gib den 6-stelligen Code ein.</div>
                <form action={verify2FA} className="mt-2 flex items-center gap-2">
                  <input type="hidden" name="id" value={userId} />
                  <input name="token" inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="123456" className="px-2 py-1 rounded border border-[var(--border)] bg-transparent" />
                  <button className="btn-primary">Aktivieren</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
