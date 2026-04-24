using DieTete.Application.Cqrs;
using DieTete.Application.ListaCompras.Dtos;
using DieTete.Domain.Interfaces.Repositories;
using ErrorOr;

namespace DieTete.Application.ListaCompras.Queries.ObterListaCompras;

public class ObterListaComprasHandler(
    IListaComprasRepositorio repositorio) : IManipuladorConsulta<ObterListaComprasQuery, List<ListaComprasDto>>
{
    public async Task<ErrorOr<List<ListaComprasDto>>> ExecutarAsync(ObterListaComprasQuery consulta, CancellationToken ct = default)
    {
        IReadOnlyList<Domain.Entities.ListaCompras> listas;

        if (consulta.GrupoFamiliarId.HasValue)
            listas = await repositorio.ObterPorGrupoFamiliarAsync(consulta.GrupoFamiliarId.Value, consulta.Periodo, ct);
        else
            listas = await repositorio.ObterPorUsuarioAsync(consulta.UsuarioId, consulta.Periodo, ct);

        if (consulta.Tipo.HasValue)
            listas = listas.Where(l => l.Tipo == consulta.Tipo.Value).ToList();

        return listas.Select(MapearParaDto).ToList();
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
            Itens: itens);
    }
}
