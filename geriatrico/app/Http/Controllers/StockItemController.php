<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegistrarEntradaStockRequest;
use App\Http\Requests\RegistrarSalidaStockRequest;
use App\Http\Requests\StoreStockItemRequest;
use App\Http\Requests\UpdateStockItemRequest;
use App\Http\Resources\MovimientoStockResource;
use App\Http\Resources\StockItemResource;
use App\Http\Traits\LogsStockActions;
use App\Models\StockItem;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class StockItemController extends Controller
{
    use LogsStockActions;

    public function __construct(private readonly StockService $stock)
    {
    }

    public function index(Request $request)
    {
        Gate::authorize('viewAny', StockItem::class);

        $query = StockItem::with('proveedor', 'pacientePropietario')
            ->when($request->filled('propiedad'), fn ($q) => $q->where('propiedad', $request->propiedad))
            ->when($request->filled('paciente_id'), fn ($q) => $q->where('paciente_propietario_id', $request->paciente_id))
            ->when($request->filled('activo'), fn ($q) => $q->where('activo', $request->boolean('activo')));

        if ($request->boolean('all')) {
            return StockItemResource::collection($query->get());
        }

        return StockItemResource::collection(
            $query->paginate((int) $request->get('per_page', 15))
        );
    }

    public function store(StoreStockItemRequest $request)
    {
        Gate::authorize('create', StockItem::class);

        $stockItem = $this->stock->crearConLoteInicial($request->validated(), auth()->id());

        $this->logStockItemCreated($stockItem);

        return (new StockItemResource($stockItem))
            ->response()
            ->setStatusCode(201);
    }

    public function show($id)
    {
        return new StockItemResource(
            StockItem::with(['proveedor', 'movimientos.paciente', 'movimientos.user'])->findOrFail($id)
        );
    }

    public function update(UpdateStockItemRequest $request, $id)
    {
        $stockItem = StockItem::findOrFail($id);
        Gate::authorize('update', $stockItem);

        $validated = $request->validated();

        if (isset($validated['propiedad']) && $validated['propiedad'] !== $stockItem->propiedad) {
            $this->logPropiedadChanged($stockItem, $stockItem->propiedad, $validated['propiedad']);
        }

        $changes = array_diff_assoc($validated, $stockItem->toArray());
        $stockItem->update($validated);

        if (! empty($changes)) {
            $this->logStockItemUpdated($stockItem, $changes);
        }

        return new StockItemResource($stockItem->load('proveedor', 'pacientePropietario'));
    }

    public function destroy($id)
    {
        $stockItem = StockItem::findOrFail($id);
        Gate::authorize('delete', $stockItem);

        $this->logStockItemDeleted($stockItem);

        $stockItem->delete();

        return response()->noContent();
    }

    public function bajoStock()
    {
        return StockItemResource::collection($this->stock->bajoStock());
    }

    public function proximosVencer()
    {
        return StockItemResource::collection($this->stock->proximosVencer());
    }

    public function registrarEntrada(RegistrarEntradaStockRequest $request, $id)
    {
        $stockItem = StockItem::findOrFail($id);
        Gate::authorize('update', $stockItem);

        $resultado = $this->stock->registrarEntrada($stockItem, $request->validated(), auth()->id());

        return response()->json([
            'stockItem' => new StockItemResource($resultado['stockItem']),
            'movimiento' => new MovimientoStockResource($resultado['movimiento']),
        ]);
    }

    public function registrarSalida(RegistrarSalidaStockRequest $request, $id)
    {
        $stockItem = StockItem::findOrFail($id);
        Gate::authorize('update', $stockItem);

        $resultado = $this->stock->registrarSalida($stockItem, $request->validated(), auth()->id());

        return response()->json([
            'stockItem' => new StockItemResource($resultado['stockItem']),
            'movimiento' => new MovimientoStockResource($resultado['movimiento']),
        ]);
    }
}
