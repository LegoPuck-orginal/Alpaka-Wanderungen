<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tour extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'title',
        'description',
        'duration_min',
        'price_cents',
        'capacity',
        'image_url',
        'image_alt',
    ];

    public function slots(): HasMany
    {
        return $this->hasMany(EventSlot::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(TourImage::class)->orderBy('position');
    }

    public function bookings(): HasManyThrough
    {
        return $this->hasManyThrough(Booking::class, EventSlot::class, 'tour_id', 'slot_id');
    }
}
