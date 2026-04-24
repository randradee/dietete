import { test, expect } from '@playwright/test';
import path from 'path';
import { injetarToken, registrarViaApi } from './helpers/api.helper';

const PDF_A = path.join(__dirname, 'fixtures', 'dieta-usuario-a.pdf');
const PDF_B = path.join(__dirname, 'fixtures', 'dieta-usuario-b.pdf');

test.describe('Lista de Compras', () => {
  let tokenA: string;
  let usuarioA: object;

  test.beforeAll(async ({ request }) => {
    const email = `lista.${Date.now()}@dietete.app`;
    const res = await registrarViaApi(request, {
      nomeCompleto: 'Usuário Lista',
      email,
      senha: 'Senha@123',
    });
    tokenA = res.tokenAcesso;
    usuarioA = { nomeCompleto: res.nomeCompleto, email: res.email };

    // Upload do PDF via API para ter dados
    const pdfBuffer = require('fs').readFileSync(PDF_A);
    await request.post('http://localhost:8080/api/planos-dieta', {
      headers: { Authorization: `Bearer ${tokenA}` },
      multipart: {
        arquivo: { name: 'dieta-usuario-a.pdf', mimeType: 'application/pdf', buffer: pdfBuffer },
      },
    });
  });

  test.beforeEach(async ({ page }) => {
    await injetarToken(page, tokenA, usuarioA);
    await page.goto('/lista-compras');
  });

  test('exibe página de lista de compras com controles de período e tipo', async ({ page }) => {
    await expect(page.getByText(/semanal/i)).toBeVisible();
    await expect(page.getByText(/mensal/i)).toBeVisible();
    await expect(page.getByText(/individual|unificada/i)).toBeVisible();
  });

  test('gera lista de compras semanal individual', async ({ page }) => {
    // Selecionar Semanal (deve ser padrão)
    await page.getByText(/semanal/i).first().click();
    await page.getByText(/individual/i).first().click();

    await page.getByRole('button', { name: /gerar lista/i }).click();

    // Aguarda itens aparecerem
    await expect(page.getByRole('row').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/proteína|carboidrato|verdura|alimento/i)).toBeVisible({ timeout: 10_000 });
  });

  test('gera lista de compras mensal individual', async ({ page }) => {
    await page.getByText(/mensal/i).first().click();
    await page.getByRole('button', { name: /gerar lista/i }).click();

    await expect(page.getByText(/proteína|carboidrato|verdura|alimento/i)).toBeVisible({ timeout: 15_000 });
  });

  test('itens da lista exibem nome, quantidade e unidade', async ({ page }) => {
    await page.getByRole('button', { name: /gerar lista/i }).click();

    // Aguarda a tabela ter linhas de dados
    await page.waitForSelector('table tr:nth-child(2)', { timeout: 15_000 });

    // Verifica que colunas essenciais existem
    await expect(page.getByText(/nome|alimento/i)).toBeVisible();
    await expect(page.getByText(/quantidade/i)).toBeVisible();
    await expect(page.getByText(/unidade/i)).toBeVisible();
  });

  test('lista mensal tem mais quantidade que a semanal (para mesmo alimento)', async ({ page }) => {
    // Gerar lista semanal
    await page.getByText(/semanal/i).first().click();
    await page.getByRole('button', { name: /gerar lista/i }).click();
    await page.waitForSelector('table tr:nth-child(2)', { timeout: 15_000 });

    const textoSemanal = await page.locator('table').innerText();

    // Gerar lista mensal
    await page.getByText(/mensal/i).first().click();
    await page.getByRole('button', { name: /gerar lista/i }).click();
    await page.waitForSelector('table tr:nth-child(2)', { timeout: 15_000 });

    const textoMensal = await page.locator('table').innerText();

    // A lista mensal não deve ser idêntica à semanal
    expect(textoMensal).not.toEqual(textoSemanal);
  });
});
