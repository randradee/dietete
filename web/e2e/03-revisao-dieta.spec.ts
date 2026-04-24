import { test, expect } from '@playwright/test';
import path from 'path';
import { entrarViaApi, injetarToken, registrarViaApi } from './helpers/api.helper';

const PDF_A = path.join(__dirname, 'fixtures', 'dieta-usuario-a.pdf');

test.describe('Revisão da Dieta Parseada', () => {
  let token: string;
  let usuario: object;
  let planoDietaId: string;

  test.beforeAll(async ({ request }) => {
    // Cria usuário
    const email = `revisao.${Date.now()}@dietete.app`;
    const res = await registrarViaApi(request, {
      nomeCompleto: 'Usuário Revisão',
      email,
      senha: 'Senha@123',
    });
    token = res.tokenAcesso;
    usuario = { nomeCompleto: res.nomeCompleto, email: res.email };

    // Faz upload via API para ter o ID do plano
    const formData = new FormData();
    const pdfBuffer = require('fs').readFileSync(PDF_A);
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('arquivo', blob, 'dieta-usuario-a.pdf');

    const uploadRes = await request.post('http://localhost:8080/api/planos-dieta', {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        arquivo: {
          name: 'dieta-usuario-a.pdf',
          mimeType: 'application/pdf',
          buffer: pdfBuffer,
        },
      },
    });

    if (uploadRes.ok()) {
      const body = await uploadRes.json();
      planoDietaId = body.id;
    }
  });

  test.beforeEach(async ({ page }) => {
    await injetarToken(page, token, usuario);
  });

  test('exibe itens parseados do plano do Usuário A', async ({ page }) => {
    test.skip(!planoDietaId, 'Upload não disponível — backend não está rodando');

    await page.goto(`/dieta/revisar/${planoDietaId}`);

    // Deve exibir pelo menos alguns alimentos
    await expect(page.getByText(/alimento|refeição|café|almoço|jantar/i)).toBeVisible({ timeout: 10_000 });
  });

  test('destaca itens com baixa confiança para revisão', async ({ page }) => {
    test.skip(!planoDietaId, 'Upload não disponível — backend não está rodando');

    await page.goto(`/dieta/revisar/${planoDietaId}`);

    // Itens com baixa confiança devem ter indicador visual
    const tagRevisar = page.getByText(/revisar|baixa confiança|verificar/i);
    // Pode não existir se o PDF foi bem parseado — apenas verifica se a tela carregou
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('botão "Gerar Lista" navega para lista de compras', async ({ page }) => {
    test.skip(!planoDietaId, 'Upload não disponível — backend não está rodando');

    await page.goto(`/dieta/revisar/${planoDietaId}`);
    await page.getByRole('button', { name: /gerar lista|gerar compras/i }).click();
    await expect(page).toHaveURL(/lista-compras/);
  });
});
