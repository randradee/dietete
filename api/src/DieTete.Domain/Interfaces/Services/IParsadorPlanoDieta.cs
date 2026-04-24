using DieTete.Domain.Entities;

namespace DieTete.Domain.Interfaces.Services;

public interface IParsadorPlanoDieta
{
    Task<ResultadoParsing> ParsearAsync(Stream pdfStream, CancellationToken ct = default);
}

public record ResultadoParsing(
    IReadOnlyList<DiaDieta> Dias,
    int TotalItens,
    int ItensSemConfianca,
    bool Sucesso,
    string? MensagemErro = null);
