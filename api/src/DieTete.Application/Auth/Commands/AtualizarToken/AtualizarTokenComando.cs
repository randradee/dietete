using DieTete.Application.Auth.Dtos;
using ErrorOr;
using MediatR;

namespace DieTete.Application.Auth.Commands.AtualizarToken;

public record AtualizarTokenComando(string TokenAcesso, string TokenAtualizacao) : IRequest<ErrorOr<RespostaAutenticacao>>;
