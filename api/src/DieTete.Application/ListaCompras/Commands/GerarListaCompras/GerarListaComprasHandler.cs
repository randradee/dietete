using DieTete.Application.ListaCompras.Dtos;
using DieTete.Domain.Enums;
using DieTete.Domain.Errors;
using DieTete.Domain.Interfaces.Repositories;
using ErrorOr;
using MediatR;
using ListaComprasEntity = DieTete.Domain.Entities.ListaCompras;
using DiaDietaEntity = DieTete.Domain.Entities.DiaDieta;

namespace DieTete.Application.ListaCompras.Commands.GerarListaCompras;

public class GerarListaComprasHandler(
    IPlanoDietaRepositorio repositorioPlanoDieta,
    IListaComprasRepositorio repositorioListaCompras,
    IGrupoFamiliarRepositorio repositorioGrupoFamiliar) : IRequestHandler<GerarListaComprasComando, ErrorOr<ListaComprasDto>>
{
    public async Task<ErrorOr<ListaComprasDto>> Handle(GerarListaComprasComando request, CancellationToken ct)
    {
        // Buscar planos do usuário
        var planosUsuario = await repositorioPlanoDieta.ObterPorUsuarioAsync(request.UsuarioId, ct);

        // Filtrar planos processados
        var planosProcessados = planosUsuario
            .Where(p => p.Status == StatusPlanoDieta.Processado)
            .ToList();

        // Se tem tipo unificada e grupo familiar, buscar também planos do cônjuge
        if (request.Tipo == TipoListaCompras.Unificada && request.GrupoFamiliarId.HasValue)
        {
            var grupo = await repositorioGrupoFamiliar.ObterPorIdAsync(request.GrupoFamiliarId.Value, ct);
            if (grupo is not null)
            {
                foreach (var membro in grupo.Membros)
                {
                    if (membro.Id != request.UsuarioId)
                    {
                        var planosMembro = await repositorioPlanoDieta.ObterPorUsuarioAsync(membro.Id, ct);
                        var planosMembroProcessados = planosMembro
                            .Where(p => p.Status == StatusPlanoDieta.Processado)
                            .ToList();
                        planosProcessados.AddRange(planosMembroProcessados);
                    }
                }
            }
        }

        if (planosProcessados.Count == 0)
        {
            return ErrosListaCompras.SemPlanoDieta;
        }

        // Criar lista de compras
        var lista = request.Periodo == PeriodoCompras.Semanal
            ? ListaComprasEntity.CriarSemanal(request.UsuarioId, request.GrupoFamiliarId, request.Tipo, request.DataInicio)
            : ListaComprasEntity.CriarMensal(request.UsuarioId, request.GrupoFamiliarId, request.Tipo, request.DataInicio);

        // Agregar itens de alimento
        var itensAgregados = new Dictionary<(string nome, UnidadeMedida unidade), decimal>();

        foreach (var plano in planosProcessados)
        {
            var diasNoPeríodo = FiltrarDiasNoPeriodo(plano.Dias, lista.DataInicio, lista.DataFim);

            foreach (var dia in diasNoPeríodo)
            {
                foreach (var refeicao in dia.Refeicoes)
                {
                    foreach (var item in refeicao.Itens)
                    {
                        var chave = (item.Nome.ToLowerInvariant(), item.Unidade);
                        if (itensAgregados.ContainsKey(chave))
                        {
                            itensAgregados[chave] += item.Quantidade;
                        }
                        else
                        {
                            itensAgregados[chave] = item.Quantidade;
                        }
                    }
                }
            }
        }

        // Criar itens de lista a partir dos itens agregados
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
            // Se tem data específica, verificar se está no período
            if (dia.Data.HasValue)
            {
                if (dia.Data >= inicio && dia.Data <= fim)
                {
                    diasFiltrados.Add(dia);
                }
            }
            // Se tem dia da semana, incluir (assumindo semana recorrente)
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

        // Proteína
        if (ContémPalavra(nomeLower, "frango", "carne", "atum", "ovo", "peixe", "tilápia", "salmão", "moída", "peito", "patinho", "alcatra"))
            return CategoriaAlimento.Proteina;

        // Carboidrato
        if (ContémPalavra(nomeLower, "arroz", "macarrão", "batata", "pão", "tapioca", "aveia", "quinoa", "farinha", "milho"))
            return CategoriaAlimento.Carboidrato;

        // Verdura
        if (ContémPalavra(nomeLower, "alface", "rúcula", "espinafre", "couve", "brócolis", "cenoura", "abobrinha", "chuchu", "tomate", "pepino", "cebola", "alho"))
            return CategoriaAlimento.Verdura;

        // Fruta
        if (ContémPalavra(nomeLower, "banana", "maçã", "laranja", "mamão", "abacate", "morango", "uva", "melancia", "abacaxi"))
            return CategoriaAlimento.Fruta;

        // Laticínios
        if (ContémPalavra(nomeLower, "leite", "iogurte", "queijo", "requeijão", "cottage", "whey") && !nomeLower.Contains("suplemento"))
            return CategoriaAlimento.Laticinios;

        // Gordura
        if (ContémPalavra(nomeLower, "azeite", "óleo", "manteiga", "castanha", "amendoim", "pasta"))
            return CategoriaAlimento.Gordura;

        // Tempero
        if (ContémPalavra(nomeLower, "sal", "açúcar", "mel", "pimenta", "orégano", "limão", "vinagre", "shoyu", "molho"))
            return CategoriaAlimento.Tempero;

        // Bebida
        if (ContémPalavra(nomeLower, "água", "suco", "chá", "café"))
            return CategoriaAlimento.Bebida;

        // Suplemento
        if (ContémPalavra(nomeLower, "whey", "creatina", "colágeno", "vitamina", "suplemento"))
            return CategoriaAlimento.Suplemento;

        return CategoriaAlimento.Outros;
    }

    private static bool ContémPalavra(string texto, params string[] palavras)
    {
        return palavras.Any(p => texto.Contains(p, StringComparison.OrdinalIgnoreCase));
    }

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
            Itens: itens
        );
    }
}
