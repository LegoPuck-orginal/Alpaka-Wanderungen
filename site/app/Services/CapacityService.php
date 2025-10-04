<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\EventSlot;

class CapacityService
{
    public function remainingCapacity(EventSlot $slot): int
    {
        $slotCapacity = min($slot->capacity, $slot->tour->capacity);

        $bookedPersons = $slot->bookings()
            ->whereNotIn('status', [Booking::STATUS_CANCELED])
            ->sum('persons');

        return max(0, $slotCapacity - $bookedPersons);
    }

    public function warningsFor(EventSlot $slot, int $requestedPersons): array
    {
        $warnings = [];
        $tourCapacity = $slot->tour->capacity;
        $remaining = $this->remainingCapacity($slot);

        if ($requestedPersons > $tourCapacity) {
            $warnings[] = sprintf(
                '⚠️ Wir haben nur %d Alpakas. Nicht alle können ein eigenes Alpaka führen.',
                $tourCapacity
            );
        }

        if ($requestedPersons > $remaining) {
            $warnings[] = sprintf(
                '❌ Nur noch %d Plätze verfügbar!',
                $remaining
            );
        }

        return $warnings;
    }
}
