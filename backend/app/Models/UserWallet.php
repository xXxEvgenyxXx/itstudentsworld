<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserWallet extends Model
{
    protected $table = 'user_wallet';
    public $timestamps = false;

    // Ключевой момент — нет id, PK = user_id
    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'int';

    // balance НЕ в fillable — меняется только через сервисы
    protected $fillable = [];

    protected $casts = [
        'balance' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
