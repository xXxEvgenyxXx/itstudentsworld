<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use DatabaseTransactions;

    private function getUserByRole(string $alias): User
    {
        $role = Role::where('alias', $alias)->firstOrFail();
        return User::factory()->create(['role_id' => $role->id]);
    }

    // 1. Проверка доступа к списку пользователей

    public function test_guest_cannot_access_admin_users_list(): void
    {
        $this->getJson('/api/admin/users')->assertStatus(401);
    }

    public function test_regular_user_cannot_access_admin_users_list(): void
    {
        $user = $this->createUserWithBalance(); // Обычный юзер
        $this->actingAs($user)->getJson('/api/admin/users')->assertStatus(403);
    }

    public function test_admin_can_access_users_list(): void
    {
        $admin = $this->getUserByRole('admin');
        $this->actingAs($admin)->getJson('/api/admin/users')->assertStatus(200);
    }

    public function test_owner_can_access_users_list(): void
    {
        $owner = $this->getUserByRole('owner');
        $this->actingAs($owner)->getJson('/api/admin/users')->assertStatus(200);
    }

    // 2. Проверка бана (Иерархия ролей)

    public function test_admin_can_ban_regular_user_and_revoke_tokens(): void
    {
        $admin = $this->getUserByRole('admin');
        $user = $this->createUserWithBalance();

        // Выдаем юзеру токен (симулируем, что он залогинен)
        $user->createToken('auth');

        $response = $this->actingAs($admin)->patchJson("/api/admin/users/{$user->id}/ban");

        $response->assertStatus(200);
        $this->assertDatabaseHas('user', ['id' => $user->id, 'is_banned' => true]);

        // Проверяем, что все токены юзера удалены
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
    }

    public function test_admin_cannot_ban_another_admin(): void
    {
        $admin1 = $this->getUserByRole('admin');
        $admin2 = $this->getUserByRole('admin');

        $response = $this->actingAs($admin1)->patchJson("/api/admin/users/{$admin2->id}/ban");

        $response->assertStatus(403);
        $this->assertDatabaseHas('user', ['id' => $admin2->id, 'is_banned' => false]);
    }

    public function test_admin_cannot_ban_owner(): void
    {
        $admin = $this->getUserByRole('admin');
        $owner = $this->getUserByRole('owner');

        $response = $this->actingAs($admin)->patchJson("/api/admin/users/{$owner->id}/ban");

        $response->assertStatus(403);
    }

    public function test_owner_can_ban_admin(): void
    {
        $owner = $this->getUserByRole('owner');
        $admin = $this->getUserByRole('admin');

        $response = $this->actingAs($owner)->patchJson("/api/admin/users/{$admin->id}/ban");

        $response->assertStatus(200);
        $this->assertDatabaseHas('user', ['id' => $admin->id, 'is_banned' => true]);
    }

    public function test_owner_cannot_ban_themselves(): void
    {
        $owner = $this->getUserByRole('owner');

        $response = $this->actingAs($owner)->patchJson("/api/admin/users/{$owner->id}/ban");

        $response->assertStatus(403);
    }

    // 3. Проверка смены ролей

    public function test_owner_can_promote_user_to_admin(): void
    {
        $owner = $this->getUserByRole('owner');
        $user = $this->createUserWithBalance();
        $adminRole = Role::where('alias', 'admin')->first();

        $response = $this->actingAs($owner)->patchJson("/api/admin/users/{$user->id}/role", [
            'role_alias' => 'admin',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('user', ['id' => $user->id, 'role_id' => $adminRole->id]);
    }

    public function test_admin_cannot_change_roles(): void
    {
        $admin = $this->getUserByRole('admin');
        $user = $this->createUserWithBalance();

        $response = $this->actingAs($admin)->patchJson("/api/admin/users/{$user->id}/role", [
            'role_alias' => 'admin',
        ]);

        $response->assertStatus(403);
    }

    public function test_owner_cannot_change_own_role(): void
    {
        $owner = $this->getUserByRole('owner');

        $response = $this->actingAs($owner)->patchJson("/api/admin/users/{$owner->id}/role", [
            'role_alias' => 'admin',
        ]);

        $response->assertStatus(403);
    }

    public function test_cannot_assign_owner_role_via_api(): void
    {
        $owner = $this->getUserByRole('owner');
        $user = $this->createUserWithBalance();

        // Пытаемся сделать юзера владельцем (хотя валидация должна отклонить)
        $response = $this->actingAs($owner)->patchJson("/api/admin/users/{$user->id}/role", [
            'role_alias' => 'owner',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['role_alias']);
    }
}
