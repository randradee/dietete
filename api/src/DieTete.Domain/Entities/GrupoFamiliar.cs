using DieTete.Domain.Common;

namespace DieTete.Domain.Entities;

public class GrupoFamiliar : Entity
{
    public string Nome { get; private set; } = default!;
    private readonly List<Usuario> _membros = [];
    public IReadOnlyList<Usuario> Membros => _membros.AsReadOnly();

    private GrupoFamiliar() { }

    public static GrupoFamiliar Criar(string nome) => new() { Nome = nome };

    public void AdicionarMembro(Usuario usuario) => _membros.Add(usuario);
}
