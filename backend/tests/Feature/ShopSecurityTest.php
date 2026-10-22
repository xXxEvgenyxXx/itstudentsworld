<?php

namespace Tests\Feature;

use App\Models\CosmeticItem;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ShopSecurityTest extends TestCase
{
    use DatabaseTransactions;

    public function test_shop_filters_protected_against_sql_injection(): void
    {
        $response = $this->getJson("/api/cosmetic-items?type=' OR 1=1 --");

        $response->assertStatus(200);
        $this->assertEmpty($response->json('data'));
    }

    public function test_shop_does_not_show_soft_deleted_items(): void
    {
        $item = $this->createItem();
        $item->delete();

        $response = $this->getJson('/api/cosmetic-items');
        $response->assertStatus(200);

        // ИСПРАВЛЕНО: Проверяем отсутствие конкретного ID, а не пустоту всего массива
        $returnedIds = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertNotContains($item->id, $returnedIds);
    }

    public function test_wishlist_protected_against_sql_injection(): void
    {
        $user = $this->createUserWithBalance();

        $response = $this->actingAs($user)->postJson('/api/wishlist/toggle', [
            'cosmetic_item_id' => "1 OR 1=1",
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['cosmetic_item_id']);
    }

    public function test_user_cannot_tamper_with_user_id_in_wishlist(): void
    {
        $user = $this->createUserWithBalance();
        $victim = $this->createUserWithBalance();
        $item = $this->createItem();

        $response = $this->actingAs($user)->postJson('/api/wishlist/toggle', [
            'cosmetic_item_id' => $item->id,
            'user_id' => $victim->id,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('user_wishlist', ['user_id' => $user->id, 'cosmetic_id' => $item->id]);
        $this->assertDatabaseMissing('user_wishlist', ['user_id' => $victim->id, 'cosmetic_id' => $item->id]);
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
        $this->assertDatabaseMissing('user_wishlist', ['user_id' => $user->id, 'cosmetic_id' => $item->id]);
    }
}
