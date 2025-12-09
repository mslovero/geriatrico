<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Medicacion;
use App\Observers\MedicacionObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Medicacion::observe(MedicacionObserver::class);
    }
}

