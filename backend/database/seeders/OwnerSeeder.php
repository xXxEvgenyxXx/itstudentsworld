<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OwnerSeeder extends Seeder
{
    public function run(): void
    {
        $ownerRole = Role::where('alias', 'owner')->firstOrFail();

        $owner = User::where('email', 'owner@itsw.ru')->first();

        if (!$owner) {
            $owner = new User();
            $owner->name = 'Владелец';
            $owner->surname = 'Системы';
            $owner->patronymic = null;
            $owner->email = 'itswowner@example.com';
            $owner->login = 'itsw_owner';
            $owner->password_hash = Hash::make(config('seeder.owner_password'));
            $owner->role_id = $ownerRole->id;
            $owner->is_banned = false;
            $owner->created_at = now();
            $owner->save();

            $wallet = new UserWallet();
            $wallet->user_id = $owner->id;
            $wallet->balance = config('seeder.owner_balance');
            $wallet->save();

            $this->command->info("Owner создан: itswowner@example.com / пароль возьмите с окружения");
        } else {
            $this->command->info("Owner уже существует: itswowner@example.com");
        }
    }
}
