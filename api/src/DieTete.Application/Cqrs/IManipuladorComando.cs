using ErrorOr;

namespace DieTete.Application.Cqrs;

public interface IManipuladorComando<TComando, TResposta>
{
    Task<ErrorOr<TResposta>> ExecutarAsync(TComando comando, CancellationToken ct = default);
}
