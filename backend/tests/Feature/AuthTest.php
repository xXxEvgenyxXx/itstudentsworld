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
            'name' => 'Иван', 'surname' => 'Иванов',
            'email' => 'test_phpunit@example.com',
            'login' => 'test_phpunit_login',
            'password' => 'password123', 'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('user', ['email' => 'test_phpunit@example.com']);

        // ФИКС: Достаем ID из ответа и проверяем кошелек ИМЕННО этого юзера
        $userId = $response->json('user.id');
        $this->assertDatabaseHas('user_wallet', [
            'user_id' => $userId,
            'balance' => 0
        ]);
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
    public function test_user_cannot_assign_admin_role_during_registration(): void
    {
        // Злоумышленник пытается передать role_id: 3 (владелец) и is_banned: true
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Хакер',
            'surname' => 'Хакеров',
            'email' => 'hacker@example.com',
            'login' => 'hacker_login',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_id' => 3,        // Пытаемся стать владельцем
            'is_banned' => true,   // Пытаемся скрыться от бана
        ]);

        $response->assertStatus(201);

        // Проверяем, что в БД создался обычный юзер, а не владелец
        $this->assertDatabaseHas('user', [
            'email' => 'hacker@example.com',
            'role_id' => 1,       // Должна быть роль user
            'is_banned' => false, // Должен быть false
        ]);
    }
    public function test_banned_user_cannot_login(): void
    {
        $user = new User();
        $user->name = 'Тест';
        $user->surname = 'Тестов';
        $user->email = 'banned_login@example.com';
        $user->login = 'banned_login';
        $user->password_hash = \Illuminate\Support\Facades\Hash::make('password123');
        $user->role_id = 1;
        $user->is_banned = true; // БАНИМ
        $user->created_at = now();
        $user->save();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'banned_login@example.com',
            'password' => 'password123',
        ]);

        // Ожидаем ошибку (в AuthService мы кидаем ValidationException)
        $response->assertStatus(422);
        $response->assertJsonMissing(['token']); // Токен НЕ должен выдаваться
    }
    public function test_access_denied_with_invalid_token(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid_garbage_token_12345',
        ])->getJson('/api/auth/me');

        // Laravel Sanctum должен вернуть 401 Unauthorized
        $response->assertStatus(401);
    }
    public function test_token_is_revoked_after_logout(): void
    {
        // Создаем и логиним юзера
        $user = new User();
        $user->name = 'Тест';
        $user->surname = 'Тестов';
        $user->email = 'logout_test@example.com';
        $user->login = 'logout_test';
        $user->password_hash = \Illuminate\Support\Facades\Hash::make('password123');
        $user->role_id = 1;
        $user->is_banned = false;
        $user->created_at = now();
        $user->save();

        // 1. Логин
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'logout_test@example.com',
            'password' => 'password123',
        ]);
        $token = $loginResponse->json('token');

        // 2. Проверяем, что токен работает
        $this->withHeaders(['Authorization' => "Bearer $token"])
             ->getJson('/api/auth/me')
             ->assertStatus(200);

        // 3. Делаем логаут
        $this->withHeaders(['Authorization' => "Bearer $token"])
             ->postJson('/api/auth/logout')
             ->assertStatus(200);

        // ВАЖНО: Сбрасываем кэш auth-гарда в Laravel, чтобы следующий запрос проверил токен с нуля
        $this->app['auth']->forgetGuards();

        // 4. Пытаемся использовать тот же токен еще раз — должно быть 401
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

        // 1. Пароль в БД НЕ ДОЛЖЕН быть равен "password123"
        $this->assertNotEquals('password123', $user->password_hash);

        // 2. Хэш должен успешно проходить проверку через фасад Hash
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('password123', $user->password_hash));
    }
}
