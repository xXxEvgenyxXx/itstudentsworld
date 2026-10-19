<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(
        private readonly WalletService $walletService
    ) {}

    public function purchase(Request $request): JsonResponse
    {
        // Проверяем, не забанен ли пользователь
        if ($request->user()->is_banned) {
            return response()->json(['message' => 'Ваш аккаунт заблокирован.'], 403);
        }

        // Валидация входящих данных
        $validated = $request->validate([
            'cosmetic_item_id' => ['required', 'integer', 'exists:cosmetic_item,id'],
        ]);

        // Валидация входящих данных (защита от подмены типов)
        $validated = $request->validate([
            'cosmetic_item_id' => ['required', 'integer', 'exists:cosmetic_item,id'],
        ]);

        // Вызов бизнес-логики
        $transaction = $this->walletService->purchase(
            $request->user(),
            $validated['cosmetic_item_id']
        );

        return response()->json([
            'message' => 'Покупка успешно совершена',
            'transaction' => $transaction,
            'new_balance' => $request->user()->wallet->balance,
        ], 201);
    }
}
