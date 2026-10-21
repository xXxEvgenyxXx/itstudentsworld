<?php

namespace Tests\Feature;

use App\Models\CosmeticItem;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ShopSecurityTest extends TestCase
{
    use DatabaseTransactions;

    public function test_shop_filters_protected_against_sql_injection(): void
    {
        // Пытаемся передать SQL-инъекцию в GET-параметр ?type=
        $response = $this->getJson("/api/cosmetic-items?type=' OR 1=1 --");

        // Бэкенд не должен падать с 500 ошибкой.
        // Он должен просто вернуть пустой массив (200), так как такого типа нет
        $response->assertStatus(200);
        $this->assertEmpty($response->json('data'));
    }

    public function test_shop_does_not_show_soft_deleted_items(): void
    {
        $item = $this->createItem();

        // Мягко удаляем предмет (появляется deleted_at)
        $item->delete();

        $response = $this->getJson('/api/cosmetic-items');

        $response->assertStatus(200);

        // Достаем массив ID всех предметов, которые вернул сервер
        $returnedIds = collect($response->json('data'))->pluck('id')->toArray();

        // Проверяем, что ID нашего удаленного предмета НЕ содержится в этом массиве
        $this->assertNotContains($item->id, $returnedIds);
    }

    public function test_wishlist_protected_against_sql_injection(): void
    {
        $user = $this->createUserWithBalance();

        $response = $this->actingAs($user)->postJson('/api/wishlist/toggle', [
            'cosmetic_item_id' => "1 OR 1=1", // SQLi payload
        ]);

        // Laravel (валидация integer) должен отклонить это
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['cosmetic_item_id']);
    }

    public function test_user_cannot_tamper_with_user_id_in_wishlist(): void
    {
        $user = $this->createUserWithBalance();
        $victim = $this->createUserWithBalance();
        $item = $this->createItem();

        // Злоумышленник пытается добавить предмет в вишлист ЖЕРТВЕ
        $response = $this->actingAs($user)->postJson('/api/wishlist/toggle', [
            'cosmetic_item_id' => $item->id,
            'user_id' => $victim->id, // IDOR-атака
        ]);

        $response->assertStatus(200);

        // Проверяем, что предмет добавился НАМ, а не жертве
        $this->assertDatabaseHas('user_wishlist', [
            'user_id' => $user->id,
            'cosmetic_id' => $item->id,
        ]);

        // У жертвы ничего не появилось
        $this->assertDatabaseMissing('user_wishlist', [
            'user_id' => $victim->id,
            'cosmetic_id' => $item->id,
        ]);
    }

    public function test_banned_user_cannot_toggle_wishlist(): void
    {
        $user = $this->createUserWithBalance();
        $user->is_banned = true;
        $user->save();

        $item = $this->createItem();

        $response = $this->actingAs($user)->postJson('/api/wishlist/toggle', [
            'cosmetic_item_id' => $item->id,
        ]);

        $response->assertStatus(403);

        $this->assertDatabaseMissing('user_wishlist', [
            'user_id' => $user->id,
            'cosmetic_id' => $item->id,
        ]);
    }
}
