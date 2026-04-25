using DieTete.Application.Cqrs;
using DieTete.Application.ListaCompras.Dtos;
using DieTete.Domain.Enums;
using DieTete.Domain.Errors;
using DieTete.Domain.Interfaces.Repositories;
using ErrorOr;
using ListaComprasEntity = DieTete.Domain.Entities.ListaCompras;
using DiaDietaEntity = DieTete.Domain.Entities.DiaDieta;

namespace DieTete.Application.ListaCompras.Commands.GerarListaCompras;

public class GerarListaComprasHandler(
    IPlanoDietaRepositorio repositorioPlanoDieta,
    IListaComprasRepositorio repositorioListaCompras,
    IGrupoFamiliarRepositorio repositorioGrupoFamiliar) : IManipuladorComando<GerarListaComprasComando, ListaComprasDto>
{
    public async Task<ErrorOr<ListaComprasDto>> ExecutarAsync(GerarListaComprasComando comando, CancellationToken ct = default)
    {
        var planosUsuario = await repositorioPlanoDieta.ObterPorUsuarioAsync(comando.UsuarioId, ct);

        var planosProcessados = planosUsuario
            .Where(p => p.Status == StatusPlanoDieta.Processado)
            .ToList();

        if (comando.Tipo == TipoListaCompras.Unificada && comando.GrupoFamiliarId.HasValue)
        {
            var idsMembros = await repositorioGrupoFamiliar.ObterIdsMembrosAsync(comando.GrupoFamiliarId.Value, ct);
            foreach (var membroId in idsMembros)
            {
                if (membroId != comando.UsuarioId)
                {
                    var planosMembro = await repositorioPlanoDieta.ObterPorUsuarioAsync(membroId, ct);
                    planosProcessados.AddRange(planosMembro.Where(p => p.Status == StatusPlanoDieta.Processado));
                }
            }
        }

        if (planosProcessados.Count == 0)
            return ErrosListaCompras.SemPlanoDieta;

        var lista = comando.Periodo == PeriodoCompras.Semanal
            ? ListaComprasEntity.CriarSemanal(comando.UsuarioId, comando.GrupoFamiliarId, comando.Tipo, comando.DataInicio)
            : ListaComprasEntity.CriarMensal(comando.UsuarioId, comando.GrupoFamiliarId, comando.Tipo, comando.DataInicio);

        var itensAgregados = new Dictionary<(string nome, UnidadeMedida unidade), decimal>();

        foreach (var plano in planosProcessados)
        {
            var diasNoPeriodo = FiltrarDiasNoPeriodo(plano.Dias, lista.DataInicio, lista.DataFim);

            foreach (var dia in diasNoPeriodo)
            {
                foreach (var refeicao in dia.Refeicoes)
                {
                    foreach (var item in refeicao.Itens)
                    {
                        var chave = (item.Nome.ToLowerInvariant(), item.Unidade);
                        if (itensAgregados.ContainsKey(chave))
                            itensAgregados[chave] += item.Quantidade;
                        else
                            itensAgregados[chave] = item.Quantidade;
                    }
                }
            }
        }

        foreach (var (chave, quantidade) in itensAgregados)
        {
            var (nome, unidade) = chave;
            var categoria = DetectarCategoria(nome);
            var item = DieTete.Domain.Entities.ItemListaCompras.Criar(nome, quantidade, unidade, categoria, lista.Id);
            lista.AdicionarItem(item);
        }

        await repositorioListaCompras.AdicionarAsync(lista, ct);
        await repositorioListaCompras.SalvarAlteracoesAsync(ct);

        return MapearParaDto(lista);
    }

    private static List<DiaDietaEntity> FiltrarDiasNoPeriodo(IReadOnlyList<DiaDietaEntity> dias, DateOnly inicio, DateOnly fim)
    {
        var diasFiltrados = new List<DiaDietaEntity>();

        foreach (var dia in dias)
        {
            if (dia.Data.HasValue)
            {
                if (dia.Data >= inicio && dia.Data <= fim)
                    diasFiltrados.Add(dia);
            }
            else if (dia.DiaDaSemana.HasValue)
            {
                diasFiltrados.Add(dia);
            }
        }

        return diasFiltrados;
    }

    private static CategoriaAlimento DetectarCategoria(string nome)
    {
        var nomeLower = nome.ToLowerInvariant();

        if (ContémPalavra(nomeLower, "frango", "carne", "atum", "ovo", "peixe", "tilápia", "salmão", "moída", "peito", "patinho", "alcatra"))
            return CategoriaAlimento.Proteina;

        if (ContémPalavra(nomeLower, "arroz", "macarrão", "batata", "pão", "tapioca", "aveia", "quinoa", "farinha", "milho"))
            return CategoriaAlimento.Carboidrato;

        if (ContémPalavra(nomeLower, "alface", "rúcula", "espinafre", "couve", "brócolis", "cenoura", "abobrinha", "chuchu", "tomate", "pepino", "cebola", "alho"))
            return CategoriaAlimento.Verdura;

        if (ContémPalavra(nomeLower, "banana", "maçã", "laranja", "mamão", "abacate", "morango", "uva", "melancia", "abacaxi"))
            return CategoriaAlimento.Fruta;

        if (ContémPalavra(nomeLower, "leite", "iogurte", "queijo", "requeijão", "cottage", "whey") && !nomeLower.Contains("suplemento"))
            return CategoriaAlimento.Laticinios;

        if (ContémPalavra(nomeLower, "azeite", "óleo", "manteiga", "castanha", "amendoim", "pasta"))
            return CategoriaAlimento.Gordura;

        if (ContémPalavra(nomeLower, "sal", "açúcar", "mel", "pimenta", "orégano", "limão", "vinagre", "shoyu", "molho"))
            return CategoriaAlimento.Tempero;

        if (ContémPalavra(nomeLower, "água", "suco", "chá", "café"))
            return CategoriaAlimento.Bebida;

        if (ContémPalavra(nomeLower, "whey", "creatina", "colágeno", "vitamina", "suplemento"))
            return CategoriaAlimento.Suplemento;

        return CategoriaAlimento.Outros;
    }

    private static bool ContémPalavra(string texto, params string[] palavras) =>
        palavras.Any(p => texto.Contains(p, StringComparison.OrdinalIgnoreCase));

    private static ListaComprasDto MapearParaDto(ListaComprasEntity lista)
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
