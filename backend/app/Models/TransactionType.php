<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransactionType extends Model
{
    protected $table = 'transaction_type';
    public $timestamps = false;

    protected $fillable = ['name', 'alias'];

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'type_id');
    }
}
