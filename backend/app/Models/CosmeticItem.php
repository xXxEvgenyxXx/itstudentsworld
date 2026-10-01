<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CosmeticItem extends Model
{
    use SoftDeletes;

    protected $table = 'cosmetic_item';
    public $timestamps = false;

    protected $fillable = ['name', 'type_id', 'price'];

    protected $casts = [
        'price' => 'decimal:2',
        'deleted_at' => 'datetime',
    ];

    public function type(): BelongsTo
    {
        return $this->belongsTo(CosmeticType::class, 'type_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'user_cosmetic',
            'cosmetic_id',
            'user_id'
        );
    }
}
