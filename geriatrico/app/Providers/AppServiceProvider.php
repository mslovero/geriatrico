<?php

namespace App\Providers;

use App\Models\Medicacion;
use App\Observers\MedicacionObserver;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Medicacion::observe(MedicacionObserver::class);
        JsonResource::withoutWrapping();
    }
}

