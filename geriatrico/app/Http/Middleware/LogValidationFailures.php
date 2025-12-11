<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogValidationFailures
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Si la respuesta es un error de validación (422 o 400)
        if ($response->status() === 422 || $response->status() === 400) {
            $this->logValidationFailure($request, $response);
        }

        return $response;
    }

    /**
     * Registrar el intento fallido de validación
     */
    protected function logValidationFailure(Request $request, Response $response)
    {
        $user = $request->user();
        $userId = $user ? $user->id : 'guest';
        $userName = $user ? $user->name : 'Guest';

        $data = [
            'timestamp' => now()->toDateTimeString(),
            'user_id' => $userId,
            'user_name' => $userName,
            'ip' => $request->ip(),
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'endpoint' => $request->path(),
            'status_code' => $response->status(),
            'errors' => $this->getErrorsFromResponse($response),
            'input_data' => $this->sanitizeInputData($request->all()),
        ];

        // Log en canal específico de validaciones
        Log::channel('validation_failures')->warning('Validation Failed', $data);

        // Si es un endpoint crítico, log adicional
        if ($this->isCriticalEndpoint($request->path())) {
            Log::channel('security')->warning('Critical Endpoint Validation Failure', [
                'user_id' => $userId,
                'endpoint' => $request->path(),
                'errors' => $data['errors'],
            ]);
        }
    }

    /**
     * Extraer errores de la respuesta JSON
     */
    protected function getErrorsFromResponse(Response $response)
    {
        $content = $response->getContent();

        if (empty($content)) {
            return [];
        }

        $decoded = json_decode($content, true);

        // Laravel devuelve errores en 'errors' o 'error'
        return $decoded['errors'] ?? ($decoded['error'] ?? []);
    }

    /**
     * Sanitizar datos de entrada para no logear información sensible
     */
    protected function sanitizeInputData(array $data)
    {
        $sensitive = ['password', 'password_confirmation', 'token', 'api_token', 'card_number'];

        foreach ($sensitive as $key) {
            if (isset($data[$key])) {
                $data[$key] = '***REDACTED***';
            }
        }

        return $data;
    }

    /**
     * Determinar si un endpoint es crítico
     */
    protected function isCriticalEndpoint(string $path)
    {
        $criticalEndpoints = [
            'registro-medicaciones',
            'movimientos-stock/administrar',
            'lotes-stock',
            'stock-items',
            'medicamentos/batch',
        ];

        foreach ($criticalEndpoints as $endpoint) {
            if (str_contains($path, $endpoint)) {
                return true;
            }
        }

        return false;
    }
}
