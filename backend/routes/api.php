<?php

use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;

Route::get('/health', HealthController::class);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/me', [UserController::class, 'me']);

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::patch('/users/{user}', [UserController::class, 'update']);
    Route::patch('/users/{user}/password', [UserController::class, 'changePassword']);
    Route::patch('/users/{user}/role', [UserController::class, 'changeRole']);
    Route::patch('/users/{user}/ban', [UserController::class, 'toggleBan']);

    Route::get('/users/{user}/wallet', [UserController::class, 'wallet']);
    Route::get('/users/{user}/cosmetics', [UserController::class, 'cosmetics']);
    Route::get('/users/{user}/transactions', [UserController::class, 'transactions']);

    Route::post('/wishlist/toggle', [\App\Http\Controllers\Api\WishlistController::class, 'toggle']);

    Route::post('/wallet/purchase', [\App\Http\Controllers\Api\WalletController::class, 'purchase']);
    Route::post('/wallet/deposit', [\App\Http\Controllers\Api\WalletController::class, 'deposit']);
    Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
        Route::get('/users', [\App\Http\Controllers\Api\AdminController::class, 'users']);
        Route::patch('/users/{user}/ban', [\App\Http\Controllers\Api\AdminController::class, 'toggleBan']);
        Route::patch('/users/{user}/role', [\App\Http\Controllers\Api\AdminController::class, 'changeRole']);
        Route::post('/cosmetic-items', [\App\Http\Controllers\Api\CosmeticController::class, 'store']);
        Route::patch('/cosmetic-items/{cosmeticItem}', [\App\Http\Controllers\Api\CosmeticController::class, 'update']);
        Route::delete('/cosmetic-items/{cosmeticItem}', [\App\Http\Controllers\Api\CosmeticController::class, 'destroy']);
        Route::get('/cosmetic-items', [\App\Http\Controllers\Api\CosmeticController::class, 'adminIndex']);
        Route::patch('/cosmetic-items/{id}/restore', [\App\Http\Controllers\Api\CosmeticController::class, 'restore']);
        Route::post('/users/{user}/wallet/adjust', [\App\Http\Controllers\Api\AdminController::class, 'adjustBalance']);
        Route::get('/dashboard', [\App\Http\Controllers\Api\AdminController::class, 'dashboard']);
        Route::get('/transactions', [\App\Http\Controllers\Api\AdminController::class, 'transactions']);
    });
});

Route::get('/cosmetic-items', [\App\Http\Controllers\Api\CosmeticController::class, 'index']);
Route::get('/cosmetic-types', fn() => response()->json(\App\Models\CosmeticType::all()));
