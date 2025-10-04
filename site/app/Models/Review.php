<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'name',
        'text',
        'rating',
        'position',
        'is_visible',
    ];

    protected $casts = [
        'rating' => 'integer',
        'position' => 'integer',
        'is_visible' => 'boolean',
    ];
}
