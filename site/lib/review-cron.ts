import { prisma } from "@/lib/prisma";
import { sendReviewRequest } from "@/lib/mailer";

/**
 * Cron-Job oder manuell aufrufbar:
 * Sendet Review-Anfragen an Kunden, deren Wanderung bereits stattgefunden hat
 */
export async function sendPendingReviewRequests() {
  const now = new Date();
  
  // Finde alle bestätigten Buchungen, deren Slot bereits vorbei ist
  // und bei denen noch keine Review-Anfrage gesendet wurde
  const bookings = await prisma.booking.findMany({
    where: {
      status: 'confirmed',
      slot: {
        end: {
          lt: now, // Slot ist bereits vorbei
        },
      },
      // Optionales Flag: reviewRequestSent (würde im Schema hinzugefügt werden)
      // reviewRequestSent: false,
    },
    include: {
      slot: {
        include: {
          tour: {
            select: { title: true },
          },
        },
      },
    },
    take: 50, // Limit pro Durchlauf
  });

  console.log(`[review-cron] Gefunden: ${bookings.length} Buchungen für Review-Anfragen`);

  for (const booking of bookings) {
    if (!booking.contactEmail || !booking.code) continue;

    try {
      await sendReviewRequest({
        email: booking.contactEmail,
        bookingCode: booking.code,
        tourTitle: booking.slot.tour.title,
        tourDate: booking.slot.start,
      });

      // Optinal: Markiere als gesendet (würde Schema-Update benötigen)
      // await prisma.booking.update({
      //   where: { id: booking.id },
      //   data: { reviewRequestSent: true },
      // });

      console.log(`[review-cron] ✓ E-Mail gesendet an ${booking.contactEmail} für Buchung ${booking.code}`);
    } catch (error) {
      console.error(`[review-cron] ✗ Fehler bei Buchung ${booking.code}:`, error);
    }
  }

  return { processed: bookings.length };
}
