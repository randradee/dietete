namespace DieTete.Application.Auth.Dtos;

public record RespostaAutenticacao(
    string TokenAcesso,
    string TokenAtualizacao,
    DateTime Expiracao,
    Guid UsuarioId,
    string NomeCompleto,
    string Email);
