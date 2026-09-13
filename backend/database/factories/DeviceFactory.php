<?php

namespace Database\Factories;

use App\Models\Device;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Device>
 */
class DeviceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'location' => fake()->city(),
            'purchase_date' => fake()->date(),
            'in_use' => false,
            'user_id' => User::factory(),
        ];
    }

    public function inUse(): static
    {
        return $this->state(fn () => ['in_use' => true]);
    }
}
