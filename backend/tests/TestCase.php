<?php

namespace Tests;

use App\Models\CosmeticItem;
use App\Models\CosmeticType;
use App\Models\Role;
use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function createUserWithBalance(float $balance = 1000): User
    {
        $role = Role::firstOrCreate(['alias' => 'user'], ['name' => 'Пользователь']);
        $user = User::factory()->create(['role_id' => $role->id]);

        $wallet = new UserWallet();
        $wallet->user_id = $user->id;
        $wallet->balance = $balance;
        $wallet->save();

        return $user;
    }

    protected function createItem(float $price = 500): CosmeticItem
    {
        $type = CosmeticType::firstOrCreate(['alias' => 'cape'], ['name' => 'Плащ']);

        return CosmeticItem::create([
            'name' => 'Тестовый предмет ' . uniqid(),
            'type_id' => $type->id,
            'price' => $price,
            'image_url' => '/test.png',
        ]);
    }
}
