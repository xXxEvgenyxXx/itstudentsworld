<?php

namespace Tests\Feature;

use App\Models\CosmeticItem;
use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PurchaseTest extends TestCase
{
    use DatabaseTransactions;

    // Вспомогательный метод, чтобы не дублировать код создания юзера и кошелька
    private function createUserWithBalance(float $balance): User
    {
        $user = new User();
        $user->name = 'Покупатель';
        $user->surname = 'Тестов';
        $user->email = 'buyer_' . uniqid() . '@example.com';
        $user->login = 'buyer_' . uniqid();
        $user->password_hash = Hash::make('password123');
        $user->role_id = 1; // user
        $user->is_banned = false;
        $user->created_at = now();
        $user->save();

        $wallet = new UserWallet();
        $wallet->user_id = $user->id;
        $wallet->balance = $balance;
        $wallet->save();

        return $user;
    }

    public function test_user_can_purchase_cosmetic_item(): void
    {
        // 1. Создаем юзера с балансом 1000
        $user = $this->createUserWithBalance(1000);

        // 2. Создаем предмет за 500
        $item = new CosmeticItem();
        $item->name = 'Плащ Машиниста';
        $item->type_id = 1;
        $item->price = 500;
        $item->image_url = '/images/test.png';
        $item->save();

        // 3. Делаем запрос от имени юзера
        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
        ]);

        // 4. Проверяем ответ (201 Created)
        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'transaction', 'new_balance']);

        // 5. Проверяем, что деньги списались (1000 - 500 = 500)
        $this->assertDatabaseHas('user_wallet', [
            'user_id' => $user->id,
            'balance' => 500
        ]);

        // 6. Проверяем, что создалась транзакция
        $this->assertDatabaseHas('transaction', [
            'user_id' => $user->id,
            'amount' => 500,
            'type_id' => 2, // purchase
            'status_id' => 2, // success
        ]);

        // 7. Проверяем, что предмет выдан
        $this->assertDatabaseHas('user_cosmetic', [
            'user_id' => $user->id,
            'cosmetic_id' => $item->id,
        ]);
    }

    public function test_user_cannot_purchase_if_not_enough_money(): void
    {
        // 1. Создаем юзера с балансом 100
        $user = $this->createUserWithBalance(100);

        // 2. Создаем предмет за 500
        $item = new CosmeticItem();
        $item->name = 'Дорогой Плащ';
        $item->type_id = 1;
        $item->price = 500;
        $item->image_url = '/images/test.png';
        $item->save();

        // 3. Делаем запрос
        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
        ]);

        // 4. Ожидаем ошибку 422 (Unprocessable Entity)
        $response->assertStatus(422);

        // 5. Проверяем, что баланс НЕ изменился
        $this->assertDatabaseHas('user_wallet', [
            'user_id' => $user->id,
            'balance' => 100
        ]);

        // 6. Проверяем, что предмет НЕ выдан
        $this->assertDatabaseMissing('user_cosmetic', [
            'user_id' => $user->id,
            'cosmetic_id' => $item->id,
        ]);
    }

    public function test_user_cannot_purchase_item_twice(): void
    {
        // 1. Создаем юзера с балансом 1000
        $user = $this->createUserWithBalance(1000);

        // 2. Создаем предмет
        $item = new CosmeticItem();
        $item->name = 'Уникальный Плащ';
        $item->type_id = 1;
        $item->price = 500;
        $item->image_url = '/images/test.png';
        $item->save();

        // 3. Имитируем, что предмет уже куплен (вставляем напрямую в связующую таблицу)
        \Illuminate\Support\Facades\DB::table('user_cosmetic')->insert([
            'user_id' => $user->id,
            'cosmetic_id' => $item->id,
        ]);

        // 4. Пытаемся купить его еще раз
        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
        ]);

        // 5. Ожидаем ошибку 422
        $response->assertStatus(422);

        // 6. Проверяем, что деньги НЕ списались (осталось 1000)
        $this->assertDatabaseHas('user_wallet', [
            'user_id' => $user->id,
            'balance' => 1000
        ]);
    }

    public function test_purchase_fails_if_item_does_not_exist(): void
    {
        $user = $this->createUserWithBalance(1000);

        // Пытаемся купить несуществующий ID (например, 9999)
        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => 9999,
        ]);

        // Ожидаем ошибку валидации (exists:cosmetic_item,id)
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['cosmetic_item_id']);
    }
    public function test_banned_user_cannot_purchase(): void
    {
        // 1. Создаем юзера с балансом 1000
        $user = $this->createUserWithBalance(1000);

        // 2. Баним его
        $user->is_banned = true;
        $user->save();

        // 3. Создаем предмет
        $item = new CosmeticItem();
        $item->name = 'Плащ для забаненных';
        $item->type_id = 1;
        $item->price = 500;
        $item->image_url = '/images/test.png';
        $item->save();

        // 4. Пытаемся купить
        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
        ]);

        // 5. Ожидаем 403 Forbidden (Доступ запрещен)
        $response->assertStatus(403);

        // 6. Проверяем, что баланс не изменился
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 1000]);
    }
    public function test_user_cannot_purchase_deleted_item(): void
    {
        $user = $this->createUserWithBalance(1000);

        $item = new CosmeticItem();
        $item->name = 'Удаленный плащ';
        $item->type_id = 1;
        $item->price = 500;
        $item->image_url = '/images/test.png';
        $item->save();

        // Мягко удаляем предмет (появляется deleted_at)
        $item->delete();

        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
        ]);

        // Ожидаем ошибку, что предмет не найден (404)
        $response->assertStatus(404);

        // Проверяем, что деньги не списались
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 1000]);
    }
    public function test_guest_cannot_purchase(): void
    {
        $item = new CosmeticItem();
        $item->name = 'Плащ';
        $item->type_id = 1;
        $item->price = 500;
        $item->image_url = '/images/test.png';
        $item->save();

        // Делаем запрос БЕЗ авторизации (без actingAs)
        $response = $this->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
        ]);

        $response->assertStatus(401); // Unauthorized
    }
    public function test_price_tampering_fails_with_insufficient_balance(): void
    {
        // 1. Создаем юзера с балансом 100 (не хватает на предмет за 500)
        $user = $this->createUserWithBalance(100);

        // 2. Создаем дорогой предмет за 500
        $item = new CosmeticItem();
        $item->name = 'Дорогой Плащ';
        $item->type_id = 1;
        $item->price = 500;
        $item->image_url = '/images/test.png';
        $item->save();

        // 3. Злоумышленник пытается передать фейковую цену (price: 1)
        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
            'price' => 1,  // Фейковая цена
        ]);

        // 4. Бэкенд должен проигнорировать фейк и увидеть реальную цену 500.
        // 100 < 500, поэтому ожидаем 422 (Ошибка валидации)
        $response->assertStatus(422);

        // 5. Проверяем, что деньги НЕ списались
        $this->assertDatabaseHas('user_wallet', [
            'user_id' => $user->id,
            'balance' => 100
        ]);

        // 6. Проверяем, что предмет НЕ выдан
        $this->assertDatabaseMissing('user_cosmetic', [
            'user_id' => $user->id,
            'cosmetic_id' => $item->id,
        ]);
    }

    public function test_price_tampering_ignored_when_balance_is_sufficient(): void
    {
        // 1. Создаем юзера с балансом 1000 (хватает на предмет за 500)
        $user = $this->createUserWithBalance(1000);

        // 2. Создаем предмет за 500
        $item = new CosmeticItem();
        $item->name = 'Плащ';
        $item->type_id = 1;
        $item->price = 500;
        $item->image_url = '/images/test.png';
        $item->save();

        // 3. Злоумышленник пытается передать фейковую цену (price: 1)
        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
            'price' => 1,
        ]);

        // 4. Запрос проходит (201), потому что реальных денег хватает
        $response->assertStatus(201);

        // 5. НО! Деньги должны списаться по реальной цене из БД (500), а не 1
        $this->assertDatabaseHas('user_wallet', [
            'user_id' => $user->id,
            'balance' => 500 // 1000 - 500
        ]);

        // 6. И в транзакции должна быть сумма 500
        $this->assertDatabaseHas('transaction', [
            'user_id' => $user->id,
            'amount' => 500
        ]);
    }
    public function test_user_cannot_tamper_with_user_id(): void
    {
        $user = $this->createUserWithBalance(1000);
        $victim = $this->createUserWithBalance(1000); // Жертва

        $item = new CosmeticItem();
        $item->name = 'Плащ';
        $item->type_id = 1;
        $item->price = 500;
        $item->image_url = '/images/test.png';
        $item->save();

        // Пытаемся купить предмет на аккаунт жертвы, передавая ее ID
        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
            'user_id' => $victim->id, // IDOR-атака
        ]);

        $response->assertStatus(201); // Запрос проходит от нашего имени

        // Наш баланс уменьшился
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 500]);

        // А баланс жертвы НЕ изменился
        $this->assertDatabaseHas('user_wallet', ['user_id' => $victim->id, 'balance' => 1000]);
    }
    public function test_user_cannot_purchase_item_with_negative_price(): void
    {
        $user = $this->createUserWithBalance(1000);

        // Создаем "сломанный" предмет с отрицательной ценой
        $item = new CosmeticItem();
        $item->name = 'Багнутый плащ';
        $item->type_id = 1;
        $item->price = -500;
        $item->image_url = '/images/test.png';
        $item->save();

        $response = $this->actingAs($user)->postJson('/api/wallet/purchase', [
            'cosmetic_item_id' => $item->id,
        ]);

        // Ожидаем ошибку (422), так как цену нельзя списать
        $response->assertStatus(422);

        // Баланс не должен увеличиться (остается 1000)
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 1000]);
    }
}
