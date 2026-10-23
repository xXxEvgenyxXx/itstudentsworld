<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $query = User::with('role', 'wallet');

        // Поиск по логину или email
        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('login', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Фильтр по роли
        if ($request->has('role')) {
            $query->whereHas('role', fn($q) => $q->where('alias', $request->query('role')));
        }

        // Сортировка по ID (или дате)
        $query->orderBy('id', 'desc');

        // Пагинация
        return response()->json($query->paginate(15));
    }

    public function toggleBan(Request $request, User $user): JsonResponse
    {
        $this->authorize('ban', $user);

        $user->is_banned = !$user->is_banned;
        $user->save();

        // Если баним - отзываем все токены (разлогиниваем)
        if ($user->is_banned) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => $user->is_banned ? 'Пользователь забанен' : 'Пользователь разбанен',
            'user' => $user->load('role')
        ]);
    }

    public function changeRole(Request $request, User $user): JsonResponse
    {
        $this->authorize('changeRole', $user);

        $validated = $request->validate([
            'role_alias' => ['required', 'string', 'in:user,admin'], // owner ставить нельзя
        ]);

        $role = Role::where('alias', $validated['role_alias'])->firstOrFail();

        $user->role_id = $role->id;
        $user->save();

        return response()->json([
            'message' => 'Роль успешно изменена',
            'user' => $user->load('role')
        ]);
    }
}
