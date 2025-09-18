import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { UserCreateSchema, UserRoleSchema, UserPasswordSchema } from "@/lib/schemas";
import bcrypt from "bcryptjs";

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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
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
              <div className="flex flex-wrap gap-3 items-center">
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
