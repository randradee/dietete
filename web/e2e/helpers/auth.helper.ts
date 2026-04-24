import { Page } from '@playwright/test';

export const USUARIOS = {
  a: {
    nomeCompleto: 'Usuário A',
    email: 'usuario.a.teste@dietete.app',
    senha: 'Senha@123',
  },
  b: {
    nomeCompleto: 'Usuário B',
    email: 'usuario.b.teste@dietete.app',
    senha: 'Senha@123',
  },
};

export async function registrar(page: Page, usuario: typeof USUARIOS.a) {
  await page.goto('/auth/registrar');
  await page.getByLabel(/nome completo/i).fill(usuario.nomeCompleto);
  await page.getByLabel(/e-mail/i).fill(usuario.email);
  await page.getByLabel(/^senha$/i).fill(usuario.senha);
  await page.getByLabel(/confirmar/i).fill(usuario.senha);
  await page.getByRole('button', { name: /registrar/i }).click();
}

export async function entrar(page: Page, usuario: typeof USUARIOS.a) {
  await page.goto('/auth/login');
  await page.getByLabel(/e-mail/i).fill(usuario.email);
  await page.getByLabel(/senha/i).fill(usuario.senha);
  await page.getByRole('button', { name: /entrar/i }).click();
}

export async function limparStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('dietete_token');
    localStorage.removeItem('dietete_refresh_token');
    localStorage.removeItem('dietete_usuario');
  });
}
