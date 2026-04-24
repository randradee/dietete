using DieTete.Domain.Entities;

namespace DieTete.Domain.Interfaces.Repositories;

public interface IPrecoItemRepositorio
{
    Task<PrecoItem?> ObterMaisRecenteAsync(string nomeItem, CancellationToken ct = default);
    Task<IReadOnlyList<PrecoItem>> ObterTodosPorNomeAsync(string nomeItem, CancellationToken ct = default);
    Task AdicionarAsync(PrecoItem preco, CancellationToken ct = default);
    Task SalvarAlteracoesAsync(CancellationToken ct = default);
}
