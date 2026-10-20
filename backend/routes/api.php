<?php

use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

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
});

Route::get('/cosmetic-items', [\App\Http\Controllers\Api\CosmeticController::class, 'index']);
