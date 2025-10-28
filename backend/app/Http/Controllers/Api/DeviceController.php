<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeviceRequest;
use App\Http\Requests\UpdateDeviceRequest;
use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

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
        $userId = Auth::id();
        $perPage = $request->get('per_page', 15);
        
        $query = DB::table('devices')
            ->where('user_id', $userId)
            ->whereNull('deleted_at');

        // Filtros
        if ($request->has('in_use')) {
            $query->where('in_use', $request->boolean('in_use'));
        }

        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->get('location') . '%');
        }

        if ($request->has('purchase_date_from')) {
            $query->where('purchase_date', '>=', $request->get('purchase_date_from'));
        }

        if ($request->has('purchase_date_to')) {
            $query->where('purchase_date', '<=', $request->get('purchase_date_to'));
        }

        // Ordenação
        $query->orderBy('created_at', 'desc');

        $devices = $query->paginate($perPage);

        return response()->json($devices);
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
        $deviceId = DB::table('devices')->insertGetId([
            'name' => $request->name,
            'location' => $request->location,
            'purchase_date' => $request->purchase_date,
            'in_use' => false,
            'user_id' => Auth::id(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $device = DB::table('devices')->where('id', $deviceId)->first();

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
    public function show(string $id): JsonResponse
    {
        $device = DB::table('devices')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->whereNull('deleted_at')
            ->first();

        if (!$device) {
            return response()->json(['message' => 'Dispositivo não encontrado'], 404);
        }

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
    public function update(UpdateDeviceRequest $request, string $id): JsonResponse
    {
        $device = DB::table('devices')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->whereNull('deleted_at')
            ->first();

        if (!$device) {
            return response()->json(['message' => 'Dispositivo não encontrado'], 404);
        }

        $updateData = array_filter($request->validated());
        $updateData['updated_at'] = now();

        DB::table('devices')
            ->where('id', $id)
            ->update($updateData);

        $updatedDevice = DB::table('devices')->where('id', $id)->first();

        return response()->json($updatedDevice);
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
    public function destroy(string $id): JsonResponse
    {
        $device = DB::table('devices')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->whereNull('deleted_at')
            ->first();

        if (!$device) {
            return response()->json(['message' => 'Dispositivo não encontrado'], 404);
        }

        DB::table('devices')
            ->where('id', $id)
            ->update([
                'deleted_at' => now(),
                'updated_at' => now(),
            ]);

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
    public function toggleUse(string $id): JsonResponse
    {
        $device = DB::table('devices')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->whereNull('deleted_at')
            ->first();

        if (!$device) {
            return response()->json(['message' => 'Dispositivo não encontrado'], 404);
        }

        $newStatus = !$device->in_use;

        DB::table('devices')
            ->where('id', $id)
            ->update([
                'in_use' => $newStatus,
                'updated_at' => now(),
            ]);

        $updatedDevice = DB::table('devices')->where('id', $id)->first();

        return response()->json($updatedDevice);
    }
}
