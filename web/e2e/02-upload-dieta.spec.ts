import { test, expect } from '@playwright/test';
import path from 'path';
import { USUARIOS, registrar } from './helpers/auth.helper';
import { entrarViaApi, injetarToken, registrarViaApi } from './helpers/api.helper';

const PDF_A = path.join(__dirname, 'fixtures', 'dieta-usuario-a.pdf');
const PDF_B = path.join(__dirname, 'fixtures', 'dieta-usuario-b.pdf');

test.describe('Upload de Dieta', () => {
  let tokenA: string;
  let usuarioA: object;
  const emailA = `upload.a.${Date.now()}@dietete.app`;

  test.beforeAll(async ({ request }) => {
    const res = await registrarViaApi(request, {
      nomeCompleto: 'Usuário A',
      email: emailA,
      senha: 'Senha@123',
    });
    tokenA = res.tokenAcesso;
    usuarioA = { nomeCompleto: res.nomeCompleto, email: res.email, usuarioId: res.usuarioId };
  });

  test.beforeEach(async ({ page }) => {
    await injetarToken(page, tokenA, usuarioA);
    await page.goto('/dieta/enviar');
  });

  test('exibe tela de upload com área de seleção de arquivo', async ({ page }) => {
    await expect(page.getByText(/enviar dieta|upload|selecionar pdf/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /selecionar pdf|escolher arquivo/i })).toBeVisible();
  });

  test('faz upload do PDF de dieta do Usuário A', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(PDF_A);

    await expect(page.getByText(/dieta-usuario-a\.pdf|usuario-a/i)).toBeVisible({ timeout: 5_000 });

    const btnEnviar = page.getByRole('button', { name: /enviar|processar/i });
    await expect(btnEnviar).toBeEnabled();
    await btnEnviar.click();

    // Aguarda redirecionamento para revisão (processamento pode demorar)
    await expect(page).toHaveURL(/dieta\/revisar\//, { timeout: 30_000 });
  });

  test('faz upload do PDF de dieta da Usuário B', async ({ page, request }) => {
    // Cria conta da Usuário B
    const emailB = `upload.b.${Date.now()}@dietete.app`;
    const resB = await registrarViaApi(request, {
      nomeCompleto: 'Usuário B',
      email: emailB,
      senha: 'Senha@123',
    });
    await injetarToken(page, resB.tokenAcesso, { nomeCompleto: resB.nomeCompleto, email: resB.email });
    await page.goto('/dieta/enviar');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(PDF_B);

    await expect(page.getByText(/dieta-usuario-b\.pdf|usuario-b/i)).toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', { name: /enviar|processar/i }).click();
    await expect(page).toHaveURL(/dieta\/revisar\//, { timeout: 30_000 });
  });

  test('rejeita arquivo que não é PDF', async ({ page }) => {
    const arquivo = {
      name: 'nao-e-pdf.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('conteúdo qualquer'),
    };
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(arquivo);

    await expect(page.getByText(/pdf|formato inválido|aceito/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('button', { name: /enviar|processar/i })).toBeDisabled();
  });
});
