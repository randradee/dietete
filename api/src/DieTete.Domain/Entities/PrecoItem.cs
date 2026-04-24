using DieTete.Domain.Common;

namespace DieTete.Domain.Entities;

public class PrecoItem : Entity
{
    public string NomeItem { get; private set; } = default!;
    public decimal Preco { get; private set; }
    public string NomeEstabelecimento { get; private set; } = default!;
    public DateTime ColetadoEm { get; private set; }
    public DateTime ExpiraEm { get; private set; }

    private PrecoItem() { }

    public static PrecoItem Criar(string nomeItem, decimal preco, string nomeEstabelecimento) =>
        new()
        {
            NomeItem = nomeItem.ToLowerInvariant(),
            Preco = preco,
            NomeEstabelecimento = nomeEstabelecimento,
            ColetadoEm = DateTime.UtcNow,
            ExpiraEm = DateTime.UtcNow.AddDays(7)
        };

    public bool Expirado => DateTime.UtcNow > ExpiraEm;
}
