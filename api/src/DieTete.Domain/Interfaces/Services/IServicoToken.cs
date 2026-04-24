using DieTete.Domain.Entities;

namespace DieTete.Domain.Interfaces.Services;

public interface IServicoToken
{
    string GerarTokenAcesso(Guid usuarioId, string email, string nomeCompleto, IList<string> papeis);
    string GerarTokenAtualizacao();
}
