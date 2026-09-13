# Backend

API Laravel 12 do Device Manager (Sanctum, Eloquent, `DevicePolicy`).

Instalação, rotas e testes estão no [README da raiz](../README.md).

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
php artisan test
```
