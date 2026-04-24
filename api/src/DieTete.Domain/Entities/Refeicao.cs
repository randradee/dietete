using DieTete.Domain.Common;
using DieTete.Domain.Enums;

namespace DieTete.Domain.Entities;

public class Refeicao : Entity
{
    public TipoRefeicao Tipo { get; private set; }
    public Guid DiaDietaId { get; private set; }
    private readonly List<ItemAlimento> _itens = [];
    public IReadOnlyList<ItemAlimento> Itens => _itens.AsReadOnly();

    private Refeicao() { }

    public static Refeicao Criar(TipoRefeicao tipo, Guid diaDietaId) =>
        new() { Tipo = tipo, DiaDietaId = diaDietaId };

    public void AdicionarItem(ItemAlimento item) => _itens.Add(item);
}
