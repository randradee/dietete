using DieTete.Application.Auth.Dtos;
using ErrorOr;
using MediatR;

namespace DieTete.Application.Auth.Commands.Entrar;

public record EntrarComando(string Email, string Senha) : IRequest<ErrorOr<RespostaAutenticacao>>;
