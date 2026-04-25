using DieTete.Domain.Common;

namespace DieTete.Domain.Entities;

public class GrupoFamiliar : Entity
{
    public string Nome { get; private set; } = default!;

    private GrupoFamiliar() { }

    public static GrupoFamiliar Criar(string nome) => new() { Nome = nome };
}
