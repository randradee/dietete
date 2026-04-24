# DieTete

Aplicação nutricional para gerenciamento de dietas e listas de compras.

## O que é

DieTete é um app para dois usuários (casal) que:

1. Faz upload do PDF de dieta emitido pelo nutricionista
2. Extrai os alimentos automaticamente via parsing de texto (sem IA)
3. Gera lista de compras semanal ou mensal — individual ou unificada para o casal
4. Consulta preços estimados via scraping do Preço da Hora BA (feature flag)

## Estrutura do repositório

```
dietete/
├── api/          → backend .NET 10
└── web/          → frontend Angular 20
```

---

## Backend (`api/`)

### Stack

| Tecnologia | Versão | Finalidade |
|-----------|--------|-----------|
| .NET | 10 | Runtime |
| ASP.NET Core | 10 | Web framework |
| Entity Framework Core | 10 | ORM |
| PostgreSQL (Npgsql) | 16 | Banco de dados |
| ASP.NET Core Identity | — | Autenticação de usuários |
| MediatR | 14.x | CQRS — mediador de commands/queries |
| FluentValidation | 12.x | Validação de entrada |
| ErrorOr | 2.x | Result pattern (sem exceções para erros de negócio) |
| PdfPig | 1.7.0-pre | Extração de texto de PDFs |
| HtmlAgilityPack | — | Web scraping de preços |
| Swashbuckle | 6.9.0 | Swagger / OpenAPI |

### Arquitetura

Clean Architecture em quatro camadas:

```
DieTete.Domain          → entidades, enums, interfaces (zero dependências externas)
DieTete.Application     → CQRS handlers, DTOs, behaviors (depende só de Domain)
DieTete.Infrastructure  → EF Core, Identity, serviços concretos (depende de Application)
DieTete.Api             → controllers, middleware, Program.cs (depende de Infrastructure)
```

**Regra crítica:** a camada Application não conhece nenhum tipo de Infrastructure.
A ponte é feita via interfaces no Domain (`IServicoAutenticacao`, `IParsadorPlanoDieta`, etc.).

### Entidades principais (em português)

- `Usuario` — entidade de domínio pura (sem IdentityUser)
- `GrupoFamiliar` — agrupa o casal
- `PlanoDieta` — plano alimentar parseado de um PDF
- `DiaDieta` → `Refeicao` → `ItemAlimento` — hierarquia de dias, refeições e alimentos
- `ListaCompras` → `ItemListaCompras` — lista gerada com itens agregados
- `PrecoItem` — cache de preços consultados (TTL 7 dias)

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/registrar` | Criar conta |
| POST | `/api/auth/entrar` | Login → JWT + refresh token |
| POST | `/api/auth/atualizar-token` | Renovar access token |
| POST | `/api/planos-dieta` | Upload de PDF (multipart) |
| GET  | `/api/planos-dieta/{id}` | Consultar plano parseado |
| POST | `/api/listas-compras/gerar` | Gerar lista de compras |
| GET  | `/api/listas-compras` | Listar (`?periodo=Semanal&tipo=Individual`) |
| PATCH | `/api/listas-compras/{listId}/itens/{itemId}` | Editar item manualmente |

Swagger disponível em `http://localhost:8080/swagger` (ambiente Development).

### Parsing do PDF

`ParsadorPlanoDieta` (Infrastructure) implementa `IParsadorPlanoDieta` (Domain):

1. Extrai texto por página via PdfPig
2. Detecta seções de refeição por regex em português (café da manhã, almoço, lanche, jantar, ceia, etc.)
3. Extrai alimentos com padrão `quantidade unidade nome`
4. Normaliza unidades (colher de sopa, xícara, cs → `UnidadeMedida` enum)
5. Atribui score de confiança: 1.0 (qty+unit+nome), 0.7 (qty+nome), 0.3 (só nome)
6. Itens com score < 0.5 ficam com `NecessitaRevisao = true` para revisão no frontend

### JWT

