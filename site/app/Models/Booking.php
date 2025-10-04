<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory, HasUlids;

    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_CANCELED = 'canceled';

    protected $fillable = [
        'code',
        'user_id',
        'slot_id',
        'persons',
        'contact_email',
        'status',
        'review_requested_at',
    ];

    protected $casts = [
        'persons' => 'integer',
        'review_requested_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            if (empty($booking->code)) {
                $booking->code = sprintf('ALP-%s', Str::upper(Str::random(5)));
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(EventSlot::class, 'slot_id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
