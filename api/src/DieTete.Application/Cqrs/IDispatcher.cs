using ErrorOr;

namespace DieTete.Application.Cqrs;

public interface IDispatcher
{
    Task<ErrorOr<TResposta>> EnviarAsync<TComando, TResposta>(TComando comando, CancellationToken ct = default)
        where TComando : notnull;

    Task<ErrorOr<TResposta>> ConsultarAsync<TConsulta, TResposta>(TConsulta consulta, CancellationToken ct = default)
        where TConsulta : notnull;
}
