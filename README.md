# Device Manager

**Sistema de Gerenciamento de Dispositivos Celulares**

---

## 📑 Índice

- [1. Sobre o Projeto](#1-sobre-o-projeto)
- [2. Como Funciona](#2-como-funciona)
- [3. Tecnologias Escolhidas](#3-tecnologias-escolhidas)
- [4. Arquitetura e Decisões Técnicas](#4-arquitetura-e-decisões-técnicas)
- [5. Instalação](#5-instalação)
- [6. Uso do Sistema](#6-uso-do-sistema)
- [7. API REST - Documentação](#7-api-rest---documentação)
- [8. Como o Código Funciona](#8-como-o-código-funciona)
- [9. Testes](#9-testes)
- [10. Estrutura de Dados](#10-estrutura-de-dados)

---

## 1. Sobre o Projeto

O **Device Manager** é uma aplicação web que permite controlar e gerenciar dispositivos móveis corporativos. Surgiu da necessidade de ter uma forma centralizada e organizada de saber quais celulares a empresa possui, onde estão localizados, quando foram comprados e se estão disponíveis ou em uso.

### Problema que Resolve

Antes do Device Manager, o controle de dispositivos era feito em planilhas, o que gerava problemas como:
- Dificuldade em atualizar informações
- Dados desatualizados ou perdidos
- Falta de histórico
- Impossibilidade de controle de acesso por usuário

Agora, cada funcionário tem sua própria conta, registra seus dispositivos e pode facilmente verificar status e localização.

---

## 2. Como Funciona

### Fluxo Principal

**1. Autenticação**
O usuário faz login com email e senha. O sistema verifica as credenciais e retorna um token de acesso (JWT), que funciona como uma "chave temporária" para acessar as funcionalidades.

**2. Gerenciamento de Dispositivos**
Após autenticado, o usuário pode:
- Ver todos os seus dispositivos em uma lista
- Cadastrar novos dispositivos
- Marcar dispositivos como "em uso" ou "disponível"
- Filtrar por localização, status ou período de compra
- Editar informações
- Excluir (mas mantém histórico)

**3. Isolamento de Dados**
Um ponto importante: cada usuário só vê seus próprios dispositivos. Quando você faz login, o sistema automaticamente filtra e mostra apenas o que pertence ao seu usuário.

### Por que Soft Delete?

Quando você "exclui" um dispositivo, ele não é realmente apagado do banco de dados. Em vez disso, é marcado com uma data de exclusão. Isso permite:
- Manter histórico para auditoria
- Possibilitar restaurar se necessário
- Gerar relatórios históricos

---

## 3. Tecnologias Escolhidas

### Backend: Laravel 11

**Por quê Laravel?**
- Framework maduro e bem documentado
- Muitas funcionalidades prontas (autenticação, validação, migrations)
- Sintaxe elegante e produtiva
- Comunidade ativa

**Autenticação: Laravel Sanctum**
Escolhemos Sanctum porque ele é simples, moderno e permite autenticação via tokens sem a complexidade do OAuth. Ele gerencia automaticamente:
- Criação e revogação de tokens
- Expiração de tokens
- Middleware de autenticação

**Banco de Dados: SQLite**
Para desenvolvimento e até pequenas aplicações, o SQLite é perfeito:
- Não precisa de servidor dedicado
- Arquivo único, fácil de fazer backup
- Performance excelente para volumes moderados
- Zero configuração

### Frontend: Angular 20

**Por quê Angular?**
- Framework completo com tudo que precisa
- TypeScript nativo (mais seguro que JavaScript)
- Reactive Forms (perfect para formulários complexos)
- Estrutura organizada e escalável
- Grande empresa por trás (Google)

**Angular Material**
Para não perder tempo criando componentes do zero, usamos o Material:
- Componentes bonitos e funcionais
- Tema consistente
- Acessibilidade já implementada
- Responsivo por padrão

---

## 4. Arquitetura e Decisões Técnicas

### Por que Frontend e Backend Separados?

Separamos completamente frontend e backend porque:
- Cada um pode evoluir independentemente
- Facilita manutenção por equipes diferentes
- Backend pode servir mobile apps no futuro
- Frontend pode ser deployado em CDN (mais rápido)
- Fácil testar e debugar cada parte separadamente

### Comunicação via API REST

Escolhemos REST pela simplicidade e universalidade:

```
Frontend (Angular) ←→ HTTP/JSON ←→ Backend (Laravel) ←→ SQLite
```

- **JSON** é legível e universal
- **HTTP** é o padrão da web
- **REST** segue convenções conhecidas (GET, POST, PUT, DELETE)

### Estrutura de Pastas

```
device-manager/
├── backend/                    # API Laravel
│   ├── app/Http/Controllers/   # Onde fica a lógica das rotas
│   ├── app/Models/             # Modelos de dados
│   ├── routes/api.php          # Definição das rotas
│   └── database/migrations/    # Estrutura do banco
│
└── frontend/                   # SPA Angular
    └── src/app/
        ├── components/         # Componentes visuais
        ├── services/           # Comunicação com API
        ├── guards/             # Proteção de rotas
        └── models/             # Interfaces TypeScript
```

### Por que Query Builder em vez de Eloquent?

No código, usamos `DB::table()` em vez do Eloquent ORM porque:
- Controle total sobre as queries SQL
- Performance melhor para operações simples
- Não adiciona overhead desnecessário
- Query direta é mais clara para casos específicos

Exemplo:
```php
// Em vez de: Device::where('user_id', $userId)->get()
// Usamos: DB::table('devices')->where('user_id', $userId)->get()
```

---

## 5. Instalação

### Pré-requisitos

- PHP 8.2+ (sistema PHP mais recente e rápido)
- Composer (gerenciador de pacotes PHP)
- Node.js 18+ (runtime JavaScript)
- NPM (gerenciador de pacotes Node)

### Passo a Passo

**1. Clone o repositório**
```bash
git clone <url-do-repositorio>
cd device-manager
```

**2. Configure o Backend**
```bash
cd backend
composer install              # Instala dependências PHP
cp .env.example .env         # Copia configurações
php artisan key:generate     # Gera chave de criptografia
php artisan migrate          # Cria as tabelas no banco
php artisan db:seed          # Popula com dados de exemplo
```

**3. Configure o Frontend**
```bash
cd frontend
npm install                  # Instala dependências Node
```

**4. Inicie os servidores**

Terminal 1 (Backend):
```bash
cd backend
php artisan serve           # http://localhost:8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start                   # http://localhost:4200
```

**5. Acesse a aplicação**

Abra `http://localhost:4200` no navegador.

Login padrão:
- Email: admin@example.com
- Senha: password

---

## 6. Uso do Sistema

### Primeiro Acesso

1. Ao abrir a aplicação, você verá a tela de login
2. Use as credenciais padrão ou clique em "Registrar" para criar sua conta
3. Após login, será redirecionado para a lista de dispositivos

### Cadastrando um Dispositivo

1. Clique em "Novo Dispositivo"
2. Preencha:
   - **Nome**: Ex: "iPhone 14 Pro"
   - **Localização**: Ex: "Escritório São Paulo"
   - **Data de Compra**: Clique no calendário ou digite no formato DD/MM/AAAA
3. Clique em "Salvar"

**Validações automáticas:**
- Nome é obrigatório
- Localização é obrigatória
- Data não pode ser futura (não faz sentido comprar no futuro)

### Filtrando Dispositivos

Na lista, você pode usar vários filtros combinados:

- **Localização**: Digite parte do nome (ex: "São Paulo")
- **Status**: Selecione "Em Uso", "Disponível" ou deixe vazio para todos
- **Período**: Selecione data inicial e final

Os filtros são salvos automaticamente no navegador. Se você sair e voltar, tudo continua como deixou.

### Marcando como Em Uso

Simplesmente clique no botão na linha do dispositivo. O ícone muda automaticamente e uma mensagem confirma.

### Excluindo

Clique no ícone de lixeira e confirme. O dispositivo some da lista, mas permanece no banco para histórico.

---

## 7. API REST - Documentação

A API aceita requisições em JSON e responde em JSON. Todas as rotas de dispositivos precisam de autenticação.

### Autenticação

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "usuario@example.com"
  },
  "token": "1|abc123def456..." 
}
```

Depois disso, use o token em todas as requisições:
```http
Authorization: Bearer 1|abc123def456...
```

### Dispositivos

#### Listar (com paginação)
```http
GET /api/devices?page=1&per_page=10
Authorization: Bearer {token}
```

**Parâmetros de filtro:**
- `in_use=true` - Só em uso
- `location=Escritório` - Por localização
- `purchase_date_from=2023-01-01` - Data inicial
- `purchase_date_to=2023-12-31` - Data final

**Resposta:**
```json
{
  "data": [...],
  "current_page": 1,
  "last_page": 3,
  "total": 25
}
```

#### Criar
```http
POST /api/devices
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Samsung Galaxy S23",
  "location": "Filial Curitiba",
  "purchase_date": "2023-06-15"
}
```

#### Atualizar
```http
PUT /api/devices/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Samsung Galaxy S23 Ultra"
}
```

#### Alternar Status
```http
PATCH /api/devices/{id}/use
Authorization: Bearer {token}
```

#### Excluir
```http
DELETE /api/devices/{id}
Authorization: Bearer {token}
```

### Documentação Interativa

Execute:
```bash
php artisan l5-swagger:generate
```

Acesse: `http://localhost:8000/api/documentation`

Na interface do Swagger, você pode testar todos os endpoints diretamente pelo navegador.

---

## 8. Como o Código Funciona

### Backend: Fluxo de uma Requisição

**1. Rota Definida** (`routes/api.php`)
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('devices', DeviceController::class);
});
```

Isso registra automaticamente:
- GET /api/devices → `index()`
- POST /api/devices → `store()`
- GET /api/devices/{id} → `show()`
- PUT /api/devices/{id} → `update()`
- DELETE /api/devices/{id} → `destroy()`

E aplica o middleware `auth:sanctum` (precisa estar autenticado).

**2. Controller Recebe Requisição** (`DeviceController.php`)
```php
public function index(Request $request): JsonResponse
{
    $userId = Auth::id();  // Pega o ID do usuário autenticado
    
    // Constrói query manualmente
    $query = DB::table('devices')
        ->where('user_id', $userId)      // Só dispositivos deste usuário
        ->whereNull('deleted_at');       // Exceto os deletados
    
    // Aplica filtros se existirem
    if ($request->has('in_use')) {
        $query->where('in_use', $request->boolean('in_use'));
    }
    
    // Pagina e retorna
    $devices = $query->paginate(15);
    return response()->json($devices);
}
```

**Por que usar `Auth::id()`?**
O token Bearer que o frontend envia contém informações do usuário. O Sanctum decodifica automaticamente e disponibiliza via `Auth::`. Assim garantimos que cada usuário só veja seus próprios dados.

**3. Validação** (`StoreDeviceRequest.php`)
```php
public function rules(): array
{
    return [
        'name' => 'required|string|max:255',
        'location' => 'required|string|max:255',
        'purchase_date' => 'required|date|before_or_equal:today'
    ];
}
```

Antes de executar o controller, o Laravel valida automaticamente os dados. Se falhar, retorna erro 422 com detalhes.

**4. Soft Delete**
```php
public function destroy(string $id): JsonResponse
{
    // Não usa DELETE, usa UPDATE
    DB::table('devices')
        ->where('id', $id)
        ->update([
            'deleted_at' => now(),  // Marca como deletado
            'updated_at' => now()
        ]);
    
    return response()->json(['message' => 'Dispositivo excluído com sucesso']);
}
```

Quando buscamos dispositivos, sempre adicionamos `->whereNull('deleted_at')`, então os deletados não aparecem.

### Frontend: Como os Componentes Funcionam

**1. Autenticação** (`auth.ts`)
```typescript
login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.http.post(`${this.API_URL}/auth/login`, credentials)
    .pipe(
      tap(response => {
        // Salva token e usuário
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Atualiza o estado global
        this.currentUserSubject.next(response.user);
      })
    );
}
```

**BehaviorSubject** é um tipo de Observable que guarda o último valor. Quando alguém se inscreve, recebe o valor atual imediatamente. Usado para compartilhar o usuário logado entre todos os componentes.

**2. Proteção de Rotas** (`auth-guard.ts`)
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;  // Pode acessar
  }
  
  router.navigate(['/login']);  // Redireciona
  return false;
};
```

Antes de mostrar qualquer rota protegida, o Angular chama o guard. Se não estiver autenticado, redireciona.

**3. Interceptor** (`auth.interceptor.ts`)
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }
  
  return next(req);
};
```

Intercepta TODAS as requisições HTTP e adiciona o token automaticamente. Assim não precisamos adicionar manualmente em cada chamada.

**4. Lista de Dispositivos** (`device-list.ts`)

Quando o componente inicia:
```typescript
ngOnInit(): void {
  this.currentUser = this.authService.getCurrentUser();
  this.loadFiltersFromStorage();  // Restaura filtros
  this.loadDevices();              // Carrega dados
  this.setupFilters();             // Configura listeners
}
```

Ao mudar os filtros:
```typescript
this.locationFilter.valueChanges
  .pipe(
    debounceTime(500),          // Espera 500ms
    distinctUntilChanged()      // Só executa se mudar
  )
  .subscribe(() => this.applyFilters());
```

**Debounce** evita fazer requisição a cada tecla digitada. Aguarda 500ms de "sossego" antes de executar.

**5. Persistência de Filtros**
```typescript
private saveFiltersToStorage(): void {
  const filters = {
    name: this.nameFilter.value,
    location: this.locationFilter.value,
    // ...
  };
  localStorage.setItem('deviceFilters', JSON.stringify(filters));
}
```

**localStorage** persiste dados no navegador. Mesmo fechando o navegador, os filtros ficam salvos.

### Reactive Forms: Por que são Melhores

Em vez de manipular o DOM manualmente, o Angular usa Reactive Forms:

```typescript
this.deviceForm = this.fb.group({
  name: ['', [Validators.required]],
  location: ['', [Validators.required]],
  purchase_date: ['', [Validators.required]]
});
```

**Vantagens:**
- Validação automática
- Estado reativo (se mudar o form, componentes atualizam)
- Testável (não depende de DOM)
- Type-safe (TypeScript ajuda)

---

## 9. Testes

### Backend (PHPUnit)

**Exemplo de teste:**
```php
public function test_can_create_device(): void
{
    $deviceData = [
        'name' => 'iPhone 14 Pro',
        'location' => 'Escritório Central',
        'purchase_date' => '2023-01-15'
    ];
    
    $response = $this->postJson('/api/devices', $deviceData);
    
    $response->assertStatus(201);
    $this->assertDatabaseHas('devices', [
        'name' => 'iPhone 14 Pro',
        'user_id' => $this->user->id
    ]);
}
```

**O que testamos:**
- ✅ Resposta 201 (sucesso)
- ✅ Dados salvos no banco
- ✅ user_id correto (isolamento)

**Cobertura:**
- 19 testes implementados
- Cobre CRUD completo
- Testa filtros
- Testa validações
- Testa isolamento por usuário

Execute: `php artisan test`

### Frontend (Jasmine/Karma)

**Exemplo:**
```typescript
it('should get devices with pagination', () => {
  const mockResponse = { data: [...], total: 10 };
  
  service.getDevices().subscribe(response => {
    expect(response).toEqual(mockResponse);
  });
  
  const req = httpMock.expectOne('http://localhost:8000/api/devices');
  expect(req.request.method).toBe('GET');
  req.flush(mockResponse);
});
```

Usamos **HttpTestingController** para simular requisições sem chamar API real.

Execute: `npm test`

---

## 10. Estrutura de Dados

### Tabelas

**users**
Armazena os usuários do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | BIGINT | ID único |
| name | VARCHAR(255) | Nome completo |
| email | VARCHAR(255) | Email (único) |
| password | VARCHAR(255) | Senha (hash bcrypt) |

**devices**
Armazena os dispositivos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | BIGINT | ID único |
| name | VARCHAR(255) | Nome do aparelho |
| location | VARCHAR(255) | Onde está |
| purchase_date | DATE | Quando foi comprado |
| in_use | BOOLEAN | Em uso? (true/false) |
| user_id | BIGINT | Dono do dispositivo |
| deleted_at | TIMESTAMP | Quando foi deletado (NULL = ativo) |

**Relacionamento:**
- Um usuário (`user`) pode ter muitos dispositivos (`devices`)
- Cada dispositivo pertence a um único usuário

**personal_access_tokens**
Tokens de autenticação do Sanctum.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | BIGINT | ID único |
| tokenable_id | BIGINT | ID do usuário |
| token | VARCHAR(64) | Hash do token |
| name | VARCHAR(255) | Nome (ex: "auth-token") |

### Consultas SQL Exemplos

**Buscar dispositivos de um usuário:**
```sql
SELECT * FROM devices 
WHERE user_id = 1 
  AND deleted_at IS NULL;
```

**Filtrar por localização:**
```sql
SELECT * FROM devices 
WHERE user_id = 1 
  AND location LIKE '%São Paulo%'
  AND deleted_at IS NULL;
```

---

### Possíveis Melhorias Futuras

- Adicionar imagens dos dispositivos
- Exportar lista para Excel
- Notificações de dispositivos disponíveis
- App mobile (React Native ou Flutter)
- Dashboard com gráficos (devices por localização, etc)
- Sistema de notificações
- API de relatórios

*Sistema desenvolvido para facilitar o gerenciamento de dispositivos corporativos.*
