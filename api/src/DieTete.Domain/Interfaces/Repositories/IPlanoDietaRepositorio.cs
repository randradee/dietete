using DieTete.Domain.Entities;

namespace DieTete.Domain.Interfaces.Repositories;

public interface IPlanoDietaRepositorio
{
    Task<PlanoDieta?> ObterPorIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<PlanoDieta>> ObterPorUsuarioAsync(Guid usuarioId, CancellationToken ct = default);
    Task AdicionarAsync(PlanoDieta plano, CancellationToken ct = default);
    Task SalvarAlteracoesAsync(CancellationToken ct = default);
}
