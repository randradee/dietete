using DieTete.Application.ListaCompras.Dtos;
using DieTete.Domain.Interfaces.Repositories;
using ErrorOr;
using MediatR;

namespace DieTete.Application.ListaCompras.Queries.ObterListaCompras;

public class ObterListaComprasHandler(
    IListaComprasRepositorio repositorio) : IRequestHandler<ObterListaComprasQuery, ErrorOr<List<ListaComprasDto>>>
{
    public async Task<ErrorOr<List<ListaComprasDto>>> Handle(ObterListaComprasQuery request, CancellationToken ct)
    {
        IReadOnlyList<Domain.Entities.ListaCompras> listas;

        // Buscar por grupo familiar se fornecido
        if (request.GrupoFamiliarId.HasValue)
        {
            listas = await repositorio.ObterPorGrupoFamiliarAsync(request.GrupoFamiliarId.Value, request.Periodo, ct);
        }
        else
        {
            listas = await repositorio.ObterPorUsuarioAsync(request.UsuarioId, request.Periodo, ct);
        }

        // Filtrar por tipo se fornecido
        if (request.Tipo.HasValue)
        {
            listas = listas.Where(l => l.Tipo == request.Tipo.Value).ToList();
        }

        var resultado = listas.Select(MapearParaDto).ToList();
        return resultado;
    }

    private static ListaComprasDto MapearParaDto(Domain.Entities.ListaCompras lista)
    {
        var itens = lista.Itens.Select(i => new ItemListaComprasDto(
            Id: i.Id,
            Nome: i.Nome,
            QuantidadeTotal: i.QuantidadeTotal,
            Unidade: i.Unidade.ToString(),
            Categoria: i.Categoria.ToString(),
            EditadoManualmente: i.EditadoManualmente,
            PrecoEstimado: i.PrecoEstimado
        )).ToList();

        return new ListaComprasDto(
            Id: lista.Id,
            Periodo: lista.Periodo.ToString(),
            Tipo: lista.Tipo.ToString(),
            DataInicio: lista.DataInicio,
            DataFim: lista.DataFim,
            Itens: itens
        );
    }
}
