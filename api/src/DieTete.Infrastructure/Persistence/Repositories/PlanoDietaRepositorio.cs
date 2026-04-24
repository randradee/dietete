using DieTete.Domain.Entities;
using DieTete.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace DieTete.Infrastructure.Persistence.Repositories;

public class PlanoDietaRepositorio(DieTeteDbContext contexto) : IPlanoDietaRepositorio
{
    public async Task<PlanoDieta?> ObterPorIdAsync(Guid id, CancellationToken ct = default) =>
        await contexto.PlanosDieta
            .Include(p => p.Dias)
                .ThenInclude(d => d.Refeicoes)
                    .ThenInclude(r => r.Itens)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IReadOnlyList<PlanoDieta>> ObterPorUsuarioAsync(Guid usuarioId, CancellationToken ct = default) =>
        await contexto.PlanosDieta
            .Include(p => p.Dias)
                .ThenInclude(d => d.Refeicoes)
                    .ThenInclude(r => r.Itens)
            .Where(p => p.UsuarioId == usuarioId)
            .AsNoTracking()
            .ToListAsync(ct);

    public async Task AdicionarAsync(PlanoDieta plano, CancellationToken ct = default) =>
        await contexto.PlanosDieta.AddAsync(plano, ct);

    public async Task SalvarAlteracoesAsync(CancellationToken ct = default) =>
        await contexto.SaveChangesAsync(ct);
}
