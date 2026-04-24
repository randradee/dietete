import { APIRequestContext } from '@playwright/test';

const API_URL = 'http://localhost:8080/api';

export async function registrarViaApi(
  request: APIRequestContext,
  dados: { nomeCompleto: string; email: string; senha: string }
) {
  const res = await request.post(`${API_URL}/auth/registrar`, {
    data: { ...dados, confirmacaoSenha: dados.senha },
  });
  return res.json();
}

export async function entrarViaApi(
  request: APIRequestContext,
  email: string,
  senha: string
): Promise<string> {
  const res = await request.post(`${API_URL}/auth/entrar`, {
    data: { email, senha },
  });
  const body = await res.json();
  return body.tokenAcesso as string;
}

export async function injetarToken(page: import('@playwright/test').Page, token: string, usuario: object) {
  await page.goto('/');
  await page.evaluate(
    ([t, u]) => {
      localStorage.setItem('dietete_token', t as string);
      localStorage.setItem('dietete_usuario', JSON.stringify(u));
    },
    [token, usuario]
  );
}
