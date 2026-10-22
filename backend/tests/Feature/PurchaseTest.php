<?php

namespace Tests\Feature;

use App\Models\CosmeticItem;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PurchaseTest extends TestCase
{
    use DatabaseTransactions;

    public function test_user_can_purchase_cosmetic_item(): void
    {
        $user = $this->createUserWithBalance(1000);
        $item = $this->createItem(500); // ИСПОЛЬЗУЕМ ХЕЛПЕР

        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'transaction', 'new_balance']);

        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 500]);
        $this->assertDatabaseHas('transaction', ['user_id' => $user->id, 'amount' => 500, 'type_id' => 2, 'status_id' => 2]);
        $this->assertDatabaseHas('user_cosmetic', ['user_id' => $user->id, 'cosmetic_id' => $item->id]);
    }

    public function test_user_cannot_purchase_if_not_enough_money(): void
    {
        $user = $this->createUserWithBalance(100);
        $item = $this->createItem(500);

        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 100]);
        $this->assertDatabaseMissing('user_cosmetic', ['user_id' => $user->id, 'cosmetic_id' => $item->id]);
    }

    public function test_user_cannot_purchase_item_twice(): void
    {
        $user = $this->createUserWithBalance(1000);
        $item = $this->createItem(500);

        // ИСПОЛЬЗУЕМ ИМПОРТИРОВАННЫЙ DB ВМЕСТО FQN
        DB::table('user_cosmetic')->insert([
            'user_id' => $user->id,
            'cosmetic_id' => $item->id,
        ]);

        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 1000]);
    }

    public function test_purchase_fails_if_item_does_not_exist(): void
    {
        $user = $this->createUserWithBalance(1000);

        // Защита от случайного совпадения с реальным ID
        $nonExistentId = CosmeticItem::max('id') + 1000;

        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $nonExistentId,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['cosmetic_item_id']);
    }

    public function test_banned_user_cannot_purchase(): void
    {
        $user = $this->createUserWithBalance(1000);
        $user->is_banned = true;
        $user->save();

        $item = $this->createItem(500);

        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 1000]);
    }

    public function test_user_cannot_purchase_deleted_item(): void
    {
        $user = $this->createUserWithBalance(1000);
        $item = $this->createItem(500);

        $item->delete();

        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
        ]);

        $response->assertStatus(404);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 1000]);
    }

    public function test_guest_cannot_purchase(): void
    {
        $item = $this->createItem(500);

        $response = $this->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
        ]);

        $response->assertStatus(401);
    }

    public function test_price_tampering_fails_with_insufficient_balance(): void
    {
        $user = $this->createUserWithBalance(100);
        $item = $this->createItem(500);

        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
            'price' => 1,
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 100]);
        $this->assertDatabaseMissing('user_cosmetic', ['user_id' => $user->id, 'cosmetic_id' => $item->id]);
    }

    public function test_price_tampering_ignored_when_balance_is_sufficient(): void
    {
        $user = $this->createUserWithBalance(1000);
        $item = $this->createItem(500);

        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
            'price' => 1,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 500]);
        $this->assertDatabaseHas('transaction', ['user_id' => $user->id, 'amount' => 500]);
    }

    public function test_user_cannot_tamper_with_user_id(): void
    {
        $user = $this->createUserWithBalance(1000);
        $victim = $this->createUserWithBalance(1000);
        $item = $this->createItem(500);

        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
            'user_id' => $victim->id,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 500]);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $victim->id, 'balance' => 1000]);
    }

    public function test_user_cannot_purchase_item_with_negative_price(): void
    {
        $user = $this->createUserWithBalance(1000);
        $item = $this->createItem(-500);

        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 1000]);
    }

    public function test_purchase_protected_against_sql_injection(): void
    {
        $user = $this->createUserWithBalance(1000);

        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => "1 OR 1=1",
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 1000]);
    }

    // ПЕРЕИМЕНОВАНО ПО ПРОСЬБЕ КИМИ
    public function test_balance_cannot_go_negative_on_repeated_purchase(): void
    {
        $user = $this->createUserWithBalance(500);
        $item = $this->createItem(500);

        $this->actingAs($user)->postJson('/api/wallet/purchase', ['cosmetic_item_id' => $item->id])->assertStatus(201);
        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', ['cosmetic_item_id' => $item->id]);

        $response->assertStatus(422);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 0]);
    }
}
