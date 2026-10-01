<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCosmetic extends Model
{
    protected $table = 'user_cosmetic';
    public $timestamps = false;
    public $incrementing = false;

    protected $primaryKey = null;

    protected $fillable = ['user_id', 'cosmetic_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function cosmetic(): BelongsTo
    {
        return $this->belongsTo(CosmeticItem::class, 'cosmetic_id');
    }
}
