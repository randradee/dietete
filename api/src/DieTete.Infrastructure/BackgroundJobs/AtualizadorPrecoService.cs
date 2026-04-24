using DieTete.Domain.Interfaces.Repositories;
using DieTete.Domain.Interfaces.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DieTete.Infrastructure.BackgroundJobs;

public sealed class AtualizadorPrecoService(
    IServiceScopeFactory scopeFactory,
    ILogger<AtualizadorPrecoService> logger,
    int intervaloHoras = 6) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        logger.LogInformation("Serviço de atualização de preços iniciado (intervalo: {h}h).", intervaloHoras);

        while (!ct.IsCancellationRequested)
        {
            await AtualizarAsync(ct);
            await Task.Delay(TimeSpan.FromHours(intervaloHoras), ct);
        }
    }

    private async Task AtualizarAsync(CancellationToken ct)
    {
        using var escopo = scopeFactory.CreateScope();
        var repositorio = escopo.ServiceProvider.GetRequiredService<IPrecoItemRepositorio>();
        var consultaPrecos = escopo.ServiceProvider.GetRequiredService<IConsultaPrecos>();

        try
        {
            var nomesExpirados = await repositorio.ObterNomesExpiradosAsync(ct);

            if (nomesExpirados.Count == 0)
            {
                logger.LogDebug("Nenhum preço expirado para atualizar.");
                return;
            }

            logger.LogInformation("Atualizando preços de {n} itens expirados.", nomesExpirados.Count);

            foreach (var nome in nomesExpirados)
            {
                if (ct.IsCancellationRequested) break;
                try
                {
                    // ConsultarPrecoMedioAsync já salva o novo registro no banco quando encontra
                    await consultaPrecos.ConsultarPrecoMedioAsync(nome, ct);
                }
                catch (Exception ex)
                {
                    // Falhas individuais são silenciosas para não interromper a atualização dos demais
                    logger.LogWarning(ex, "Falha ao atualizar preço de '{nome}'.", nome);
                }

                // Pequena pausa entre requisições para não sobrecarregar o scraping
                await Task.Delay(TimeSpan.FromSeconds(2), ct);
            }

            logger.LogInformation("Atualização de preços concluída.");
        }
        catch (OperationCanceledException)
        {
            // encerramento normal
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro inesperado no ciclo de atualização de preços.");
        }
    }
}
