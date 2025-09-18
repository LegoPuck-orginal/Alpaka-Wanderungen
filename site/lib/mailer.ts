type Mail = { to: string; subject: string; text?: string; html?: string };

export async function sendMail(mail: Mail) {
  // Stub: In Produktion hier z. B. Nodemailer/Resend einbinden
  if (process.env.NODE_ENV !== 'production') {
    console.log('[mail:dev]', mail);
  }
  return { ok: true };
}
