namespace DieTete.Application.PlanoDieta.Dtos;

public record PlanoDietaDto(
    Guid Id,
    string NomeArquivoOriginal,
    string Status,
    DateTime? ProcessadoEm,
    int TotalDias,
    int TotalItens,
    int ItensSemConfianca);
