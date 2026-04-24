namespace DieTete.Domain.Interfaces.Services;

public interface IArmazenamentoArquivo
{
    Task<string> SalvarAsync(Stream conteudo, string nomeArquivo, string subpasta, CancellationToken ct = default);
    Task<Stream> ObterAsync(string caminho, CancellationToken ct = default);
    Task RemoverAsync(string caminho, CancellationToken ct = default);
}
