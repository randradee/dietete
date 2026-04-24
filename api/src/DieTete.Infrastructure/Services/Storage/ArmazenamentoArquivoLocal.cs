using DieTete.Domain.Interfaces.Services;
using Microsoft.Extensions.Configuration;

namespace DieTete.Infrastructure.Services.Storage;

public class ArmazenamentoArquivoLocal(IConfiguration configuration) : IArmazenamentoArquivo
{
    private readonly string _pastaBase = configuration["Armazenamento:PastaBase"] ?? "uploads";

    public async Task<string> SalvarAsync(Stream conteudo, string nomeArquivo, string subpasta, CancellationToken ct = default)
    {
        var pasta = Path.Combine(_pastaBase, subpasta);
        Directory.CreateDirectory(pasta);

        var nomeUnico = $"{Guid.NewGuid()}_{nomeArquivo}";
        var caminho = Path.Combine(pasta, nomeUnico);

        await using var arquivo = File.Create(caminho);
        await conteudo.CopyToAsync(arquivo, ct);

        return caminho;
    }

    public Task<Stream> ObterAsync(string caminho, CancellationToken ct = default)
    {
        Stream stream = File.OpenRead(caminho);
        return Task.FromResult(stream);
    }

    public Task RemoverAsync(string caminho, CancellationToken ct = default)
    {
        if (File.Exists(caminho))
            File.Delete(caminho);
        return Task.CompletedTask;
    }
}
