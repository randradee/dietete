using DieTete.Domain.Entities;
using DieTete.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace DieTete.Infrastructure.Persistence.Repositories;

public class PrecoItemRepositorio(DieTeteDbContext contexto) : IPrecoItemRepositorio
{
    public async Task<PrecoItem?> ObterMaisRecenteAsync(string nomeItem, CancellationToken ct = default) =>
        await contexto.PrecosItens
            .Where(p => p.NomeItem == nomeItem.ToLowerInvariant() && p.ExpiraEm > DateTime.UtcNow)
            .OrderByDescending(p => p.ColetadoEm)
            .AsNoTracking()
            .FirstOrDefaultAsync(ct);

    public async Task<IReadOnlyList<PrecoItem>> ObterTodosPorNomeAsync(string nomeItem, CancellationToken ct = default) =>
        await contexto.PrecosItens
            .Where(p => p.NomeItem == nomeItem.ToLowerInvariant())
            .AsNoTracking()
            .ToListAsync(ct);

    public async Task<IReadOnlyList<string>> ObterNomesExpiradosAsync(CancellationToken ct = default) =>
        await contexto.PrecosItens
            .Where(p => p.ExpiraEm <= DateTime.UtcNow)
            .Select(p => p.NomeItem)
            .Distinct()
            .ToListAsync(ct);

    public async Task AdicionarAsync(PrecoItem preco, CancellationToken ct = default) =>
        await contexto.PrecosItens.AddAsync(preco, ct);

    public async Task SalvarAlteracoesAsync(CancellationToken ct = default) =>
        await contexto.SaveChangesAsync(ct);
}
