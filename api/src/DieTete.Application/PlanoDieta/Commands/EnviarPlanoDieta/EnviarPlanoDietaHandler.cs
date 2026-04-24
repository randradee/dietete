using DieTete.Application.PlanoDieta.Dtos;
using DieTete.Domain.Errors;
using DieTete.Domain.Interfaces.Repositories;
using DieTete.Domain.Interfaces.Services;
using ErrorOr;
using MediatR;
using PlanoDietaEntity = DieTete.Domain.Entities.PlanoDieta;

namespace DieTete.Application.PlanoDieta.Commands.EnviarPlanoDieta;

public class EnviarPlanoDietaHandler(
    IArmazenamentoArquivo armazenamento,
    IPlanoDietaRepositorio repositorioPlanoDieta,
    IParsadorPlanoDieta parsador) : IRequestHandler<EnviarPlanoDietaComando, ErrorOr<PlanoDietaDto>>
{
    public async Task<ErrorOr<PlanoDietaDto>> Handle(EnviarPlanoDietaComando request, CancellationToken ct)
    {
        // Validação de extensão e tamanho
        if (!request.NomeArquivo.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
        {
            return ErrosPlanoDieta.ApenasArquivosPdf;
        }

        const long tamanhoMaximoBytes = 10 * 1024 * 1024; // 10MB
        if (request.TamanhoBytes > tamanhoMaximoBytes)
        {
            return ErrosPlanoDieta.TamanhoMaximoExcedido;
        }

        // Salvar PDF
        var caminhoArquivo = await armazenamento.SalvarAsync(
            request.ConteudoPdf,
            request.NomeArquivo,
            "planos-dieta",
            ct);

        // Criar plano
        var plano = PlanoDietaEntity.Criar(request.UsuarioId, request.NomeArquivo, caminhoArquivo);
        await repositorioPlanoDieta.AdicionarAsync(plano, ct);

        // Fazer parsing
        request.ConteudoPdf.Position = 0; // Reset stream position
        var resultado = await parsador.ParsearAsync(request.ConteudoPdf, ct);

        if (!resultado.Sucesso)
        {
            plano.MarcarComoFalhou(resultado.MensagemErro!);
            await repositorioPlanoDieta.SalvarAlteracoesAsync(ct);
            return ErrosPlanoDieta.FalhaNoProcessamento;
        }

        // Adicionar dias ao plano
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
