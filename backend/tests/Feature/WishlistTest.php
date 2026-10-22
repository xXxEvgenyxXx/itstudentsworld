<?php

namespace Tests\Feature;

use App\Models\CosmeticItem;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use DatabaseTransactions;

    public function test_user_can_add_item_to_wishlist(): void
    {
        $user = $this->createUserWithBalance();
        $item = $this->createItem();

        $response = $this->actingAs($user)->postJson('/api/wishlist/toggle', [
            'cosmetic_item_id' => $item->id,
        ]);

        $response->assertStatus(200)
                 ->assertJson(['status' => 'added']);

        $this->assertDatabaseHas('user_wishlist', [
            'user_id' => $user->id,
            'cosmetic_id' => $item->id,
        ]);
    }

    public function test_user_can_remove_item_from_wishlist(): void
    {
        $user = $this->createUserWithBalance();
        $item = $this->createItem();

        DB::table('user_wishlist')->insert([
            'user_id' => $user->id,
            'cosmetic_id' => $item->id,
        ]);

        $response = $this->actingAs($user)->postJson('/api/wishlist/toggle', [
            'cosmetic_item_id' => $item->id,
        ]);

        $response->assertStatus(200)
                 ->assertJson(['status' => 'removed']);

        $this->assertDatabaseMissing('user_wishlist', [
            'user_id' => $user->id,
            'cosmetic_id' => $item->id,
        ]);
    }

    public function test_guest_cannot_toggle_wishlist(): void
    {
        $item = $this->createItem();

        $response = $this->postJson('/api/wishlist/toggle', [
            'cosmetic_item_id' => $item->id,
        ]);

        $response->assertStatus(401);
    }

    public function test_user_cannot_add_non_existent_item_to_wishlist(): void
    {
        $user = $this->createUserWithBalance();

        $nonExistentId = CosmeticItem::max('id') + 1000;

        $response = $this->actingAs($user)->postJson('/api/wishlist/toggle', [
            'cosmetic_item_id' => $nonExistentId,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['cosmetic_item_id']);
    }
}
