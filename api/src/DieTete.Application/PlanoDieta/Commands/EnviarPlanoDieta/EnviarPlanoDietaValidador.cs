using FluentValidation;

namespace DieTete.Application.PlanoDieta.Commands.EnviarPlanoDieta;

public class EnviarPlanoDietaValidador : AbstractValidator<EnviarPlanoDietaComando>
{
    private const long TamanhoMaximoBytes = 10 * 1024 * 1024; // 10MB

    public EnviarPlanoDietaValidador()
    {
        RuleFor(x => x.NomeArquivo)
            .Must(nome => nome.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Apenas arquivos PDF são aceitos.");

        RuleFor(x => x.TamanhoBytes)
            .LessThanOrEqualTo(TamanhoMaximoBytes)
            .WithMessage("O arquivo PDF não pode ter mais de 10MB.");
    }
}
