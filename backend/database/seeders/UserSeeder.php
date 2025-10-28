<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::create([
            'name' => 'Usuário Admin',
            'email' => 'admin@example.com.br',
            'password' => bcrypt('12345678'),
        ]);

        \App\Models\User::create([
            'name' => 'Usuário Teste',
            'email' => 'teste@example.com.br',
            'password' => bcrypt('12345678'),
        ]);
    }
}
