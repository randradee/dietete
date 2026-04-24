using DieTete.Domain.Interfaces.Services;

namespace DieTete.Infrastructure.Services.Pricing;

public class ConsultaPrecoDesabilitada : IConsultaPrecos
{
    public Task<decimal?> ConsultarPrecoMedioAsync(string nomeItem, CancellationToken ct = default)
        => Task.FromResult<decimal?>(null);
}
