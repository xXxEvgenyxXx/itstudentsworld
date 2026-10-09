<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $query = User::with('role', 'wallet');

        // Фильтры
        if ($request->has('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('nickname', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%")
                  ->orWhere('name', 'like', "%$s%")
                  ->orWhere('surname', 'like', "%$s%");
            });
        }

        if ($request->has('is_banned')) {
            $query->where('is_banned', (bool) $request->input('is_banned'));
        }

        if ($request->has('role')) {
            $query->whereHas('role', fn ($q) => $q->where('alias', $request->input('role')));
        }

        $perPage = min((int) $request->input('per_page', 20), 100);

        return response()->json($query->paginate($perPage));
    }

    public function show(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return response()->json($user->load('role', 'wallet'));
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->load('role', 'wallet')
        );
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:50'],
            'surname' => ['sometimes', 'string', 'max:50'],
            'patronymic' => ['nullable', 'string', 'max:50'],
            'email' => ['sometimes', 'email', 'max:250', 'unique:user,email,' . $user->id],
            'nickname' => ['prohibited'],  // запрещает поле, вернёт 422 с понятным сообщением
        ]);

        return response()->json($this->userService->updateProfile($user, $data));
    }

    public function changePassword(Request $request, User $user): JsonResponse
    {
        $this->authorize('changePassword', $user);

        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (!\Hash::check($request->input('current_password'), $user->password_hash)) {
            return response()->json([
                'message' => 'Текущий пароль неверен.',
            ], 422);
        }

        $this->userService->changePassword($user, $request->input('password'));

        return response()->json(['message' => 'Пароль изменён']);
    }

    public function changeRole(Request $request, User $user): JsonResponse
    {
        $this->authorize('changeRole', $user);

        $request->validate([
            'new_role' => ['required', 'in:user,admin'],
        ]);

        return response()->json(
            $this->userService->changeRole($user, $request->input('new_role'))
        );
    }

    public function toggleBan(User $user): JsonResponse
    {
        $this->authorize('ban', $user);

        return response()->json(
            $this->userService->toggleBan($user)
        );
    }

    public function wallet(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return response()->json($user->wallet);
    }

    public function cosmetics(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return response()->json($user->cosmetics);
    }

    public function transactions(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return response()->json($user->transactions()->with('type', 'status')->get());
    }
}
