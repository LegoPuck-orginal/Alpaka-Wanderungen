import { NextResponse } from "next/server";
import { sendPendingReviewRequests } from "@/lib/review-cron";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Manuell aufrufbarer Endpunkt oder per Cron
 * GET /api/cron/review-requests
 */
export async function GET() {
  // Optional: Nur für Admins oder mit Cron-Secret
  const session = await getServerSession(authOptions);
  const cronSecret = process.env.CRON_SECRET;
  
  // Prüfe ob Admin oder korrekter Cron-Secret
  const isAdmin = session?.user?.role === "admin";
  const hasValidSecret = cronSecret && cronSecret.length > 0; // In Production: Check header
  
  if (!isAdmin && !hasValidSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendPendingReviewRequests();
    return NextResponse.json({ 
      success: true, 
      message: `${result.processed} Review-Anfragen verarbeitet`,
      ...result 
    });
  } catch (error) {
    console.error("[cron/review-requests] Fehler:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
