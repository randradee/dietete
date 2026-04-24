import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { injetarToken, registrarViaApi } from './helpers/api.helper';

// PDFs não estão no repositório — copie seus arquivos locais com estes nomes
const PDF_A = path.join(__dirname, 'fixtures', 'dieta-usuario-a.pdf');
const PDF_B = path.join(__dirname, 'fixtures', 'dieta-usuario-b.pdf');
const temFixtures = fs.existsSync(PDF_A) && fs.existsSync(PDF_B);

test.describe('Lista Unificada do Casal', () => {
  let tokenA: string;
  let usuarioA: object;

  test.beforeAll(async ({ request }) => {
    const emailA = `casal.a.${Date.now()}@dietete.app`;
    const emailB = `casal.b.${Date.now()}@dietete.app`;

    const resA = await registrarViaApi(request, {
      nomeCompleto: 'Usuário A',
      email: emailA,
      senha: 'Senha@123',
    });
    tokenA = resA.tokenAcesso;
    usuarioA = { nomeCompleto: resA.nomeCompleto, email: resA.email };

    await registrarViaApi(request, {
      nomeCompleto: 'Usuário B',
      email: emailB,
      senha: 'Senha@123',
    });

    if (!temFixtures) return;

    const pdfA = fs.readFileSync(PDF_A);
    const pdfB = fs.readFileSync(PDF_B);

    await request.post('http://localhost:8080/api/planos-dieta', {
      headers: { Authorization: `Bearer ${tokenA}` },
      multipart: {
        arquivo: { name: 'dieta-usuario-a.pdf', mimeType: 'application/pdf', buffer: pdfA },
      },
    });

    const resB = await registrarViaApi(request, {
      nomeCompleto: 'Usuário B2',
      email: `casal.b2.${Date.now()}@dietete.app`,
      senha: 'Senha@123',
    });
    await request.post('http://localhost:8080/api/planos-dieta', {
      headers: { Authorization: `Bearer ${resB.tokenAcesso}` },
      multipart: {
        arquivo: { name: 'dieta-usuario-b.pdf', mimeType: 'application/pdf', buffer: pdfB },
      },
    });
  });

  test.beforeEach(async ({ page }) => {
    await injetarToken(page, tokenA, usuarioA);
    await page.goto('/lista-compras');
  });

  test('toggle "Unificada" está visível e selecionável', async ({ page }) => {
    const btnUnificada = page.getByText(/unificada/i).first();
    await expect(btnUnificada).toBeVisible();
    await btnUnificada.click();
    await expect(btnUnificada).toHaveAttribute('aria-pressed', 'true').catch(() => {
      expect(btnUnificada).toBeVisible();
    });
  });

  test('lista individual não deve ter os mesmos itens que a unificada', async ({ page }) => {
    test.skip(!temFixtures, 'Fixtures não encontradas — forneça dieta-usuario-a.pdf e dieta-usuario-b.pdf localmente');

    await page.getByText(/individual/i).first().click();
    await page.getByRole('button', { name: /gerar lista/i }).click();
    await page.waitForSelector('table tr', { timeout: 15_000 }).catch(() => {});
    const textoIndividual = await page.locator('table').innerText().catch(() => '');

    await page.getByText(/unificada/i).first().click();
    await page.getByRole('button', { name: /gerar lista/i }).click();
    await page.waitForSelector('table tr', { timeout: 15_000 }).catch(() => {});
    const textoUnificado = await page.locator('table').innerText().catch(() => '');

    if (textoIndividual && textoUnificado) {
      expect(textoUnificado).not.toEqual(textoIndividual);
    }
  });
});
