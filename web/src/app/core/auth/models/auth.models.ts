export interface RespostaAutenticacao {
  tokenAcesso: string;
  tokenAtualizacao: string;
  expiracao: string;
  usuarioId: string;
  nomeCompleto: string;
  email: string;
}

export interface RegistrarRequest {
  nomeCompleto: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
}

export interface EntrarRequest {
  email: string;
  senha: string;
}
