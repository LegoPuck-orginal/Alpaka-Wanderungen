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
        Schema::create('bookings', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('code')->nullable()->unique();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('slot_id')->constrained('event_slots')->cascadeOnDelete();
            $table->unsignedInteger('persons')->default(1);
            $table->string('contact_email')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('review_requested_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('slot_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
