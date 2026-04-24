using DieTete.Domain.Entities;
using DieTete.Domain.Enums;

namespace DieTete.Domain.Interfaces.Repositories;

public interface IListaComprasRepositorio
{
    Task<ListaCompras?> ObterPorIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<ListaCompras>> ObterPorUsuarioAsync(Guid usuarioId, PeriodoCompras? periodo = null, CancellationToken ct = default);
    Task<IReadOnlyList<ListaCompras>> ObterPorGrupoFamiliarAsync(Guid grupoFamiliarId, PeriodoCompras? periodo = null, CancellationToken ct = default);
    Task AdicionarAsync(ListaCompras lista, CancellationToken ct = default);
    Task SalvarAlteracoesAsync(CancellationToken ct = default);
}
