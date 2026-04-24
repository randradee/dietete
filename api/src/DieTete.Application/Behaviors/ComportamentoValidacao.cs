using FluentValidation;
using MediatR;

namespace DieTete.Application.Behaviors;

public class ComportamentoValidacao<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validadores)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (!validadores.Any())
            return await next(ct);

        var contexto = new ValidationContext<TRequest>(request);
        var falhas = (await Task.WhenAll(validadores.Select(v => v.ValidateAsync(contexto, ct))))
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (falhas.Count > 0)
            throw new ValidationException(falhas);

        return await next(ct);
    }
}
