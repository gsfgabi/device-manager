# Device Manager

[![Tests](https://github.com/gsfgabi/device-manager/actions/workflows/tests.yml/badge.svg)](https://github.com/gsfgabi/device-manager/actions/workflows/tests.yml)

Inventário de celulares corporativos. Cada usuário autentica com Sanctum e só opera nos próprios aparelhos: a `DevicePolicy` responde **403** se o device é de outra pessoa. Exclusão é `SoftDeletes` — o registro permanece para auditoria.

Stack: **Laravel 12**, **Angular 20**, Sanctum, Eloquent.

Backend e frontend são serviços separados. A API REST em JSON autentica o SPA; o isolamento de dono fica no model e na Policy, não em `DB::table()` espalhado no controller.

## Como funciona

1. Login (`POST /api/auth/login`) devolve um token Bearer.
2. O Angular envia o token em todas as chamadas autenticadas.
3. `DeviceController` autoriza via Policy e consulta `Device` (Eloquent + `SoftDeletes`).
4. Lista, filtros, cadastro, edição, toggle de uso e exclusão valem só para o dono.

## Rodar localmente

```bash
git clone https://github.com/gsfgabi/device-manager.git
cd device-manager
```

Backend:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Frontend (outro terminal):

```bash
cd frontend
npm install
npm start
```

App em `http://localhost:4200`. API em `http://localhost:8000`.

Login do seeder: `admin@example.com.br` / `12345678`.

## API

Rotas de devices exigem `Authorization: Bearer {token}`.

| Método | Rota | Ação |
| --- | --- | --- |
| POST | `/api/auth/login` | Login |
| GET | `/api/devices` | Lista paginada (`in_use`, `location`, `purchase_date_from`, `purchase_date_to`) |
| POST | `/api/devices` | Cria |
| GET | `/api/devices/{id}` | Mostra (403 se não for dono) |
| PUT | `/api/devices/{id}` | Atualiza |
| PATCH | `/api/devices/{id}/use` | Alterna em uso |
| DELETE | `/api/devices/{id}` | Soft delete |

Swagger: `cd backend && php artisan l5-swagger:generate` → `http://localhost:8000/api/documentation`.

## Testes e CI

```bash
cd backend
php artisan test
```

O workflow [Tests](https://github.com/gsfgabi/device-manager/actions/workflows/tests.yml) roda a suíte no PHP 8.3 a cada push/PR, incluindo 403 quando o dispositivo é de outro usuário.

Frontend: `cd frontend && npm test`.

## Licença

MIT.
