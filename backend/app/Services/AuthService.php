<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $userRole = Role::where('alias', 'user')->firstOrFail();

            $user = new User();
            $user->name = $data['name'];
            $user->surname = $data['surname'];
            $user->patronymic = $data['patronymic'] ?? null;
            $user->email = $data['email'];
            $user->nickname = $data['nickname'];
            $user->password_hash = Hash::make($data['password']);
            $user->role_id = $userRole->id;
            $user->is_banned = false;
            $user->created_at = now();
            $user->save();

            UserWallet::create([
                'user_id' => $user->id,
                'balance' => 0,
            ]);

            return $user;
        });
    }

    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password_hash)) {
            throw ValidationException::withMessages([
                'email' => ['Неверный email или пароль.'],
            ]);
        }

        if ($user->is_banned) {
            throw ValidationException::withMessages([
                'email' => ['Аккаунт заблокирован.'],
            ]);
        }

        // Удаляем старые токены этого девайса
        $user->tokens()->delete();

        $token = $user->createToken('auth')->plainTextToken;

        return [
            'user' => $user->load('role', 'wallet'),
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
