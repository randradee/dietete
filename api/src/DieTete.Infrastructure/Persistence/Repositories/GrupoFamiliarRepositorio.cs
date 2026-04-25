using DieTete.Domain.Entities;
using DieTete.Domain.Interfaces.Repositories;
using DieTete.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace DieTete.Infrastructure.Persistence.Repositories;

public class GrupoFamiliarRepositorio(DieTeteDbContext contexto) : IGrupoFamiliarRepositorio
{
    public async Task<GrupoFamiliar?> ObterPorIdAsync(Guid id, CancellationToken ct = default) =>
        await contexto.GruposFamiliares.FirstOrDefaultAsync(g => g.Id == id, ct);

    public async Task<GrupoFamiliar?> ObterPorUsuarioAsync(Guid usuarioId, CancellationToken ct = default)
    {
        var usuario = await contexto.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == usuarioId, ct);

        if (usuario?.GrupoFamiliarId is null)
            return null;

        return await contexto.GruposFamiliares
            .FirstOrDefaultAsync(g => g.Id == usuario.GrupoFamiliarId, ct);
    }

    public async Task<IReadOnlyList<Guid>> ObterIdsMembrosAsync(Guid grupoId, CancellationToken ct = default) =>
        await contexto.Users
            .AsNoTracking()
            .Where(u => u.GrupoFamiliarId == grupoId)
            .Select(u => u.Id)
            .ToListAsync(ct);

    public async Task AdicionarAsync(GrupoFamiliar grupo, CancellationToken ct = default) =>
        await contexto.GruposFamiliares.AddAsync(grupo, ct);

    public async Task SalvarAlteracoesAsync(CancellationToken ct = default) =>
        await contexto.SaveChangesAsync(ct);
}
