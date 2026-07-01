<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\CouponValidationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {

    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('products', ProductController::class)->except(['create', 'show', 'edit']);
    Route::resource('categories', CategoryController::class)->except(['create', 'show', 'edit']);

    Route::resource('employees', EmployeeController::class)->except(['create', 'show', 'edit'])->middleware('role:Admin');
    Route::resource('suppliers', SupplierController::class)->except(['create', 'show', 'edit'])->middleware('role:Admin');

    Route::resource('coupons', CouponController::class)->except(['create', 'show', 'edit'])->middleware('role:Admin');

    Route::get('pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('pos/checkout', [CheckoutController::class, 'store'])->name('pos.checkout');
    Route::post('pos/coupon', CouponValidationController::class)->name('pos.coupon');
    Route::get('pos/receipt/{sale}', [PosController::class, 'show'])->name('pos.receipt');

    Route::resource('roles', RoleController::class)->except(['create', 'show', 'edit'])->middleware('role:Admin');
    Route::resource('permissions', PermissionController::class)->except(['create', 'show', 'edit'])->middleware('role:Admin');
});

require __DIR__.'/settings.php';
