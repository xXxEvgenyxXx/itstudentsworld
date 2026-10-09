<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function updateProfile(User $user, array $data): User
    {
        $user->name = $data['name'] ?? $user->name;
        $user->surname = $data['surname'] ?? $user->surname;
        $user->patronymic = $data['patronymic'] ?? $user->patronymic;
        $user->email = $data['email'] ?? $user->email;
        $user->save();

        return $user->load('role', 'wallet');
    }

    public function changePassword(User $user, string $newPassword): void
    {
        $user->password_hash = Hash::make($newPassword);
        $user->save();
    }

    public function changeRole(User $user, string $roleAlias): User
    {
        $role = \App\Models\Role::where('alias', $roleAlias)->firstOrFail();
        $user->role_id = $role->id;
        $user->save();

        return $user->load('role');
    }

    public function toggleBan(User $user): User
    {
        $user->is_banned = !$user->is_banned;
        $user->save();

        // Отзываем все токены при бане
        if ($user->is_banned) {
            $user->tokens()->delete();
        }

        return $user;
    }
}
