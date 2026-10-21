<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WishlistController extends Controller
{
    public function toggle(Request $request): JsonResponse
    {

        if ($request->user()->is_banned) {
            return response()->json(['message' => 'Аккаунт заблокирован.'], 403);
        }

        $validated = $request->validate([
            'cosmetic_item_id' => ['required', 'integer', 'exists:cosmetic_item,id'],
        ]);

        $userId = $request->user()->id;
        $itemId = $validated['cosmetic_item_id'];

        $exists = DB::table('user_wishlist')
            ->where('user_id', $userId)
            ->where('cosmetic_id', $itemId)
            ->exists();

        if ($exists) {
            // Если уже в избранном — удаляем
            DB::table('user_wishlist')->where('user_id', $userId)->where('cosmetic_id', $itemId)->delete();
            return response()->json(['status' => 'removed']);
        }

        // Если нет — добавляем
        DB::table('user_wishlist')->insert([
            'user_id' => $userId,
            'cosmetic_id' => $itemId,
        ]);

        return response()->json(['status' => 'added']);
    }
}
