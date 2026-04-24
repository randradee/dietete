import { test, expect } from '@playwright/test';
import { USUARIOS, registrar, entrar, limparStorage } from './helpers/auth.helper';

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await limparStorage(page);
  });

  test('redireciona para login quando não autenticado', async ({ page }) => {
    await page.goto('/lista-compras');
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('exibe formulário de login', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /registrar/i })).toBeVisible();
  });

  test('exibe erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/e-mail/i).fill('nao-existe@dietete.app');
    await page.getByLabel(/senha/i).fill('SenhaErrada123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByText(/inválid|credencial|incorret/i)).toBeVisible({ timeout: 5_000 });
  });

  test('registra novo usuário e redireciona para lista de compras', async ({ page }) => {
    const usuario = {
      ...USUARIOS.a,
      email: `upload.a.${Date.now()}@dietete.app`,
    };
    await registrar(page, usuario);
    await expect(page).toHaveURL(/lista-compras/, { timeout: 10_000 });
    await expect(page.getByText(new RegExp(usuario.nomeCompleto, 'i'))).toBeVisible();
  });

  test('valida que senhas precisam coincidir no registro', async ({ page }) => {
    await page.goto('/auth/registrar');
    await page.getByLabel(/nome completo/i).fill('Teste');
    await page.getByLabel(/e-mail/i).fill('teste@dietete.app');
    await page.getByLabel(/^senha$/i).fill('Senha@123');
    await page.getByLabel(/confirmar/i).fill('SenhaDiferente');
    await page.getByRole('button', { name: /registrar/i }).click();
    await expect(page.getByText(/coincid|iguais|não coincidem/i)).toBeVisible();
  });

  test('faz logout e redireciona para login', async ({ page, request }) => {
    // Registra e entra
    const usuario = { ...USUARIOS.a, email: `logout.${Date.now()}@dietete.app` };
    await registrar(page, usuario);
    await expect(page).toHaveURL(/lista-compras/, { timeout: 10_000 });

    // Clica em sair
    await page.getByRole('button', { name: /sair/i }).click();
    await expect(page).toHaveURL(/auth\/login/);

    // Confirma que storage foi limpo
    const token = await page.evaluate(() => localStorage.getItem('dietete_token'));
    expect(token).toBeNull();
  });
});
