using DieTete.Application.Cqrs;
using DieTete.Application.ListaCompras.Dtos;
using DieTete.Domain.Errors;
using DieTete.Domain.Interfaces.Repositories;
using ErrorOr;

namespace DieTete.Application.ListaCompras.Commands.AtualizarItemLista;

public class AtualizarItemListaHandler(
    IListaComprasRepositorio repositorio) : IManipuladorComando<AtualizarItemListaComando, ItemListaComprasDto>
{
    public async Task<ErrorOr<ItemListaComprasDto>> ExecutarAsync(AtualizarItemListaComando comando, CancellationToken ct = default)
    {
        var lista = await repositorio.ObterPorIdAsync(comando.ListaId, ct);

        if (lista is null || lista.CriadoPorId != comando.UsuarioId)
            return ErrosListaCompras.NaoEncontrada;

        var item = lista.Itens.FirstOrDefault(i => i.Id == comando.ItemId);

        if (item is null)
            return ErrosListaCompras.ItemNaoEncontrado;

        item.Atualizar(comando.Nome, comando.Quantidade, comando.Unidade);
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
            PrecoEstimado: item.PrecoEstimado);
}
