using DieTete.Application.Cqrs;
using DieTete.Application.PlanoDieta.Dtos;
using DieTete.Domain.Errors;
using DieTete.Domain.Interfaces.Repositories;
using ErrorOr;

namespace DieTete.Application.PlanoDieta.Queries.ObterPlanoDieta;

public class ObterPlanoDietaHandler(
    IPlanoDietaRepositorio repositorio) : IManipuladorConsulta<ObterPlanoDietaQuery, PlanoDietaDto>
{
    public async Task<ErrorOr<PlanoDietaDto>> ExecutarAsync(ObterPlanoDietaQuery consulta, CancellationToken ct = default)
    {
        var plano = await repositorio.ObterPorIdAsync(consulta.Id, ct);

        if (plano is null || plano.UsuarioId != consulta.UsuarioId)
            return ErrosPlanoDieta.NaoEncontrado;

        int itensSemConfianca = 0;
        int totalItens = 0;
        foreach (var dia in plano.Dias)
        {
            foreach (var refeicao in dia.Refeicoes)
            {
                foreach (var item in refeicao.Itens)
                {
                    totalItens++;
                    if (item.NecessitaRevisao) itensSemConfianca++;
                }
            }
        }

        return MapearParaDto(plano, totalItens, itensSemConfianca);
    }

    private static PlanoDietaDto MapearParaDto(Domain.Entities.PlanoDieta plano, int totalItens, int itensSemConfianca) =>
        new(
            Id: plano.Id,
            NomeArquivoOriginal: plano.NomeArquivoOriginal,
            Status: plano.Status.ToString(),
            ProcessadoEm: plano.ProcessadoEm,
            TotalDias: plano.Dias.Count,
            TotalItens: totalItens,
            ItensSemConfianca: itensSemConfianca);
}
