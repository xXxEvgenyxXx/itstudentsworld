<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use DatabaseTransactions;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Иван',
            'surname' => 'Иванов',
            'email' => 'test_phpunit@example.com',
            'login' => 'test_phpunit_login',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('user', ['email' => 'test_phpunit@example.com']);

        $userId = $response->json('user.id');
        $this->assertDatabaseHas('user_wallet', ['user_id' => $userId, 'balance' => 0]);
    }

    public function test_user_can_login(): void
    {
        // ИСПОЛЬЗУЕМ ФАБРИКУ ВМЕСТО РУЧНОГО СОЗДАНИЯ
        User::factory()->create([
            'email' => 'login_phpunit@example.com',
            'login' => 'login_phpunit_login',
            'password_hash' => Hash::make('password123'),
            'is_banned' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'login_phpunit@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['user', 'token']);
    }

    public function test_guest_cannot_get_users_list(): void
    {
        $response = $this->getJson('/api/users');
        $response->assertStatus(401); // Unauthorized
    }

    public function test_cannot_register_with_duplicate_login(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Тест', 'surname' => 'Тестов',
            'email' => 'unique@example.com',
            'login' => 'test_dup_login',
            'password' => 'password123', 'password_confirmation' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Тест 2', 'surname' => 'Тестов 2',
            'email' => 'unique2@example.com',
            'login' => 'test_dup_login', // Дубликат
            'password' => 'password123', 'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['login']);
    }

    public function test_cannot_register_with_duplicate_email(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Тест', 'surname' => 'Тестов',
            'email' => 'test_dup_email@example.com',
            'login' => 'unique_login',
            'password' => 'password123', 'password_confirmation' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Тест 2', 'surname' => 'Тестов 2',
            'email' => 'test_dup_email@example.com', // Дубликат
            'login' => 'unique_login_2',
            'password' => 'password123', 'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_cannot_register_with_both_duplicates(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Тест', 'surname' => 'Тестов',
            'email' => 'both_dup@example.com',
            'login' => 'both_dup_login',
            'password' => 'password123', 'password_confirmation' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Тест 2', 'surname' => 'Тестов 2',
            'email' => 'both_dup@example.com', // Дубликат
            'login' => 'both_dup_login',       // Дубликат
            'password' => 'password123', 'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email', 'login']);
    }

    public function test_api_protected_against_sql_injection(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => "' OR '1'='1",
            'password' => "' OR '1'='1",
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_api_handles_xss_payloads_safely(): void
    {
        $xssPayload = '<script>alert("hacked")</script>';

        $response = $this->postJson('/api/auth/register', [
            'name' => $xssPayload,
            'surname' => 'Тестов',
            'email' => 'xss_api@example.com',
            'login' => 'xss_api_login',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('user', [
            'email' => 'xss_api@example.com',
            'name' => $xssPayload
        ]);
    }

    public function test_user_cannot_assign_admin_role_during_registration(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Хакер',
            'surname' => 'Хакеров',
            'email' => 'hacker@example.com',
            'login' => 'hacker_login',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_id' => 3,
            'is_banned' => true,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('user', [
            'email' => 'hacker@example.com',
            'role_id' => 1,       // Должна быть роль user
            'is_banned' => false, // Должен быть false
        ]);
    }

    public function test_banned_user_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'banned_login@example.com',
            'login' => 'banned_login',
            'password_hash' => Hash::make('password123'),
            'is_banned' => true, // БАНИМ
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'banned_login@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonMissing(['token']);
    }

    public function test_access_denied_with_invalid_token(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid_garbage_token_12345',
        ])->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    public function test_token_is_revoked_after_logout(): void
    {
        User::factory()->create([
            'email' => 'logout_test@example.com',
            'login' => 'logout_test',
            'password_hash' => Hash::make('password123'),
            'is_banned' => false,
        ]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'logout_test@example.com',
            'password' => 'password123',
        ]);
        $token = $loginResponse->json('token');

        $this->withHeaders(['Authorization' => "Bearer $token"])
             ->getJson('/api/auth/me')
             ->assertStatus(200);

        $this->withHeaders(['Authorization' => "Bearer $token"])
             ->postJson('/api/auth/logout')
             ->assertStatus(200);

        $this->app['auth']->forgetGuards();

        $this->withHeaders(['Authorization' => "Bearer $token"])
             ->getJson('/api/auth/me')
             ->assertStatus(401);
    }

    public function test_passwords_are_hashed_in_database(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Хэш', 'surname' => 'Тест',
            'email' => 'hash_test@example.com',
            'login' => 'hash_test_login',
            'password' => 'password123', 'password_confirmation' => 'password123',
        ]);

        $user = User::where('email', 'hash_test@example.com')->first();

        $this->assertNotEquals('password123', $user->password_hash);
        $this->assertTrue(Hash::check('password123', $user->password_hash));
    }
}
