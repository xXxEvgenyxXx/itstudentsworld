<?php

namespace App\Services;

use App\Models\CosmeticItem;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WalletService
{
    public function purchase(User $user, int $cosmeticId): Transaction
    {
        // 1. Проверяем, существует ли предмет (и не удален ли он soft-delete)
        $item = CosmeticItem::findOrFail($cosmeticId);

        // 2. Защита от отрицательной (Data Integrity)
        if ($item->price <= 0) {
            throw ValidationException::withMessages([
                'cosmetic_item_id' => ['Некорректная цена предмета. Покупка невозможна.'],
            ]);
        }

        // 3. Проверяем, не куплен ли уже предмет
        $alreadyBought = DB::table('user_cosmetic')
            ->where('user_id', $user->id)
            ->where('cosmetic_id', $item->id)
            ->exists();

        if ($alreadyBought) {
            throw ValidationException::withMessages([
                'cosmetic_item_id' => ['Вы уже владеете этим предметом.'],
            ]);
        }

        // 4. Открываем транзакцию БД
        return DB::transaction(function () use ($user, $item) {

            // 5. Блокируем кошелек (защита от Race Condition)
            // lockForUpdate() ставит блокировку строки до конца транзакции
            $wallet = UserWallet::where('user_id', $user->id)->lockForUpdate()->first();

            // 6. Проверяем баланс
            if ($wallet->balance < $item->price) {
                throw ValidationException::withMessages([
                    'balance' => ['Недостаточно средств на балансе.'],
                ]);
            }

            // 7. Списание средств
            $wallet->balance -= $item->price;
            $wallet->save();

            // 8. Создание записи в журнале транзакций
            $transaction = new Transaction();
            $transaction->user_id = $user->id;
            $transaction->amount = $item->price;
            $transaction->type_id = 2; // 2 = purchase (Покупка косметики)
            $transaction->status_id = 2; // 2 = success (Успешно)
            $transaction->comment = "Покупка предмета: {$item->name}";
            $transaction->created_at = now();
            $transaction->save();

            // 9. Выдача предмета пользователю
            DB::table('user_cosmetic')->insert([
                'user_id' => $user->id,
                'cosmetic_id' => $item->id,
            ]);

            return $transaction;
        });
    }
    public function deposit(User $user, float $amount): Transaction
    {
        return DB::transaction(function () use ($user, $amount) {
            // Блокируем кошелек (защита от Race Condition)
            $wallet = UserWallet::where('user_id', $user->id)->lockForUpdate()->first();

            // Увеличиваем баланс
            $wallet->balance += $amount;
            $wallet->save();

            // Создаем запись в истории транзакций
            $transaction = new Transaction();
            $transaction->user_id = $user->id;
            $transaction->amount = $amount;
            $transaction->type_id = 1; // 1 = deposit (Пополнение)
            $transaction->status_id = 2; // 2 = success (Успешно)
            $transaction->comment = 'Пополнение баланса';
            $transaction->created_at = now();
            $transaction->save();

            return $transaction;
        });
    }
    public function adjustBalance(User $user, float $amount, string $type, ?string $comment = null): Transaction
    {
        // Валидация на всякий случай - сумма должна быть >=0
        if ($amount <= 0) {
            throw ValidationException::withMessages(['amount' => 'Сумма должна быть больше нуля.']);
        }

        return DB::transaction(function () use ($user, $amount, $type, $comment) {
            // Блокируем кошелек от Race Condition (гонки данных)
            $wallet = UserWallet::where('user_id', $user->id)->lockForUpdate()->first();

            // Определяем ID типа транзакции
            // 4 - admin_accrual (начисление), 5 - admin_deduction (списание)
            $typeId = $type === 'accrual' ? 4 : 5;

            // Меняем баланс
            if ($type === 'accrual') {
                $wallet->balance += $amount;
            } else {
                $wallet->balance -= $amount;
            }
            $wallet->save();

            // Пишем в журнал транзакций
            $transaction = new Transaction();
            $transaction->user_id = $user->id;
            $transaction->amount = $amount;
            $transaction->type_id = $typeId;
            $transaction->status_id = 2;
            $transaction->comment = $comment ?? ($type === 'accrual' ? 'Начисление администратором' : 'Списание администратором');
            $transaction->created_at = now();
            $transaction->save();

            return $transaction;
        });
    }
}
