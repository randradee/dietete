using DieTete.Domain.Common;
using DieTete.Domain.Enums;

namespace DieTete.Domain.Entities;

public class ItemListaCompras : Entity
{
    public string Nome { get; private set; } = default!;
    public decimal QuantidadeTotal { get; private set; }
    public UnidadeMedida Unidade { get; private set; }
    public CategoriaAlimento Categoria { get; private set; }
    public bool EditadoManualmente { get; private set; }
    public decimal? PrecoEstimado { get; private set; }
    public Guid ListaComprasId { get; private set; }

    private ItemListaCompras() { }

    public static ItemListaCompras Criar(string nome, decimal quantidade, UnidadeMedida unidade, CategoriaAlimento categoria, Guid listaComprasId) =>
        new()
        {
            Nome = nome,
            QuantidadeTotal = quantidade,
            Unidade = unidade,
            Categoria = categoria,
            ListaComprasId = listaComprasId
        };

    public void Atualizar(string nome, decimal quantidade, UnidadeMedida unidade)
    {
        Nome = nome;
        QuantidadeTotal = quantidade;
        Unidade = unidade;
        EditadoManualmente = true;
        SetUpdated();
    }

    public void DefinirPrecoEstimado(decimal preco)
    {
        PrecoEstimado = preco;
        SetUpdated();
    }
}
