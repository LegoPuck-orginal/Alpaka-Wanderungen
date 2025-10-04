<?php

namespace App\Console\Commands;

use App\Mail\ReviewRequestMail;
use App\Models\Booking;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendReviewRequests extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reviews:send-requests {--dry : Zeigt nur an, welche E-Mails gesendet würden}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sendet nach einer Wanderung automatisch E-Mail-Anfragen zur Bewertung.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = (bool) $this->option('dry');

        $bookings = Booking::query()
            ->with(['user', 'slot.tour'])
            ->where('status', Booking::STATUS_CONFIRMED)
            ->whereNull('review_requested_at')
            ->whereHas('slot', function ($query) {
                $query->where('end', '<=', now()->subHours(1));
            })
            ->get();

        if ($bookings->isEmpty()) {
            $this->info('Keine Buchungen gefunden, die eine Review-Anfrage benötigen.');
            return Command::SUCCESS;
        }

        $this->info(sprintf('%d Review-Anfragen werden verarbeitet%s.', $bookings->count(), $dryRun ? ' (Dry-Run)' : ''));

        foreach ($bookings as $booking) {
            $recipient = $booking->contact_email ?? $booking->user?->email;

            if (! $recipient) {
                $this->warn("Buchung {$booking->id} besitzt keine Kontakt-E-Mail. Übersprungen.");
                continue;
            }

            if ($dryRun) {
                $this->line("[Dry] Würde E-Mail an {$recipient} senden (Buchung {$booking->code}).");
                continue;
            }

            Mail::to($recipient)->send(new ReviewRequestMail($booking));

            $booking->update([
                'review_requested_at' => now(),
            ]);

            Log::info('Review request mailed.', [
                'booking_id' => $booking->id,
                'recipient' => $recipient,
            ]);

            $this->line("Review-Anfrage an {$recipient} gesendet (Buchung {$booking->code}).");
        }

        return Command::SUCCESS;
    }
}
