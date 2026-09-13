<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeviceRequest;
use App\Http\Requests\UpdateDeviceRequest;
use App\Models\Device;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Devices",
 *     description="Operações relacionadas aos dispositivos"
 * )
 */
class DeviceController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/devices",
     *     summary="Listar dispositivos paginados",
     *     tags={"Devices"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Número da página",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="in_use",
     *         in="query",
     *         description="Filtrar por status de uso",
     *         required=false,
     *         @OA\Schema(type="boolean")
     *     ),
     *     @OA\Parameter(
     *         name="location",
     *         in="query",
     *         description="Filtrar por localização",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="purchase_date_from",
     *         in="query",
     *         description="Data de compra inicial",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="purchase_date_to",
     *         in="query",
     *         description="Data de compra final",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de dispositivos paginada",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Device")),
     *             @OA\Property(property="links", type="object"),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Device::class);

        $query = Device::query()->where('user_id', $request->user()->id);

        if ($request->has('in_use')) {
            $query->where('in_use', $request->boolean('in_use'));
        }

        if ($request->filled('location')) {
            $query->where('location', 'like', '%'.$request->get('location').'%');
        }

        if ($request->filled('purchase_date_from')) {
            $query->whereDate('purchase_date', '>=', $request->get('purchase_date_from'));
        }

        if ($request->filled('purchase_date_to')) {
            $query->whereDate('purchase_date', '<=', $request->get('purchase_date_to'));
        }

        return response()->json(
            $query->latest()->paginate($request->integer('per_page', 15))
        );
    }

    /**
     * @OA\Post(
     *     path="/api/devices",
     *     summary="Criar novo dispositivo",
     *     tags={"Devices"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","location","purchase_date"},
     *             @OA\Property(property="name", type="string", example="iPhone 13"),
     *             @OA\Property(property="location", type="string", example="Escritório Central"),
     *             @OA\Property(property="purchase_date", type="string", format="date", example="2023-01-15")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Dispositivo criado com sucesso",
     *         @OA\JsonContent(ref="#/components/schemas/Device")
     *     )
     * )
     */
    public function store(StoreDeviceRequest $request): JsonResponse
    {
        $this->authorize('create', Device::class);

        $device = $request->user()->devices()->create([
            'name' => $request->validated('name'),
            'location' => $request->validated('location'),
            'purchase_date' => $request->validated('purchase_date'),
            'in_use' => false,
        ]);

        return response()->json($device, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/devices/{id}",
     *     summary="Exibir dispositivo específico",
     *     tags={"Devices"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do dispositivo",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Dispositivo encontrado",
     *         @OA\JsonContent(ref="#/components/schemas/Device")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Dispositivo não encontrado"
     *     )
     * )
     */
    public function show(Device $device): JsonResponse
    {
        $this->authorize('view', $device);

        return response()->json($device);
    }

    /**
     * @OA\Put(
     *     path="/api/devices/{id}",
     *     summary="Atualizar dispositivo",
     *     tags={"Devices"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do dispositivo",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="iPhone 13 Pro"),
     *             @OA\Property(property="location", type="string", example="Escritório Central"),
     *             @OA\Property(property="purchase_date", type="string", format="date", example="2023-01-15")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Dispositivo atualizado com sucesso",
     *         @OA\JsonContent(ref="#/components/schemas/Device")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Dispositivo não encontrado"
     *     )
     * )
     */
    public function update(UpdateDeviceRequest $request, Device $device): JsonResponse
    {
        $this->authorize('update', $device);

        $device->update($request->validated());

        return response()->json($device);
    }

    /**
     * @OA\Delete(
     *     path="/api/devices/{id}",
     *     summary="Excluir dispositivo (Soft Delete)",
     *     tags={"Devices"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do dispositivo",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Dispositivo excluído com sucesso"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Dispositivo não encontrado"
     *     )
     * )
     */
    public function destroy(Device $device): JsonResponse
    {
        $this->authorize('delete', $device);

        $device->delete();

        return response()->json(['message' => 'Dispositivo excluído com sucesso']);
    }

    /**
     * @OA\Patch(
     *     path="/api/devices/{id}/use",
     *     summary="Marcar/desmarcar dispositivo como em uso",
     *     tags={"Devices"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do dispositivo",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Status de uso atualizado com sucesso",
     *         @OA\JsonContent(ref="#/components/schemas/Device")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Dispositivo não encontrado"
     *     )
     * )
     */
    public function toggleUse(Device $device): JsonResponse
    {
        $this->authorize('update', $device);

        $device->update(['in_use' => ! $device->in_use]);

        return response()->json($device->fresh());
    }
}
