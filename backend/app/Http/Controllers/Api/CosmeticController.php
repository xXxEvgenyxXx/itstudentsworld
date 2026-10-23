<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CosmeticItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CosmeticController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CosmeticItem::with('type');

        // Фильтр по типу (?type=cape)
        if ($request->has('type')) {
            $query->whereHas('type', fn($q) => $q->where('alias', $request->query('type')));
        }

        // Сортировка по цене
        $query->orderBy('price', 'asc');

        // Пагинация
        return response()->json($query->paginate(12));
    }
    public function store(Request $request): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\User::class); // Только админ и выше

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:250'],
            'type_id' => ['required', 'integer', 'exists:cosmetic_type,id'],
            'price' => ['required', 'numeric', 'min:0.01'], // Цена не может быть отрицательной
            'image_url' => ['required', 'string', 'max:255'],
        ]);

        $item = CosmeticItem::create($validated);

        return response()->json(['message' => 'Предмет создан', 'item' => $item->load('type')], 201);
    }

    // Обновление предмета
    public function update(Request $request, CosmeticItem $cosmeticItem): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\User::class);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:250'],
            'type_id' => ['sometimes', 'integer', 'exists:cosmetic_type,id'],
            'price' => ['sometimes', 'numeric', 'min:0.01'],
            'image_url' => ['sometimes', 'string', 'max:255'],
        ]);

        $cosmeticItem->update($validated);

        return response()->json(['message' => 'Предмет обновлен', 'item' => $cosmeticItem->load('type')]);
    }

    // Мягкое удаление предмета
    public function destroy(CosmeticItem $cosmeticItem): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\User::class);

        $cosmeticItem->delete(); // SoftDelete сработает автоматически

        return response()->json(['message' => 'Предмет удален из магазина']);
    }
}
