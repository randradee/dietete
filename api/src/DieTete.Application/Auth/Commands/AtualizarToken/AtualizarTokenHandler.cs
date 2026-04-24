using DieTete.Application.Auth.Dtos;
using DieTete.Application.Cqrs;
using DieTete.Domain.Errors;
using DieTete.Domain.Interfaces.Services;
using ErrorOr;

namespace DieTete.Application.Auth.Commands.AtualizarToken;

public class AtualizarTokenHandler(
    IServicoAutenticacao servicoAuth,
    IServicoToken servicoToken) : IManipuladorComando<AtualizarTokenComando, RespostaAutenticacao>
{
    public async Task<ErrorOr<RespostaAutenticacao>> ExecutarAsync(AtualizarTokenComando comando, CancellationToken ct = default)
    {
        var usuarioIdStr = ExtrairSubDoToken(comando.TokenAcesso);
        if (!Guid.TryParse(usuarioIdStr, out var usuarioId))
            return ErrosAuth.TokenInvalido;

        var valido = await servicoAuth.ValidarTokenAtualizacaoAsync(usuarioId, comando.TokenAtualizacao, ct);
        if (!valido)
            return ErrosAuth.TokenInvalido;

        var usuario = await servicoAuth.ObterUsuarioPorIdAsync(usuarioId, ct);
        if (usuario is null)
            return ErrosAuth.TokenInvalido;

        var novoTokenAcesso = servicoToken.GerarTokenAcesso(usuarioId, usuario.Email!, usuario.NomeCompleto!, usuario.Papeis!);
        var novoTokenAtualizacao = servicoToken.GerarTokenAtualizacao();
        var expiracao = DateTime.UtcNow.AddMinutes(15);

        await servicoAuth.AtualizarTokenAtualizacaoAsync(usuarioId, novoTokenAtualizacao, DateTime.UtcNow.AddDays(30), ct);

        return new RespostaAutenticacao(novoTokenAcesso, novoTokenAtualizacao, expiracao, usuarioId, usuario.NomeCompleto!, usuario.Email!);
    }

    private static string? ExtrairSubDoToken(string token)
    {
        try
        {
            var partes = token.Split('.');
            if (partes.Length != 3) return null;
            var payload = partes[1];
            var padding = 4 - payload.Length % 4;
            if (padding != 4) payload += new string('=', padding);
            var json = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(payload.Replace('-', '+').Replace('_', '/')));
            using var doc = System.Text.Json.JsonDocument.Parse(json);
            return doc.RootElement.TryGetProperty("sub", out var sub) ? sub.GetString() : null;
        }
        catch
        {
            return null;
        }
    }
}
