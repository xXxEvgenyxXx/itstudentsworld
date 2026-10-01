<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $table = 'transaction';
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'amount', 'type_id', 'status_id', 'created_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(TransactionType::class, 'type_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(TransactionStatus::class, 'status_id');
    }
}
