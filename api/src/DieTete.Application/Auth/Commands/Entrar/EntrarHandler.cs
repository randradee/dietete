using DieTete.Application.Auth.Dtos;
using DieTete.Application.Cqrs;
using DieTete.Domain.Errors;
using DieTete.Domain.Interfaces.Services;
using ErrorOr;

namespace DieTete.Application.Auth.Commands.Entrar;

public class EntrarHandler(
    IServicoAutenticacao servicoAuth,
    IServicoToken servicoToken) : IManipuladorComando<EntrarComando, RespostaAutenticacao>
{
    public async Task<ErrorOr<RespostaAutenticacao>> ExecutarAsync(EntrarComando comando, CancellationToken ct = default)
    {
        var resultado = await servicoAuth.EntrarAsync(comando.Email, comando.Senha, ct);

        if (!resultado.Sucesso)
            return ErrosAuth.CredenciaisInvalidas;

        var tokenAcesso = servicoToken.GerarTokenAcesso(resultado.UsuarioId!.Value, resultado.Email!, resultado.NomeCompleto!, resultado.Papeis!);
        var tokenAtualizacao = servicoToken.GerarTokenAtualizacao();
        var expiracao = DateTime.UtcNow.AddMinutes(15);

        await servicoAuth.AtualizarTokenAtualizacaoAsync(resultado.UsuarioId!.Value, tokenAtualizacao, DateTime.UtcNow.AddDays(30), ct);

        return new RespostaAutenticacao(tokenAcesso, tokenAtualizacao, expiracao, resultado.UsuarioId!.Value, resultado.NomeCompleto!, resultado.Email!);
    }
}
