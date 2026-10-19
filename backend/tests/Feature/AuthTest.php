<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
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
        $this->assertDatabaseHas('user_wallet', ['balance' => 0]);
    }

    public function test_user_can_login(): void
    {
        // Создаем юзера вручную, чтобы обойти защиту $fillable
        $user = new User();
        $user->name = 'Тест';
        $user->surname = 'Тестов';
        $user->email = 'login_phpunit@example.com';
        $user->login = 'login_phpunit_login';
        $user->password_hash = \Illuminate\Support\Facades\Hash::make('password123');
        $user->role_id = 1;
        $user->is_banned = false;
        $user->created_at = now();
        $user->save();

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
        // Сначала создаем пользователя
        $this->postJson('/api/auth/register', [
            'name' => 'Тест', 'surname' => 'Тестов',
            'email' => 'unique@example.com',
            'login' => 'test_dup_login',
            'password' => 'password123', 'password_confirmation' => 'password123',
        ]);

        // Пытаемся создать второго с тем же логином, но другим email
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
        // Сначала создаем пользователя
        $this->postJson('/api/auth/register', [
            'name' => 'Тест', 'surname' => 'Тестов',
            'email' => 'test_dup_email@example.com',
            'login' => 'unique_login',
            'password' => 'password123', 'password_confirmation' => 'password123',
        ]);

        // Пытаемся создать второго с тем же email, но другим логином
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
        // Пытаемся пройти логин с SQL-инъекцией
        $response = $this->postJson('/api/auth/login', [
            'email' => "' OR '1'='1",
            'password' => "' OR '1'='1",
        ]);

        // Laravel должен вернуть ошибку валидации (email не прошел проверку формата)
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_api_handles_xss_payloads_safely(): void
    {
        $xssPayload = '<script>alert("hacked")</script>';

        $response = $this->postJson('/api/auth/register', [
            'name' => $xssPayload, // Отправляем скрипт в имя
            'surname' => 'Тестов',
            'email' => 'xss_api@example.com',
            'login' => 'xss_api_login',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        // Бэкенд должен успешно сохранить это как строку (это нормально для бэка)
        $response->assertStatus(201);

        // Проверяем, что в БД сохранилась именно строка, а не что-то исполняемое
        $this->assertDatabaseHas('user', [
            'email' => 'xss_api@example.com',
            'name' => $xssPayload
        ]);
    }
}
