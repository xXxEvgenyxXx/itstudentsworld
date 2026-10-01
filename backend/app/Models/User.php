<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'user';
    public $timestamps = false;

    // Только те поля, что безопасно принимать от клиента
    protected $fillable = [
        'name', 'surname', 'patronymic',
        'email', 'nickname',
        'created_at',
    ];

    protected $hidden = ['password_hash'];

    protected $casts = [
        'is_banned' => 'boolean',
        'created_at' => 'datetime',
    ];

    // Sanctum ожидает поле password — у нас password_hash
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    // Связи
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(UserWallet::class, 'user_id', 'id');
    }

    public function cosmetics(): BelongsToMany
    {
        return $this->belongsToMany(
            CosmeticItem::class,
            'user_cosmetic',
            'user_id',
            'cosmetic_id'
        );
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'user_id');
    }

    public function isAdmin(): bool
    {
        return in_array($this->role?->alias, ['admin', 'owner']);
    }

    public function isOwner(): bool
    {
        return $this->role?->alias === 'owner';
    }
}
