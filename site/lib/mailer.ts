type Mail = { to: string; subject: string; text?: string; html?: string };

export async function sendMail(mail: Mail) {
  // Stub: In Produktion hier z. B. Nodemailer/Resend einbinden
  if (process.env.NODE_ENV !== 'production') {
    console.log('[mail:dev]', mail);
  }
  // TODO: Implementiere echten E-Mail-Versand mit Nodemailer/Resend
  // const transporter = nodemailer.createTransport({...});
  // await transporter.sendMail(mail);
  return { ok: true };
}

export async function sendReviewRequest({
  email,
  bookingCode,
  tourTitle,
  tourDate,
}: {
  email: string;
  bookingCode: string;
  tourTitle: string;
  tourDate: Date;
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const reviewUrl = `${baseUrl}/review?code=${bookingCode}`;
  
  const subject = '🦙 Wie war deine Alpaka-Wanderung?';
  const text = `
Hallo!

Wir hoffen, deine Alpaka-Wanderung "${tourTitle}" am ${tourDate.toLocaleDateString('de-DE')} hat dir gefallen!

Wir würden uns sehr über dein Feedback freuen. Teile deine Erfahrung mit anderen:
${reviewUrl}

Vielen Dank!
Dein Alpaka-Wanderungen Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d3748;">Wie war deine Alpaka-Wanderung? 🦙</h2>
      <p>Hallo!</p>
      <p>Wir hoffen, deine Alpaka-Wanderung <strong>"${tourTitle}"</strong> am <strong>${tourDate.toLocaleDateString('de-DE')}</strong> hat dir gefallen!</p>
      <p>Wir würden uns sehr über dein Feedback freuen. Teile deine Erfahrung mit anderen:</p>
      <p style="margin: 30px 0;">
        <a href="${reviewUrl}" style="background-color: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Bewertung abgeben
        </a>
      </p>
      <p style="color: #718096; font-size: 14px;">
        Vielen Dank!<br>
        Dein Alpaka-Wanderungen Team
      </p>
    </div>
  `;
  
  return sendMail({ to: email, subject, text, html });
}

export async function sendBookingConfirmation({
  email,
  bookingCode,
  tourTitle,
  tourDate,
  persons,
  totalPrice,
}: {
  email: string;
  bookingCode: string;
  tourTitle: string;
  tourDate: Date;
  persons: number;
  totalPrice: number;
}) {
  const subject = '✅ Buchungsbestätigung - Alpaka-Wanderung';
  const text = `
Hallo!

Deine Buchung wurde erfolgreich bestätigt!

Buchungscode: ${bookingCode}
Tour: ${tourTitle}
Datum: ${tourDate.toLocaleDateString('de-DE')} um ${tourDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
Personen: ${persons}
Gesamtpreis: ${(totalPrice / 100).toFixed(2)} €

Wir freuen uns auf dich!
Dein Alpaka-Wanderungen Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d3748;">Buchungsbestätigung ✅</h2>
      <p>Hallo!</p>
      <p>Deine Buchung wurde erfolgreich bestätigt!</p>
      <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Buchungscode:</strong> ${bookingCode}</p>
        <p><strong>Tour:</strong> ${tourTitle}</p>
        <p><strong>Datum:</strong> ${tourDate.toLocaleDateString('de-DE')} um ${tourDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</p>
        <p><strong>Personen:</strong> ${persons}</p>
        <p><strong>Gesamtpreis:</strong> ${(totalPrice / 100).toFixed(2)} €</p>
      </div>
      <p style="color: #718096;">
        Wir freuen uns auf dich!<br>
        Dein Alpaka-Wanderungen Team
      </p>
    </div>
  `;
  
  return sendMail({ to: email, subject, text, html });
}
