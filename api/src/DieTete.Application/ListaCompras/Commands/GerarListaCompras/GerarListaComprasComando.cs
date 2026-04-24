using DieTete.Application.ListaCompras.Dtos;
using DieTete.Domain.Enums;
using ErrorOr;
using MediatR;

namespace DieTete.Application.ListaCompras.Commands.GerarListaCompras;

public record GerarListaComprasComando(
    Guid UsuarioId,
    Guid? GrupoFamiliarId,
    PeriodoCompras Periodo,
    TipoListaCompras Tipo,
    DateOnly DataInicio) : IRequest<ErrorOr<ListaComprasDto>>;
