<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class PushSubscriptionController extends Controller
{
    /**
     * Guardar o actualizar una suscripción push.
     */
    public function update(Request $request)
    {
        $this->validate($request, [
            'endpoint' => 'required',
            'keys.auth' => 'required',
            'keys.p256dh' => 'required'
        ]);

        $endpoint = $request->endpoint;
        $key = $request->keys['p256dh'];
        $token = $request->keys['auth'];

        $request->user()->updatePushSubscription($endpoint, $key, $token);

        return response()->json(['message' => 'Suscripción push guardada correctamente'], 200);
    }

    /**
     * Eliminar una suscripción push.
     */
    public function destroy(Request $request)
    {
        $this->validate($request, [
            'endpoint' => 'required'
        ]);

        $request->user()->deletePushSubscription($request->endpoint);

        return response()->json(['message' => 'Suscripción push eliminada'], 200);
    }
}
