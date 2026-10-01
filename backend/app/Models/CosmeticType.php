<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CosmeticType extends Model
{
    protected $table = 'cosmetic_type';
    public $timestamps = false;

    protected $fillable = ['name', 'alias'];

    public function items(): HasMany
    {
        return $this->hasMany(CosmeticItem::class, 'type_id');
    }
}
