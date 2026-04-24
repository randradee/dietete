# Testes E2E — DieTete

## Pré-requisitos

1. **Backend rodando**: `cd ../dietete-api && docker-compose up -d`
2. **Frontend** é iniciado automaticamente pelo Playwright via `webServer` no config

## Como rodar

```bash
# Todos os cenários (headless)
npm run e2e

# Com UI interativa do Playwright
npm run e2e:ui

# Apenas autenticação
npx playwright test 01-auth

# Apenas upload de dieta (requer backend)
npx playwright test 02-upload-dieta

# Ver último relatório
npm run e2e:report
```

## Estrutura

| Arquivo | Cenários |
|---|---|
| `01-auth.spec.ts` | Login, registro, logout, validações |
| `02-upload-dieta.spec.ts` | Upload dos PDFs reais do Usuário A e Usuário B |
| `03-revisao-dieta.spec.ts` | Revisão de itens parseados, itens com baixa confiança |
| `04-lista-compras.spec.ts` | Geração semanal/mensal, colunas, diferença de quantidades |
| `05-lista-unificada-casal.spec.ts` | Lista unificada vs individual para o casal |

## Fixtures

Os PDFs reais ficam em `e2e/fixtures/`:
- `dieta-usuario-a.pdf` — Plano alimentar do Usuário A
- `dieta-usuario-b.pdf` — Plano alimentar da Usuário B

## Notas

- Os testes que dependem do backend usam `test.skip()` graciosamente quando o backend não está disponível
- Cada suite cria seus próprios usuários de teste com timestamp para evitar conflitos
- O relatório HTML é gerado em `playwright-report/`
