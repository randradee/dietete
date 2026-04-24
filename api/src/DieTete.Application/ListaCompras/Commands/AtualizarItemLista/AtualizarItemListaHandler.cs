using DieTete.Application.ListaCompras.Dtos;
using DieTete.Domain.Errors;
using DieTete.Domain.Interfaces.Repositories;
using ErrorOr;
using MediatR;

namespace DieTete.Application.ListaCompras.Commands.AtualizarItemLista;

public class AtualizarItemListaHandler(
    IListaComprasRepositorio repositorio) : IRequestHandler<AtualizarItemListaComando, ErrorOr<ItemListaComprasDto>>
{
    public async Task<ErrorOr<ItemListaComprasDto>> Handle(AtualizarItemListaComando request, CancellationToken ct)
    {
        var lista = await repositorio.ObterPorIdAsync(request.ListaId, ct);

        if (lista is null)
        {
            return ErrosListaCompras.NaoEncontrada;
        }

        if (lista.CriadoPorId != request.UsuarioId)
        {
            return ErrosListaCompras.NaoEncontrada;
        }

        var item = lista.Itens.FirstOrDefault(i => i.Id == request.ItemId);

        if (item is null)
        {
            return ErrosListaCompras.ItemNaoEncontrado;
        }

        item.Atualizar(request.Nome, request.Quantidade, request.Unidade);
        await repositorio.SalvarAlteracoesAsync(ct);

        return MapearParaDto(item);
    }

    private static ItemListaComprasDto MapearParaDto(Domain.Entities.ItemListaCompras item) =>
        new(
            Id: item.Id,
            Nome: item.Nome,
            QuantidadeTotal: item.QuantidadeTotal,
            Unidade: item.Unidade.ToString(),
            Categoria: item.Categoria.ToString(),
            EditadoManualmente: item.EditadoManualmente,
            PrecoEstimado: item.PrecoEstimado
        );
}
