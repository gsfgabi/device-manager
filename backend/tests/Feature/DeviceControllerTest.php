<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DeviceControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    public function test_can_list_devices(): void
    {
        Device::factory()->count(2)->create(['user_id' => $this->user->id]);

        $this->getJson('/api/devices')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'location', 'purchase_date', 'in_use', 'user_id'],
                ],
                'current_page',
                'per_page',
                'total',
            ]);
    }

    public function test_can_create_device(): void
    {
        $deviceData = [
            'name' => 'iPhone 14 Pro',
            'location' => 'Escritório Central',
            'purchase_date' => '2023-01-15',
        ];

        $this->postJson('/api/devices', $deviceData)
            ->assertCreated()
            ->assertJsonFragment($deviceData);

        $this->assertDatabaseHas('devices', [
            'name' => $deviceData['name'],
            'location' => $deviceData['location'],
            'user_id' => $this->user->id,
        ]);
    }

    public function test_cannot_create_device_with_future_date(): void
    {
        $this->postJson('/api/devices', [
            'name' => 'iPhone 14 Pro',
            'location' => 'Escritório Central',
            'purchase_date' => now()->addDay()->format('Y-m-d'),
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['purchase_date']);
    }

    public function test_cannot_create_device_without_required_fields(): void
    {
        $this->postJson('/api/devices', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'location', 'purchase_date']);
    }

    public function test_can_show_device(): void
    {
        $device = Device::factory()->create(['user_id' => $this->user->id]);

        $this->getJson("/api/devices/{$device->id}")
            ->assertOk()
            ->assertJsonFragment([
                'id' => $device->id,
                'name' => $device->name,
            ]);
    }

    public function test_cannot_show_other_user_device(): void
    {
        $device = Device::factory()->create();

        $this->getJson("/api/devices/{$device->id}")
            ->assertForbidden();
    }

    public function test_can_update_device(): void
    {
        $device = Device::factory()->create(['user_id' => $this->user->id]);
        $updateData = [
            'name' => 'iPhone 14 Pro Max',
            'location' => 'Sala de Reuniões',
        ];

        $this->putJson("/api/devices/{$device->id}", $updateData)
            ->assertOk()
            ->assertJsonFragment($updateData);

        $this->assertDatabaseHas('devices', [
            'id' => $device->id,
            'name' => $updateData['name'],
            'location' => $updateData['location'],
        ]);
    }

    public function test_cannot_update_other_user_device(): void
    {
        $device = Device::factory()->create();

        $this->putJson("/api/devices/{$device->id}", ['name' => 'Hack'])
            ->assertForbidden();

        $this->assertDatabaseMissing('devices', [
            'id' => $device->id,
            'name' => 'Hack',
        ]);
    }

    public function test_can_toggle_device_use(): void
    {
        $device = Device::factory()->create([
            'user_id' => $this->user->id,
            'in_use' => false,
        ]);

        $this->patchJson("/api/devices/{$device->id}/use")
            ->assertOk()
            ->assertJsonPath('in_use', true);

        $this->assertDatabaseHas('devices', [
            'id' => $device->id,
            'in_use' => true,
        ]);
    }

    public function test_can_delete_device(): void
    {
        $device = Device::factory()->create(['user_id' => $this->user->id]);

        $this->deleteJson("/api/devices/{$device->id}")
            ->assertOk()
            ->assertJsonFragment(['message' => 'Dispositivo excluído com sucesso']);

        $this->assertSoftDeleted('devices', ['id' => $device->id]);
    }

    public function test_cannot_delete_other_user_device(): void
    {
        $device = Device::factory()->create();

        $this->deleteJson("/api/devices/{$device->id}")
            ->assertForbidden();

        $this->assertNotSoftDeleted('devices', ['id' => $device->id]);
    }

    public function test_can_filter_devices_by_location(): void
    {
        Device::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'iPhone',
            'location' => 'Escritório',
        ]);
        Device::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Samsung',
            'location' => 'Casa',
        ]);

        $devices = $this->getJson('/api/devices?location=Escritório')
            ->assertOk()
            ->json('data');

        $this->assertCount(1, $devices);
        $this->assertEquals('Escritório', $devices[0]['location']);
    }

    public function test_can_filter_devices_by_status(): void
    {
        Device::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'iPhone',
            'in_use' => true,
        ]);
        Device::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Samsung',
            'in_use' => false,
        ]);

        $devices = $this->getJson('/api/devices?in_use=true')
            ->assertOk()
            ->json('data');

        $this->assertCount(1, $devices);
        $this->assertTrue($devices[0]['in_use']);
    }

    public function test_can_filter_devices_by_date_range(): void
    {
        Device::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'iPhone',
            'purchase_date' => '2023-01-01',
        ]);
        Device::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Samsung',
            'purchase_date' => '2023-06-01',
        ]);

        $devices = $this->getJson('/api/devices?purchase_date_from=2023-01-01&purchase_date_to=2023-03-01')
            ->assertOk()
            ->json('data');

        $this->assertCount(1, $devices);
        $this->assertEquals('iPhone', $devices[0]['name']);
    }
}
