<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->firstName(),
            'surname' => fake()->lastName(),
            'patronymic' => null,
            'email' => fake()->unique()->safeEmail(),
            'login' => fake()->unique()->userName(),
            'password_hash' => Hash::make('password123'),
            'role_id' => Role::where('alias', 'user')->first()?->id ?? 1,
            'is_banned' => false,
            'created_at' => now(),
        ];
    }
}
