using DieTete.Domain.Common;
using DieTete.Domain.Enums;

namespace DieTete.Domain.Entities;

public class ItemAlimento : Entity
{
    public string Nome { get; private set; } = default!;
    public decimal Quantidade { get; private set; }
    public UnidadeMedida Unidade { get; private set; }
    public double PontuacaoConfianca { get; private set; }
    public bool NecessitaRevisao => PontuacaoConfianca < 0.5;
    public Guid RefeicaoId { get; private set; }

    private ItemAlimento() { }

    public static ItemAlimento Criar(string nome, decimal quantidade, UnidadeMedida unidade, double pontuacaoConfianca, Guid refeicaoId)
    {
        return new ItemAlimento
        {
            Nome = nome,
            Quantidade = quantidade,
            Unidade = unidade,
            PontuacaoConfianca = pontuacaoConfianca,
            RefeicaoId = refeicaoId
        };
    }

    public void Atualizar(string nome, decimal quantidade, UnidadeMedida unidade)
    {
        Nome = nome;
        Quantidade = quantidade;
        Unidade = unidade;
        PontuacaoConfianca = 1.0;
        SetUpdated();
    }
}
