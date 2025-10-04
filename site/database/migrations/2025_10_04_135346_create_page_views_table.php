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
        Schema::create('page_views', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('path');
            $table->string('session_id');
            $table->string('referrer')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamps();

            $table->index('path');
            $table->index('session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_views');
    }
};
