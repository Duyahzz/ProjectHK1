<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ShipmentTypeController;
use App\Http\Controllers\Api\ShipmentController;
use App\Http\Controllers\Api\BillController;

Route::get('/test-db', function () {
    return DB::table('branches')->get();
});

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::post('/auth/reset-password-by-phone', [AuthController::class, 'resetPasswordByPhone']);
Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);
/*
|--------------------------------------------------------------------------
| Main APIs
|--------------------------------------------------------------------------
*/
Route::get('/dashboard', [DashboardController::class, 'index']);

Route::get('/branches', [BranchController::class, 'index']);
Route::post('/branches', [BranchController::class, 'store']);
Route::patch('/branches/{branch}/status', [BranchController::class, 'updateStatus']);

Route::get('/customers', [CustomerController::class, 'index']);
Route::post('/customers', [CustomerController::class, 'store']);
Route::put('/customers/{customer}', [CustomerController::class, 'update']);
Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);

Route::get('/shipment-types', [ShipmentTypeController::class, 'index']);

Route::get('/shipments', [ShipmentController::class, 'index']);
Route::get('/shipments/{shipment}', [ShipmentController::class, 'show']);
Route::post('/shipments', [ShipmentController::class, 'store']);
Route::post('/shipments/{shipment}/status', [ShipmentController::class, 'updateStatus']);
Route::get('/tracking/{tracking}', [ShipmentController::class, 'trackByNumber']);

Route::get('/bills', [BillController::class, 'index']);
Route::get('/bills/{bill}', [BillController::class, 'show']);
Route::get('/bills/by-tracking/{tracking}', [BillController::class, 'byTracking']);