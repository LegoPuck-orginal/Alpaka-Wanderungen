<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('event_slots', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tour_id')->constrained('tours')->cascadeOnDelete();
            $table->timestamp('start');
            $table->timestamp('end');
            $table->unsignedInteger('capacity');
            $table->timestamps();

            $table->index(['tour_id', 'start']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_slots');
    }
};
