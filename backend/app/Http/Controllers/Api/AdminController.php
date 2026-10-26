<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use App\Services\WalletService;
use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function __construct(
        private readonly WalletService $walletService
    ) {}
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
    public function adjustBalance(Request $request, User $user): JsonResponse
    {
        // Только админ или владелец могут менять баланс
        $this->authorize('viewAny', User::class);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'], // Строго положительное число
            'type' => ['required', 'string', 'in:accrual,deduction'],
            'comment' => ['nullable', 'string', 'max:255'],
        ]);

        $transaction = $this->walletService->adjustBalance(
            $user,
            $validated['amount'],
            $validated['type'],
            $validated['comment'] ?? null
        );

        return response()->json([
            'message' => 'Баланс успешно скорректирован',
            'transaction' => $transaction,
            'new_balance' => $user->wallet()->first()->balance,
        ]);
    }
    public function dashboard(): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        // 1. Статистика по пользователям
        $totalUsers = User::count();
        $bannedUsers = User::where('is_banned', true)->count();

        // Считаем админов и владельцев (вдруг их несколько)
        $totalAdmins = User::whereHas('role', function($q) {
            $q->whereIn('alias', ['admin', 'owner']);
        })->count();

        // 2. Статистика по транзакциям
        $totalTransactions = Transaction::count();
        $failedTransactions = Transaction::whereHas('status', fn($q) => $q->where('alias', 'failed'))->count();
        $pendingTransactions = Transaction::whereHas('status', fn($q) => $q->where('alias', 'pending'))->count();

        // Сумма всех успешных пополнений
        $totalRevenue = Transaction::whereHas('type', fn($q) => $q->where('alias', 'deposit'))
            ->whereHas('status', fn($q) => $q->where('alias', 'success'))
            ->sum('amount');

        // 3. Статистика по магазину
        $totalCosmetics = \App\Models\CosmeticItem::count();

        return response()->json([
            'stats' => [
                'users' => [
                    'total' => $totalUsers,
                    'banned' => $bannedUsers,
                    'admins' => $totalAdmins,
                ],
                'transactions' => [
                    'total' => $totalTransactions,
                    'failed' => $failedTransactions,
                    'pending' => $pendingTransactions,
                    'revenue' => $totalRevenue,
                ],
                'shop' => [
                    'total_cosmetics' => $totalCosmetics,
                ]
            ],
            // Последние 5 транзакций (для быстрой ленты событий)
            'recent_transactions' => Transaction::with('user', 'type', 'status')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
        ]);
    }
    // Список всех транзакций с фильтрами (Админка)
    public function transactions(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $query = Transaction::with('user', 'type', 'status');

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                ->orWhereHas('user', fn($userQuery) => $userQuery->where('login', 'like', "%{$search}%"));
            });
        }

        // Фильтр по статусу (например, ?status=failed)
        if ($request->filled('status')) {
            $query->whereHas('status', fn($q) => $q->where('alias', $request->query('status')));
        }

        // Фильтр по типу (например, ?type=deposit)
        if ($request->filled('type')) {
            $query->whereHas('type', fn($q) => $q->where('alias', $request->query('type')));
        }

        // Сортировка: сначала новые
        $query->orderBy('created_at', 'desc');

        return response()->json($query->paginate(15));
    }
}
