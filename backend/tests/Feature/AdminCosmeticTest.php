<?php

namespace Tests\Feature;

use App\Models\CosmeticItem;
use App\Models\CosmeticType;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdminCosmeticTest extends TestCase
{
    use DatabaseTransactions;

    private function getAdmin(): User
    {
        $role = Role::where('alias', 'admin')->firstOrFail();
        return User::factory()->create(['role_id' => $role->id]);
    }

    private function getCosmeticType(): CosmeticType
    {
        return CosmeticType::firstOrCreate(['alias' => 'cape'], ['name' => 'Плащ']);
    }

    // 1. Проверка прав доступа (RBAC)

    public function test_guest_cannot_create_cosmetic(): void
    {
        $response = $this->postJson('/api/admin/cosmetic-items', []);
        $response->assertStatus(401);
    }

    public function test_regular_user_cannot_create_cosmetic(): void
    {
        $user = $this->createUserWithBalance();
        $response = $this->actingAs($user)->postJson('/api/admin/cosmetic-items', []);
        $response->assertStatus(403);
    }

    public function test_admin_can_create_cosmetic(): void
    {
        $admin = $this->getAdmin();
        $type = $this->getCosmeticType();

        $response = $this->actingAs($admin)->postJson('/api/admin/cosmetic-items', [
            'name' => 'Новый плащ',
            'type_id' => $type->id,
            'price' => 150.50,
            'image_url' => '/images/new_cape.png',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('cosmetic_item', ['name' => 'Новый плащ']);
    }

    // 2. Валидация данных

    public function test_cannot_create_cosmetic_with_negative_price(): void
    {
        $admin = $this->getAdmin();
        $type = $this->getCosmeticType();

        $response = $this->actingAs($admin)->postJson('/api/admin/cosmetic-items', [
            'name' => 'Багнутый плащ',
            'type_id' => $type->id,
            'price' => -100, // Отрицательная цена
            'image_url' => '/images/test.png',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['price']);
    }

    // 3. Обновление и удаление

    public function test_admin_can_update_cosmetic(): void
    {
        $admin = $this->getAdmin();
        $item = $this->createItem(500);

        $response = $this->actingAs($admin)->patchJson("/api/admin/cosmetic-items/{$item->id}", [
            'price' => 999.99,
            'name' => 'Обновленный плащ',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('cosmetic_item', ['id' => $item->id, 'price' => 999.99, 'name' => 'Обновленный плащ']);
    }

    public function test_admin_can_soft_delete_cosmetic(): void
    {
        $admin = $this->getAdmin();
        $item = $this->createItem(500);

        $response = $this->actingAs($admin)->deleteJson("/api/admin/cosmetic-items/{$item->id}");

        $response->assertStatus(200);

        // Проверяем, что предмет "удален" (появился deleted_at)
        $this->assertSoftDeleted('cosmetic_item', ['id' => $item->id]);

        // И что его больше нет в публичном каталоге
        $catalogResponse = $this->getJson('/api/cosmetic-items');
        $catalogIds = collect($catalogResponse->json('data'))->pluck('id')->toArray();
        $this->assertNotContains($item->id, $catalogIds);
    }

    // 4. Безопасность (SQLi и XSS)

    public function test_cosmetic_name_protected_against_sql_injection(): void
    {
        $admin = $this->getAdmin();
        $type = $this->getCosmeticType();

        $response = $this->actingAs($admin)->postJson('/api/admin/cosmetic-items', [
            'name' => "Плащ ' OR 1=1 --", // SQLi payload
            'type_id' => $type->id,
            'price' => 100,
            'image_url' => '/images/test.png',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('cosmetic_item', ['name' => "Плащ ' OR 1=1 --"]);
    }

    public function test_cosmetic_name_handles_xss_payload_safely(): void
    {
        $admin = $this->getAdmin();
        $type = $this->getCosmeticType();
        $xssPayload = '<script>alert("hacked")</script>';

        $response = $this->actingAs($admin)->postJson('/api/admin/cosmetic-items', [
            'name' => $xssPayload,
            'type_id' => $type->id,
            'price' => 100,
            'image_url' => '/images/test.png',
        ]);

        $response->assertStatus(201);
        // В БД скрипт сохраняется как текст. Защита от исполнения ложится на фронтенд (React).
        $this->assertDatabaseHas('cosmetic_item', ['name' => $xssPayload]);
    }
}
