using DieTete.Application.Auth.Dtos;
using ErrorOr;

namespace DieTete.Application.Auth.Commands.Registrar;

public record RegistrarComando(
    string NomeCompleto,
    string Email,
    string Senha,
    string ConfirmacaoSenha);
