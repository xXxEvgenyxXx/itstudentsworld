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
            'patronymic' => fake()->optional()->firstNameMale(),
            'email' => fake()->unique()->safeEmail(),
            'login' => fake()->unique()->userName(),
            'password_hash' => Hash::make('password'),
            'role_id' => Role::where('alias', 'user')->first()?->id ?? 1,
            'is_banned' => false,
            'created_at' => now(),
        ];
    }

    public function admin(): static
    {
        return $this->state([
            'role_id' => Role::where('alias', 'admin')->first()?->id ?? 2,
        ]);
    }

    public function owner(): static
    {
        return $this->state([
            'role_id' => Role::where('alias', 'owner')->first()?->id ?? 3,
        ]);
    }

    public function banned(): static
    {
        return $this->state(['is_banned' => true]);
    }
}
