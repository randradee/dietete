using DieTete.Application.Auth.Dtos;
using ErrorOr;

namespace DieTete.Application.Auth.Commands.Entrar;

public record EntrarComando(string Email, string Senha);
