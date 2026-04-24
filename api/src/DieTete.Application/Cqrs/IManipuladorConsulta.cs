using ErrorOr;

namespace DieTete.Application.Cqrs;

public interface IManipuladorConsulta<TConsulta, TResposta>
{
    Task<ErrorOr<TResposta>> ExecutarAsync(TConsulta consulta, CancellationToken ct = default);
}
