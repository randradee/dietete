using DieTete.Application.ListaCompras.Dtos;
using DieTete.Domain.Enums;
using ErrorOr;
using MediatR;

namespace DieTete.Application.ListaCompras.Commands.AtualizarItemLista;

public record AtualizarItemListaComando(
    Guid ListaId,
    Guid ItemId,
    Guid UsuarioId,
    string Nome,
    decimal Quantidade,
    UnidadeMedida Unidade) : IRequest<ErrorOr<ItemListaComprasDto>>;
