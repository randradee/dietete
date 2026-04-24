using MediatR;
using Microsoft.Extensions.Logging;

namespace DieTete.Application.Behaviors;

public class ComportamentoLog<TRequest, TResponse>(ILogger<ComportamentoLog<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var nome = typeof(TRequest).Name;
        logger.LogInformation("Executando {Comando}", nome);
        var resultado = await next(ct);
        logger.LogInformation("{Comando} concluído", nome);
        return resultado;
    }
}
