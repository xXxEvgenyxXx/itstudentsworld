<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransactionStatus extends Model
{
    protected $table = 'transaction_status';
    public $timestamps = false;

    protected $fillable = ['name', 'alias'];

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'status_id');
    }
}
