<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class DemoResetController extends Controller
{
    public function reset(Request $request): JsonResponse
    {
        if (! config('app.demo_mode', false)) {
            return response()->json(['error' => 'Demo mode disabled'], Response::HTTP_FORBIDDEN);
        }

        $expected = config('app.demo_reset_token');
        $provided = $request->header('X-Demo-Token');

        if (empty($expected) || ! hash_equals($expected, (string) $provided)) {
            return response()->json(['error' => 'Invalid token'], Response::HTTP_UNAUTHORIZED);
        }

        $startedAt = microtime(true);

        Artisan::call('migrate:fresh', ['--force' => true]);
        Artisan::call('db:seed', ['--class' => 'DemoSeeder', '--force' => true]);

        $duration = round(microtime(true) - $startedAt, 2);

        Log::info('Demo reset ejecutado', ['duration_s' => $duration]);

        return response()->json([
            'ok' => true,
            'duration_s' => $duration,
            'reset_at' => now()->toIso8601String(),
        ]);
    }
}
