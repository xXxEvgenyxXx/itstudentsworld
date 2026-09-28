<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'user';

    protected $fillable = [
        'name', 'surname', 'patronymic', 'email', 'nickname',
        'password_hash', 'role_id', 'is_banned', 'created_at',
    ];

    protected $hidden = ['password_hash'];

    protected $casts = [
        'is_banned' => 'boolean',
        'created_at' => 'datetime',
    ];

    // В БД только created_at, updated_at отсутствует
    const UPDATED_AT = null;
    const CREATED_AT = 'created_at';

    // Sanctum будет использовать это поле для проверки пароля
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    // Связи
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function wallet()
    {
        return $this->hasOne(UserWallet::class, 'user_id');
    }

    public function cosmetics()
    {
        return $this->belongsToMany(
            CosmeticItem::class,
            'user_cosmetic',
            'user_id',
            'cosmetic_id'
        );
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'user_id');
    }
}
