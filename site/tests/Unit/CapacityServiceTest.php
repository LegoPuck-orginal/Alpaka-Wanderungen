<?php

namespace Tests\Unit;

use App\Models\Booking;
use App\Models\EventSlot;
use App\Models\Tour;
use App\Services\CapacityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CapacityServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_remaining_capacity_accounts_for_existing_bookings(): void
    {
        $tour = Tour::factory()->create(['capacity' => 8]);
        $slot = EventSlot::factory()->for($tour)->create(['capacity' => 10]);

        Booking::factory()->create([
            'slot_id' => $slot->id,
            'user_id' => $this->createUser()->id,
            'persons' => 3,
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        Booking::factory()->create([
            'slot_id' => $slot->id,
            'user_id' => $this->createUser()->id,
            'persons' => 2,
            'status' => Booking::STATUS_PENDING,
        ]);

        $service = new CapacityService();

        $remaining = $service->remainingCapacity($slot->fresh(['bookings', 'tour']));

        $this->assertSame(3, $remaining);
    }

    public function test_warnings_indicate_over_alpaca_capacity_and_availability(): void
    {
        $tour = Tour::factory()->create(['capacity' => 4]);
        $slot = EventSlot::factory()->for($tour)->create(['capacity' => 6]);

        Booking::factory()->create([
            'slot_id' => $slot->id,
            'user_id' => $this->createUser()->id,
            'persons' => 3,
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        $service = new CapacityService();
        $warnings = $service->warningsFor($slot->fresh(['bookings', 'tour']), 6);

        $this->assertCount(2, $warnings);
    $this->assertStringContainsString('4 Alpakas', $warnings[0]);
        $this->assertStringContainsString('Nur noch', $warnings[1]);
    }

    private function createUser()
    {
        return \App\Models\User::factory()->create();
    }
}
