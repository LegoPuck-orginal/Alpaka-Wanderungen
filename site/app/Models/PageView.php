<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageView extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'path',
        'session_id',
        'referrer',
        'user_agent',
        'ip',
    ];
}
