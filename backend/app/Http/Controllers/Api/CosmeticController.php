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
}
