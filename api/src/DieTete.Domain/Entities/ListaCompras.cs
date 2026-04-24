using DieTete.Domain.Common;
using DieTete.Domain.Enums;

namespace DieTete.Domain.Entities;

public class ListaCompras : Entity
{
    public Guid CriadoPorId { get; private set; }
    public Guid? GrupoFamiliarId { get; private set; }
    public PeriodoCompras Periodo { get; private set; }
    public TipoListaCompras Tipo { get; private set; }
    public DateOnly DataInicio { get; private set; }
    public DateOnly DataFim { get; private set; }
    private readonly List<ItemListaCompras> _itens = [];
    public IReadOnlyList<ItemListaCompras> Itens => _itens.AsReadOnly();

    private ListaCompras() { }

    public static ListaCompras CriarSemanal(Guid criadoPorId, Guid? grupoFamiliarId, TipoListaCompras tipo, DateOnly inicio) =>
        new()
        {
            CriadoPorId = criadoPorId,
            GrupoFamiliarId = grupoFamiliarId,
            Periodo = PeriodoCompras.Semanal,
            Tipo = tipo,
            DataInicio = inicio,
            DataFim = inicio.AddDays(6)
        };

    public static ListaCompras CriarMensal(Guid criadoPorId, Guid? grupoFamiliarId, TipoListaCompras tipo, DateOnly inicio) =>
        new()
        {
            CriadoPorId = criadoPorId,
            GrupoFamiliarId = grupoFamiliarId,
            Periodo = PeriodoCompras.Mensal,
            Tipo = tipo,
            DataInicio = inicio,
            DataFim = inicio.AddDays(29)
        };

    public void AdicionarItem(ItemListaCompras item) => _itens.Add(item);

    public void AdicionarItens(IEnumerable<ItemListaCompras> itens) => _itens.AddRange(itens);
}
