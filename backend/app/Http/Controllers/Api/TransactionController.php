<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransactionStatus;
use App\Models\TransactionType;
use Illuminate\Http\JsonResponse;

class TransactionController extends Controller
{
    public function types(): JsonResponse
    {
        return response()->json(TransactionType::all());
    }

    public function statuses(): JsonResponse
    {
        return response()->json(TransactionStatus::all());
    }
}
