using DieTete.Application.PlanoDieta.Dtos;
using DieTete.Domain.Errors;
using DieTete.Domain.Interfaces.Repositories;
using DieTete.Domain.Interfaces.Services;
using ErrorOr;
using MediatR;

namespace DieTete.Application.PlanoDieta.Queries.ObterPlanoDieta;

public class ObterPlanoDietaHandler(
    IPlanoDietaRepositorio repositorio) : IRequestHandler<ObterPlanoDietaQuery, ErrorOr<PlanoDietaDto>>
{
    public async Task<ErrorOr<PlanoDietaDto>> Handle(ObterPlanoDietaQuery request, CancellationToken ct)
    {
        var plano = await repositorio.ObterPorIdAsync(request.Id, ct);

        if (plano is null)
        {
            return ErrosPlanoDieta.NaoEncontrado;
        }

        if (plano.UsuarioId != request.UsuarioId)
        {
            return ErrosPlanoDieta.NaoEncontrado;
        }

        // Contar itens sem confiança
        int itensSemConfianca = 0;
        foreach (var dia in plano.Dias)
        {
            foreach (var refeicao in dia.Refeicoes)
            {
                foreach (var item in refeicao.Itens)
                {
                    if (item.NecessitaRevisao)
                    {
                        itensSemConfianca++;
                    }
                }
            }
        }

        // Contar total de itens
        int totalItens = 0;
        foreach (var dia in plano.Dias)
        {
            foreach (var refeicao in dia.Refeicoes)
            {
                totalItens += refeicao.Itens.Count;
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
