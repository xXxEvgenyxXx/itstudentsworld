<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use DatabaseTransactions;

    public function test_user_can_update_profile(): void
    {
        $user = $this->createUserWithBalance();

        $response = $this->actingAs($user)->patchJson("/api/users/{$user->id}", [
            'name' => 'НовоеИмя',
            'surname' => 'НоваяФамилия',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('user', ['id' => $user->id, 'name' => 'НовоеИмя']);
    }

    // 1. Защита от SQLi при редактировании
    public function test_update_profile_protected_against_sqli(): void
    {
        $user = $this->createUserWithBalance();
        $sqliPayload = "' OR 1=1 --";

        $response = $this->actingAs($user)->patchJson("/api/users/{$user->id}", [
            'name' => $sqliPayload,
            'surname' => $sqliPayload,
        ]);

        $response->assertStatus(200); // Успешно, так как Eloquent экранирует

        // Проверяем, что запись сохранилась как текст, а не сломала БД
        $this->assertDatabaseHas('user', [
            'id' => $user->id,
            'name' => $sqliPayload
        ]);
    }

    // 2. Защита от XSS при редактировании
    public function test_update_profile_handles_xss_safely(): void
    {
        $user = $this->createUserWithBalance();
        $xssPayload = '<script>alert("hacked")</script>';

        $response = $this->actingAs($user)->patchJson("/api/users/{$user->id}", [
            'name' => $xssPayload,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('user', ['id' => $user->id, 'name' => $xssPayload]);
    }

    // 3. Проверка на уникальность Email (защита от подмены)
    public function test_user_cannot_update_email_to_existing_one(): void
    {
        $user1 = $this->createUserWithBalance();
        $user2 = $this->createUserWithBalance();

        // Пытаемся поменять email юзера 1 на email юзера 2
        $response = $this->actingAs($user1)->patchJson("/api/users/{$user1->id}", [
            'email' => $user2->email,
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    }
}