- Access token: 15 minutos (HMAC-SHA256)
- Refresh token: 30 dias, armazenado no banco (server-side)

### Consulta de preços (feature flag)

```json
"ConsultaPrecos": { "Habilitado": false }
```

Quando habilitado, `ScraperPrecosDaHora` faz GET em precodahora.ba.gov.br, extrai preços via regex `R\$\s*(\d+[.,]\d{2})` e retorna a mediana. Falhas são silenciosas — o item aparece sem preço.

### Rodar localmente

**Pré-requisitos:** Docker, .NET 10 SDK

```bash
cd api
docker-compose up -d          # sobe PostgreSQL na porta 5432
dotnet run --project src/DieTete.Api
# API disponível em http://localhost:8080
```

A migration é aplicada automaticamente no startup em ambiente Development.

**Sem Docker** — crie o banco manualmente:

```bash
psql -U postgres -f database-init.sql
```

---

## Frontend (`web/`)

### Stack

| Tecnologia | Versão | Finalidade |
|-----------|--------|-----------|
| Angular | 20 | Framework |
| PrimeNG | 20.5.0-lts | Biblioteca de componentes UI |
| @primeng/themes | 20.5.0-lts | Tema Aura |
| RxJS | 7.8 | HTTP e operadores reativos |
| Playwright | latest | Testes E2E |
| Jest + jest-preset-angular | — | Testes unitários |

### Decisões técnicas

- **Standalone components** — sem NgModules
- **OnPush** change detection em todos os componentes
- **Signals** para estado de autenticação (`usuarioAtual`, `estaLogado`, `nomeUsuario`)
- **Lazy loading** via `loadComponent()` em todas as rotas de feature
- Auth interceptor com lock via `BehaviorSubject` para evitar múltiplos refreshes simultâneos
- Token armazenado em `localStorage` com chaves prefixadas `dietete_`

### Estrutura

```
web/src/app/
├── core/
│   ├── auth/
│   │   ├── services/auth.service.ts        ← signals + localStorage
│   │   ├── models/auth.models.ts
│   │   └── interceptors/auth.interceptor.ts ← Bearer token + refresh lock
│   └── guards/auth.guard.ts
├── shared/
│   ├── components/header/, loading-spinner/
│   └── models/api-response.model.ts
└── features/
    ├── auth/login/, register/
    ├── diet/upload/, review/
    └── shopping-list/list/
```

### Rodar localmente

```bash
cd web
npm install
ng serve
# http://localhost:4200
```

---

## Testes E2E

Os specs cobrem o fluxo completo ponta a ponta com PDFs reais das dietas:

| Arquivo | Cenários |
|---------|---------|
| `01-auth.spec.ts` | Registro, login, sessão persistente, logout |
| `02-upload-dieta.spec.ts` | Upload de PDF, feedback de progresso, itens extraídos |
| `03-revisao-dieta.spec.ts` | Itens com baixa confiança, edição e aprovação |
| `04-lista-compras.spec.ts` | Lista semanal/mensal individual, colunas, quantidades |
| `05-lista-unificada-casal.spec.ts` | Lista unificada do casal, toggle individual/unificada |

**Executar:**

```bash
cd web
npx playwright test                # todos os specs
npx playwright test 01-auth        # spec específico
npx playwright show-report         # abrir relatório HTML
```

Os PDFs de dieta real estão em `web/e2e/fixtures/` e também em `web/examples/`.

---

## Variáveis de ambiente relevantes (`api/appsettings.json`)

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=dietete;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Chave": "TROQUE_ESTA_CHAVE_EM_PRODUCAO_MIN_32_CHARS",
    "Emissor": "DieTete",
    "Audiencia": "DieTeteApp",
    "ExpiracaoMinutos": 15,
    "ExpiracaoRefreshDias": 30
  },
  "Armazenamento": {
    "CaminhoPdfs": "uploads/planos-dieta"
  },
  "ConsultaPrecos": {
    "Habilitado": false
  }
}
```

**Importante:** troque `Jwt:Chave` por um segredo de produção antes de qualquer deploy.
