<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/home', function () {
    return Inertia::render('Home');
})->middleware(['auth', 'verified'])->name('home');

Route::get('/my-appointments', function () {
    return Inertia::render('MyAppointments');
})->name('my.appointments');

Route::post('/appointments', [\App\Http\Controllers\AppointmentController::class, 'store']);
Route::get('/appointments', [\App\Http\Controllers\AppointmentController::class, 'index']);
Route::get('/appointments/{appointmentId}/cancel', [\App\Http\Controllers\AppointmentController::class, 'cancel']);
Route::get('/appointments/me', [\App\Http\Controllers\AppointmentController::class, 'myAppointments']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
