using DieTete.Domain.Common;

namespace DieTete.Domain.Entities;

public class DiaDieta : Entity
{
    public Guid PlanoDietaId { get; private set; }
    public DayOfWeek? DiaDaSemana { get; private set; }
    public DateOnly? Data { get; private set; }
    public int OrdemNoDia { get; private set; }
    private readonly List<Refeicao> _refeicoes = [];
    public IReadOnlyList<Refeicao> Refeicoes => _refeicoes.AsReadOnly();

    private DiaDieta() { }

    public static DiaDieta CriarPorDiaDaSemana(Guid planoDietaId, DayOfWeek dia, int ordem) =>
        new() { PlanoDietaId = planoDietaId, DiaDaSemana = dia, OrdemNoDia = ordem };

    public static DiaDieta CriarPorData(Guid planoDietaId, DateOnly data, int ordem) =>
        new() { PlanoDietaId = planoDietaId, Data = data, OrdemNoDia = ordem };

    public void AdicionarRefeicao(Refeicao refeicao) => _refeicoes.Add(refeicao);
}
