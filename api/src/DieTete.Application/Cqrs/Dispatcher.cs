using ErrorOr;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace DieTete.Application.Cqrs;

public sealed class Dispatcher(
    IServiceProvider serviceProvider,
    ILogger<Dispatcher> logger) : IDispatcher
{
    public async Task<ErrorOr<TResposta>> EnviarAsync<TComando, TResposta>(TComando comando, CancellationToken ct = default)
        where TComando : notnull
    {
        await ValidarAsync(comando, ct);

        var nome = typeof(TComando).Name;
        logger.LogInformation("Executando {Comando}", nome);

        var manipulador = serviceProvider.GetRequiredService<IManipuladorComando<TComando, TResposta>>();
        var resultado = await manipulador.ExecutarAsync(comando, ct);

        logger.LogInformation("{Comando} concluído", nome);
        return resultado;
    }

    public async Task<ErrorOr<TResposta>> ConsultarAsync<TConsulta, TResposta>(TConsulta consulta, CancellationToken ct = default)
        where TConsulta : notnull
    {
        await ValidarAsync(consulta, ct);

        var nome = typeof(TConsulta).Name;
        logger.LogInformation("Executando {Consulta}", nome);

        var manipulador = serviceProvider.GetRequiredService<IManipuladorConsulta<TConsulta, TResposta>>();
        var resultado = await manipulador.ExecutarAsync(consulta, ct);

        logger.LogInformation("{Consulta} concluída", nome);
        return resultado;
    }

    private async Task ValidarAsync<T>(T objeto, CancellationToken ct)
    {
        var validadores = serviceProvider.GetServices<IValidator<T>>();
        if (!validadores.Any()) return;

        var contexto = new ValidationContext<T>(objeto);
        var falhas = (await Task.WhenAll(validadores.Select(v => v.ValidateAsync(contexto, ct))))
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (falhas.Count > 0)
            throw new ValidationException(falhas);
    }
}
