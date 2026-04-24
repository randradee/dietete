using DieTete.Domain.Entities;
using DieTete.Domain.Enums;
using DieTete.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace DieTete.Infrastructure.Persistence.Repositories;

public class ListaComprasRepositorio(DieTeteDbContext contexto) : IListaComprasRepositorio
{
    public async Task<ListaCompras?> ObterPorIdAsync(Guid id, CancellationToken ct = default) =>
        await contexto.ListasCompras
            .Include(l => l.Itens)
            .FirstOrDefaultAsync(l => l.Id == id, ct);

    public async Task<IReadOnlyList<ListaCompras>> ObterPorUsuarioAsync(Guid usuarioId, PeriodoCompras? periodo = null, CancellationToken ct = default)
    {
        var query = contexto.ListasCompras
            .Include(l => l.Itens)
            .Where(l => l.CriadoPorId == usuarioId);

        if (periodo.HasValue)
            query = query.Where(l => l.Periodo == periodo.Value);

        return await query.AsNoTracking().ToListAsync(ct);
    }

    public async Task<IReadOnlyList<ListaCompras>> ObterPorGrupoFamiliarAsync(Guid grupoFamiliarId, PeriodoCompras? periodo = null, CancellationToken ct = default)
    {
        var query = contexto.ListasCompras
            .Include(l => l.Itens)
            .Where(l => l.GrupoFamiliarId == grupoFamiliarId);

        if (periodo.HasValue)
            query = query.Where(l => l.Periodo == periodo.Value);

        return await query.AsNoTracking().ToListAsync(ct);
    }

    public async Task AdicionarAsync(ListaCompras lista, CancellationToken ct = default) =>
        await contexto.ListasCompras.AddAsync(lista, ct);

    public async Task SalvarAlteracoesAsync(CancellationToken ct = default) =>
        await contexto.SaveChangesAsync(ct);
}
