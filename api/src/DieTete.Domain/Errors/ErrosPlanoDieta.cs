using ErrorOr;

namespace DieTete.Domain.Errors;

public static class ErrosPlanoDieta
{
    public static readonly Error NaoEncontrado =
        Error.NotFound("PlanoDieta.NaoEncontrado", "Plano de dieta não encontrado.");

    public static readonly Error ApenasArquivosPdf =
        Error.Validation("PlanoDieta.ApenasArquivosPdf", "Apenas arquivos PDF são aceitos.");

    public static readonly Error TamanhoMaximoExcedido =
        Error.Validation("PlanoDieta.TamanhoMaximoExcedido", "O arquivo PDF não pode ter mais de 10MB.");

    public static readonly Error FalhaNoProcessamento =
        Error.Failure("PlanoDieta.FalhaNoProcessamento", "Falha ao processar o PDF.");
}
