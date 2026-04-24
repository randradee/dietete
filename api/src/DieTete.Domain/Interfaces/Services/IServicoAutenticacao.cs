namespace DieTete.Domain.Interfaces.Services;

public record ResultadoAutenticacao(
    bool Sucesso,
    Guid? UsuarioId,
    string? NomeCompleto,
    string? Email,
    IList<string>? Papeis,
    string? ErroDescricao = null);

public interface IServicoAutenticacao
{
    Task<ResultadoAutenticacao> RegistrarAsync(string nomeCompleto, string email, string senha, CancellationToken ct = default);
    Task<ResultadoAutenticacao> EntrarAsync(string email, string senha, CancellationToken ct = default);
    Task<ResultadoAutenticacao?> ObterUsuarioPorIdAsync(Guid usuarioId, CancellationToken ct = default);
    Task<bool> AtualizarTokenAtualizacaoAsync(Guid usuarioId, string token, DateTime expiracao, CancellationToken ct = default);
    Task<bool> ValidarTokenAtualizacaoAsync(Guid usuarioId, string token, CancellationToken ct = default);
}
