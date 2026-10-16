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
            $owner->email = 'owner@itsw.ru';
            $owner->nickname = 'owner';
            $owner->password_hash = Hash::make(config('seeder.owner_password'));
            $owner->role_id = $ownerRole->id;
            $owner->is_banned = false;
            $owner->created_at = now();
            $owner->save();

            $wallet = new UserWallet();
            $wallet->user_id = $owner->id;
            $wallet->balance = config('seeder.owner_balance');
            $wallet->save();

            $this->command->info("Owner создан: owner@itsw.ru / owner12345");
        } else {
            $this->command->info("Owner уже существует: owner@itsw.ru");
        }
    }
}
