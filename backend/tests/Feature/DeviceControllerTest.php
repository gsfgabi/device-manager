<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DeviceControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    public function test_can_list_devices(): void
    {
        // Criar alguns dispositivos para o usuário
        $this->createDevice(['name' => 'iPhone 13', 'location' => 'Escritório']);
        $this->createDevice(['name' => 'Samsung Galaxy', 'location' => 'Casa']);

        $response = $this->getJson('/api/devices');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'location', 'purchase_date', 'in_use', 'user_id']
                ],
                'current_page',
                'per_page',
                'total'
            ]);
    }

    public function test_can_create_device(): void
    {
        $deviceData = [
            'name' => 'iPhone 14 Pro',
            'location' => 'Escritório Central',
            'purchase_date' => '2023-01-15'
        ];

        $response = $this->postJson('/api/devices', $deviceData);

        $response->assertStatus(201)
            ->assertJsonFragment($deviceData);

        $this->assertDatabaseHas('devices', [
            'name' => $deviceData['name'],
            'location' => $deviceData['location'],
            'user_id' => $this->user->id
        ]);
    }

    public function test_cannot_create_device_with_future_date(): void
    {
        // Usar uma data futura mais próxima (amanhã)
        $tomorrow = now()->addDay()->format('Y-m-d');
        
        $deviceData = [
            'name' => 'iPhone 14 Pro',
            'location' => 'Escritório Central',
            'purchase_date' => $tomorrow
        ];

        $response = $this->postJson('/api/devices', $deviceData);

        // Verificar se retornou erro de validação
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['purchase_date']);
    }

    public function test_cannot_create_device_without_required_fields(): void
    {
        $response = $this->postJson('/api/devices', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'location', 'purchase_date']);
    }

    public function test_can_show_device(): void
    {
        $device = $this->createDevice();

        $response = $this->getJson("/api/devices/{$device->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $device->id,
                'name' => $device->name
            ]);
    }

    public function test_cannot_show_other_user_device(): void
    {
        $otherUser = User::factory()->create();
        $device = $this->createDevice(['user_id' => $otherUser->id]);

        $response = $this->getJson("/api/devices/{$device->id}");

        $response->assertStatus(404);
    }

    public function test_can_update_device(): void
    {
        $device = $this->createDevice();
        $updateData = [
            'name' => 'iPhone 14 Pro Max',
            'location' => 'Sala de Reuniões'
        ];

        $response = $this->putJson("/api/devices/{$device->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment($updateData);

        $this->assertDatabaseHas('devices', [
            'id' => $device->id,
            'name' => $updateData['name'],
            'location' => $updateData['location']
        ]);
    }

    public function test_can_toggle_device_use(): void
    {
        $device = $this->createDevice(['in_use' => false]);

        $response = $this->patchJson("/api/devices/{$device->id}/use");

        $response->assertStatus(200);
        
        // Verificar se o status mudou (pode ser 1 ou true)
        $responseData = $response->json();
        $this->assertTrue($responseData['in_use'] === true || $responseData['in_use'] === 1);

        $this->assertDatabaseHas('devices', [
            'id' => $device->id,
            'in_use' => true
        ]);
    }

    public function test_can_delete_device(): void
    {
        $device = $this->createDevice();

        $response = $this->deleteJson("/api/devices/{$device->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Dispositivo excluído com sucesso']);

        $this->assertSoftDeleted('devices', ['id' => $device->id]);
    }

    public function test_can_filter_devices_by_location(): void
    {
        $this->createDevice(['name' => 'iPhone', 'location' => 'Escritório']);
        $this->createDevice(['name' => 'Samsung', 'location' => 'Casa']);

        $response = $this->getJson('/api/devices?location=Escritório');

        $response->assertStatus(200);
        $devices = $response->json('data');
        $this->assertCount(1, $devices);
        $this->assertEquals('Escritório', $devices[0]['location']);
    }

    public function test_can_filter_devices_by_status(): void
    {
        $this->createDevice(['name' => 'iPhone', 'in_use' => true]);
        $this->createDevice(['name' => 'Samsung', 'in_use' => false]);

        $response = $this->getJson('/api/devices?in_use=true');

        $response->assertStatus(200);
        $devices = $response->json('data');
        $this->assertCount(1, $devices);
        // Verificar se o status está correto (pode ser 1 ou true)
        $this->assertTrue($devices[0]['in_use'] === true || $devices[0]['in_use'] === 1);
    }

    public function test_can_filter_devices_by_date_range(): void
    {
        $this->createDevice(['name' => 'iPhone', 'purchase_date' => '2023-01-01']);
        $this->createDevice(['name' => 'Samsung', 'purchase_date' => '2023-06-01']);

        $response = $this->getJson('/api/devices?purchase_date_from=2023-01-01&purchase_date_to=2023-03-01');

        $response->assertStatus(200);
        $devices = $response->json('data');
        $this->assertCount(1, $devices);
        $this->assertEquals('iPhone', $devices[0]['name']);
    }

    private function createDevice(array $attributes = []): \stdClass
    {
        $defaults = [
            'name' => $this->faker->word,
            'location' => $this->faker->word,
            'purchase_date' => $this->faker->date(),
            'in_use' => false,
            'user_id' => $this->user->id
        ];

        $data = array_merge($defaults, $attributes);

        $id = \DB::table('devices')->insertGetId([
            'name' => $data['name'],
            'location' => $data['location'],
            'purchase_date' => $data['purchase_date'],
            'in_use' => $data['in_use'],
            'user_id' => $data['user_id'],
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return \DB::table('devices')->where('id', $id)->first();
    }
}
