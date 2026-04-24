using DieTete.Application.ListaCompras.Dtos;
using DieTete.Domain.Enums;
using ErrorOr;

namespace DieTete.Application.ListaCompras.Queries.ObterListaCompras;

public record ObterListaComprasQuery(
    Guid UsuarioId,
    Guid? GrupoFamiliarId,
    PeriodoCompras? Periodo,
    TipoListaCompras? Tipo);
