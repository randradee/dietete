using DieTete.Domain.Entities;

namespace DieTete.Domain.Interfaces.Repositories;

public interface IGrupoFamiliarRepositorio
{
    Task<GrupoFamiliar?> ObterPorIdAsync(Guid id, CancellationToken ct = default);
    Task<GrupoFamiliar?> ObterPorUsuarioAsync(Guid usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<Guid>> ObterIdsMembrosAsync(Guid grupoId, CancellationToken ct = default);
    Task AdicionarAsync(GrupoFamiliar grupo, CancellationToken ct = default);
    Task SalvarAlteracoesAsync(CancellationToken ct = default);
}
