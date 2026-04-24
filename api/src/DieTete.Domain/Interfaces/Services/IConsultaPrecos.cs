namespace DieTete.Domain.Interfaces.Services;

public interface IConsultaPrecos
{
    Task<decimal?> ConsultarPrecoMedioAsync(string nomeItem, CancellationToken ct = default);
}
