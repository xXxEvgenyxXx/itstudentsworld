<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());
        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user' => $user->load('role', 'wallet'),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->validated('email'),
            $request->validated('password'),
        );

        return response()->json($result);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->load('role', 'wallet', 'wishlist', 'cosmetics')
        );
    }

    public function logout(Request $request): JsonResponse
    {
        // Находим реальный токен в БД по Bearer-строке и удаляем его
        if ($request->bearerToken()) {
            $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken());
            if ($token) {
                $token->delete();
            }
        }

        // Также разлогиниваем сессию (на случай Stateful режима)
        auth('web')->logout();

        return response()->json(['message' => 'Вы вышли из системы']);
    }
}
