<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth');

Route::middleware('auth')->group(function () {
    Route::get('/users/list', [UserManagementController::class, 'index']);
    Route::post('/users', [UserManagementController::class, 'store']);
    Route::put('/users/{user}', [UserManagementController::class, 'update']);
    Route::patch('/users/{user}/status', [UserManagementController::class, 'updateStatus']);
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy']);
});

Route::get('/', function () {
    return view('app');
});
