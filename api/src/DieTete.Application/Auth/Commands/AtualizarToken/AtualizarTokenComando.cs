using DieTete.Application.Auth.Dtos;
using ErrorOr;

namespace DieTete.Application.Auth.Commands.AtualizarToken;

public record AtualizarTokenComando(string TokenAcesso, string TokenAtualizacao);
