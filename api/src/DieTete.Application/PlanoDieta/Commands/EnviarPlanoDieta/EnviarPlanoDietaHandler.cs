using DieTete.Application.Cqrs;
using DieTete.Application.PlanoDieta.Dtos;
using DieTete.Domain.Errors;
using DieTete.Domain.Interfaces.Repositories;
using DieTete.Domain.Interfaces.Services;
using ErrorOr;
using PlanoDietaEntity = DieTete.Domain.Entities.PlanoDieta;

namespace DieTete.Application.PlanoDieta.Commands.EnviarPlanoDieta;

public class EnviarPlanoDietaHandler(
    IArmazenamentoArquivo armazenamento,
    IPlanoDietaRepositorio repositorioPlanoDieta,
    IParsadorPlanoDieta parsador) : IManipuladorComando<EnviarPlanoDietaComando, PlanoDietaDto>
{
    public async Task<ErrorOr<PlanoDietaDto>> ExecutarAsync(EnviarPlanoDietaComando comando, CancellationToken ct = default)
    {
        if (!comando.NomeArquivo.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            return ErrosPlanoDieta.ApenasArquivosPdf;

        const long tamanhoMaximoBytes = 10 * 1024 * 1024;
        if (comando.TamanhoBytes > tamanhoMaximoBytes)
            return ErrosPlanoDieta.TamanhoMaximoExcedido;

        var caminhoArquivo = await armazenamento.SalvarAsync(
            comando.ConteudoPdf,
            comando.NomeArquivo,
            "planos-dieta",
            ct);

        var plano = PlanoDietaEntity.Criar(comando.UsuarioId, comando.NomeArquivo, caminhoArquivo);
        await repositorioPlanoDieta.AdicionarAsync(plano, ct);

        comando.ConteudoPdf.Position = 0;
        var resultado = await parsador.ParsearAsync(comando.ConteudoPdf, ct);

        if (!resultado.Sucesso)
        {
            plano.MarcarComoFalhou(resultado.MensagemErro!);
            await repositorioPlanoDieta.SalvarAlteracoesAsync(ct);
            return ErrosPlanoDieta.FalhaNoProcessamento;
        }

        foreach (var dia in resultado.Dias)
        {
            plano.AdicionarDia(dia);
        }

        plano.MarcarComoProcessado();
        await repositorioPlanoDieta.SalvarAlteracoesAsync(ct);

        return MapearParaDto(plano, resultado);
    }

    private static PlanoDietaDto MapearParaDto(PlanoDietaEntity plano, ResultadoParsing resultado) =>
        new(
            Id: plano.Id,
            NomeArquivoOriginal: plano.NomeArquivoOriginal,
            Status: plano.Status.ToString(),
            ProcessadoEm: plano.ProcessadoEm,
            TotalDias: plano.Dias.Count,
            TotalItens: resultado.TotalItens,
            ItensSemConfianca: resultado.ItensSemConfianca);
}
