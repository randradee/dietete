using DieTete.Domain.Common;

namespace DieTete.Domain.Entities;

public class Usuario : Entity
{
    public string NomeCompleto { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public Guid? GrupoFamiliarId { get; private set; }

    private readonly List<PlanoDieta> _planosDieta = [];
    public IReadOnlyList<PlanoDieta> PlanosDieta => _planosDieta.AsReadOnly();

    private Usuario() { }

    public static Usuario Criar(string nomeCompleto, string email) =>
        new() { NomeCompleto = nomeCompleto, Email = email.ToLowerInvariant() };

    public void EntrarEmGrupoFamiliar(Guid grupoFamiliarId) => GrupoFamiliarId = grupoFamiliarId;

    public void AtualizarNome(string novoNome)
    {
        NomeCompleto = novoNome;
        SetUpdated();
    }
}
