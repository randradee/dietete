using DieTete.Application.Auth.Dtos;
using DieTete.Domain.Errors;
using DieTete.Domain.Interfaces.Services;
using ErrorOr;
using MediatR;

namespace DieTete.Application.Auth.Commands.Registrar;

public class RegistrarHandler(
    IServicoAutenticacao servicoAuth,
    IServicoToken servicoToken) : IRequestHandler<RegistrarComando, ErrorOr<RespostaAutenticacao>>
{
    public async Task<ErrorOr<RespostaAutenticacao>> Handle(RegistrarComando request, CancellationToken ct)
    {
        var resultado = await servicoAuth.RegistrarAsync(request.NomeCompleto, request.Email, request.Senha, ct);

        if (!resultado.Sucesso)
            return resultado.ErroDescricao!.Contains("cadastrado")
                ? ErrosAuth.EmailJaCadastrado
                : Error.Validation("Auth.Registro", resultado.ErroDescricao!);

        var tokenAcesso = servicoToken.GerarTokenAcesso(resultado.UsuarioId!.Value, resultado.Email!, resultado.NomeCompleto!, resultado.Papeis!);
        var tokenAtualizacao = servicoToken.GerarTokenAtualizacao();
        var expiracao = DateTime.UtcNow.AddMinutes(15);

        await servicoAuth.AtualizarTokenAtualizacaoAsync(resultado.UsuarioId!.Value, tokenAtualizacao, DateTime.UtcNow.AddDays(30), ct);

        return new RespostaAutenticacao(tokenAcesso, tokenAtualizacao, expiracao, resultado.UsuarioId!.Value, resultado.NomeCompleto!, resultado.Email!);
    }
}
