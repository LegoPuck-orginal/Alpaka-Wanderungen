export default function AdminSecurityPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-2 text-[var(--accent-dark)]">Sicherheit</h1>
      <p className="opacity-80 mb-6">Zwei-Faktor-Authentifizierung (TOTP) für Admins</p>
      <div className="card p-4">
        <p className="opacity-80 mb-2">2FA (TOTP) ist geplant. In Kürze kannst du hier Codes per Authenticator-App verwenden.</p>
        <a className="btn-secondary inline-block mt-2" href="/admin/users">Zu Admins & Rollen</a>
      </div>
    </div>
  );
}
