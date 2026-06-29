<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('products', ProductController::class)->except(['create', 'show', 'edit']);
    Route::resource('categories', CategoryController::class)->except(['create', 'show', 'edit']);
    Route::get('pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('pos/checkout', [PosController::class, 'store'])->name('pos.checkout');
    Route::get('pos/receipt/{sale}', [PosController::class, 'show'])->name('pos.receipt');
});

require __DIR__.'/settings.php';
