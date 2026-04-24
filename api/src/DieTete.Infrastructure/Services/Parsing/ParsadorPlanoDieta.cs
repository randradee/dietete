using System.Text.RegularExpressions;
using DieTete.Domain.Entities;
using DieTete.Domain.Enums;
using DieTete.Domain.Interfaces.Services;
using UglyToad.PdfPig;

namespace DieTete.Infrastructure.Services.Parsing;

public class ParsadorPlanoDieta : IParsadorPlanoDieta
{
    private static readonly Dictionary<string, UnidadeMedida> MapaUnidades = new(StringComparer.OrdinalIgnoreCase)
    {
        { "g", UnidadeMedida.Grama },
        { "gr", UnidadeMedida.Grama },
        { "grama", UnidadeMedida.Grama },
        { "gramas", UnidadeMedida.Grama },
        { "kg", UnidadeMedida.Quilograma },
        { "quilo", UnidadeMedida.Quilograma },
        { "quilograma", UnidadeMedida.Quilograma },
        { "quilogramas", UnidadeMedida.Quilograma },
        { "ml", UnidadeMedida.Mililitro },
        { "mililitro", UnidadeMedida.Mililitro },
        { "mililitros", UnidadeMedida.Mililitro },
        { "l", UnidadeMedida.Litro },
        { "litro", UnidadeMedida.Litro },
        { "litros", UnidadeMedida.Litro },
        { "un", UnidadeMedida.Unidade },
        { "und", UnidadeMedida.Unidade },
        { "unidade", UnidadeMedida.Unidade },
        { "unidades", UnidadeMedida.Unidade },
        { "uni", UnidadeMedida.Unidade },
        { "colher de sopa", UnidadeMedida.ColherDeSopa },
        { "c.s.", UnidadeMedida.ColherDeSopa },
        { "cs", UnidadeMedida.ColherDeSopa },
        { "col. sopa", UnidadeMedida.ColherDeSopa },
        { "colher de chá", UnidadeMedida.ColherDeCha },
        { "colher de cha", UnidadeMedida.ColherDeCha },
        { "c.c.", UnidadeMedida.ColherDeCha },
        { "cc", UnidadeMedida.ColherDeCha },
        { "col. chá", UnidadeMedida.ColherDeCha },
        { "xícara", UnidadeMedida.Xicara },
        { "xicara", UnidadeMedida.Xicara },
        { "xic", UnidadeMedida.Xicara },
        { "fatia", UnidadeMedida.Fatia },
        { "fatias", UnidadeMedida.Fatia },
        { "porção", UnidadeMedida.Porcao },
        { "porcao", UnidadeMedida.Porcao },
        { "porcoes", UnidadeMedida.Porcao },
        { "porcão", UnidadeMedida.Porcao },
        { "colher", UnidadeMedida.Colher },
        { "col", UnidadeMedida.Colher }
    };

    private static readonly Dictionary<string, TipoRefeicao> MapaRefeicoes = new(StringComparer.OrdinalIgnoreCase)
    {
        { "CAFÉ DA MANHÃ", TipoRefeicao.CafeDaManha },
        { "CAFÉ DA MANHA", TipoRefeicao.CafeDaManha },
        { "CAFE DA MANHA", TipoRefeicao.CafeDaManha },
        { "DESJEJUM", TipoRefeicao.CafeDaManha },
        { "LANCHE DA MANHÃ", TipoRefeicao.LancheDaManha },
        { "LANCHE DA MANHA", TipoRefeicao.LancheDaManha },
        { "LANCHE MANHÃ", TipoRefeicao.LancheDaManha },
        { "LANCHE MANHA", TipoRefeicao.LancheDaManha },
        { "COLAÇÃO", TipoRefeicao.LancheDaManha },
        { "ALMOÇO", TipoRefeicao.Almoco },
        { "ALMOCO", TipoRefeicao.Almoco },
        { "LANCHE DA TARDE", TipoRefeicao.LancheDaTarde },
        { "LANCHE TARDE", TipoRefeicao.LancheDaTarde },
        { "LANCHE", TipoRefeicao.LancheDaTarde },
        { "JANTAR", TipoRefeicao.Jantar },
        { "CEIA", TipoRefeicao.Ceia }
    };

    public async Task<ResultadoParsing> ParsearAsync(Stream pdfStream, CancellationToken ct = default)
    {
        try
        {
            if (pdfStream == null || pdfStream.Length == 0)
                return new ResultadoParsing([], 0, 0, false, "Stream PDF inválido ou vazio.");

            // Extrair texto do PDF
            string textoPdf = ExtrairTextoDoPdf(pdfStream);

            if (string.IsNullOrWhiteSpace(textoPdf))
                return new ResultadoParsing([], 0, 0, false, "Nenhum texto foi extraído do PDF.");

            // Parsear refeições
            var dias = ParsearRefeicoes(textoPdf);

            if (dias.Count == 0)
                return new ResultadoParsing([], 0, 0, false, "Nenhuma refeição foi detectada no PDF.");

            // Contar itens e itens sem confiança
            int totalItens = dias.SelectMany(d => d.Refeicoes).SelectMany(r => r.Itens).Count();
            int itensSemConfianca = dias.SelectMany(d => d.Refeicoes).SelectMany(r => r.Itens)
                .Count(i => i.PontuacaoConfianca < 0.5);

            return new ResultadoParsing(dias, totalItens, itensSemConfianca, true);
        }
        catch (Exception ex)
        {
            return new ResultadoParsing([], 0, 0, false, $"Erro ao processar PDF: {ex.Message}");
        }
    }

    private string ExtrairTextoDoPdf(Stream pdfStream)
    {
        using var document = PdfDocument.Open(pdfStream);
        var textBuilder = new System.Text.StringBuilder();

        foreach (var pagina in document.GetPages())
        {
            var texto = pagina.Text;
            textBuilder.AppendLine(texto);
        }

        return textBuilder.ToString();
    }

    private List<DiaDieta> ParsearRefeicoes(string texto)
    {
        var dias = new List<DiaDieta>();
        var planoDietaId = Guid.Empty;

        // Criar um dia padrão (segunda-feira)
        var diaAtual = DiaDieta.CriarPorDiaDaSemana(planoDietaId, DayOfWeek.Monday, 1);

        // Padrões regex para detectar seções de refeição
        var linhas = texto.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);

        TipoRefeicao? tipoRefeicaoAtual = null;

        foreach (var linha in linhas)
        {
            var linhaLimpa = linha.Trim();

            if (string.IsNullOrWhiteSpace(linhaLimpa))
                continue;

            // Verificar se é um cabeçalho de refeição
            var tipoRefeicao = DetectarTipoRefeicao(linhaLimpa);

            if (tipoRefeicao.HasValue)
            {
                tipoRefeicaoAtual = tipoRefeicao;
                continue;
            }

            // Se temos uma refeição ativa, tentar parsear como alimento
            if (tipoRefeicaoAtual.HasValue)
            {
                var item = ParsearItem(linhaLimpa, planoDietaId, diaAtual, tipoRefeicaoAtual.Value);
                if (item != null)
                {
                    // Verificar se já existe uma refeição deste tipo no dia atual
                    var refeicaoExistente = diaAtual.Refeicoes.FirstOrDefault(r => r.Tipo == tipoRefeicaoAtual.Value);

                    if (refeicaoExistente == null)
                    {
                        var novaRefeicao = Refeicao.Criar(tipoRefeicaoAtual.Value, diaAtual.Id);
                        diaAtual.AdicionarRefeicao(novaRefeicao);
                        refeicaoExistente = novaRefeicao;
                    }

                    refeicaoExistente.AdicionarItem(item);
                }
            }
        }

        // Adicionar o dia ao resultado
        if (diaAtual.Refeicoes.Count > 0)
        {
            dias.Add(diaAtual);
        }

        return dias;
    }

    private TipoRefeicao? DetectarTipoRefeicao(string linha)
    {
        var linhaUpper = linha.ToUpperInvariant();

        foreach (var (chave, tipo) in MapaRefeicoes)
        {
            if (linhaUpper.Contains(chave.ToUpperInvariant()))
            {
                return tipo;
            }
        }

        return null;
    }

    private ItemAlimento? ParsearItem(string linha, Guid planoDietaId, DiaDieta dia, TipoRefeicao tipo)
    {
        if (string.IsNullOrWhiteSpace(linha) || linha.Length < 2)
            return null;

        // Padrão: <quantidade> <unidade> de <alimento> ou <quantidade><unidade> <alimento>
        var padraoComDe = new Regex(@"^([\d,\.]+)\s*([a-záàâãéèêíïóôõöúçñ\.\s]+?)\s+de\s+(.+)$", RegexOptions.IgnoreCase);
        var padraoSemDe = new Regex(@"^([\d,\.]+)\s*([a-záàâãéèêíïóôõöúçñ\.\s]*?)\s+(.+)$", RegexOptions.IgnoreCase);
        var padraomento = new Regex(@"^([a-záàâãéèêíïóôõöúçñ\s\d,\.]+)$", RegexOptions.IgnoreCase);

        // Tentar padrão "quantidade unidade de alimento"
        var matchComDe = padraoComDe.Match(linha);
        if (matchComDe.Success)
        {
            if (decimal.TryParse(matchComDe.Groups[1].Value.Replace(',', '.'), out var quantidade))
            {
                var unidadeStr = matchComDe.Groups[2].Value.Trim();
                var nomeAlimento = matchComDe.Groups[3].Value.Trim();

                var unidade = ResolverUnidade(unidadeStr);
                var confianca = (unidade != UnidadeMedida.Desconhecida) ? 1.0 : 0.7;

                return CriarItemAlimento(nomeAlimento, quantidade, unidade, confianca, dia, tipo);
            }
        }

        // Tentar padrão "quantidade unidade alimento"
        var matchSemDe = padraoSemDe.Match(linha);
        if (matchSemDe.Success)
        {
            if (decimal.TryParse(matchSemDe.Groups[1].Value.Replace(',', '.'), out var quantidade))
            {
                var unidadeStr = matchSemDe.Groups[2].Value.Trim();
                var nomeAlimento = matchSemDe.Groups[3].Value.Trim();

                // Verificar se unidadeStr realmente é uma unidade
                var unidade = ResolverUnidade(unidadeStr);

                if (unidade != UnidadeMedida.Desconhecida && !string.IsNullOrWhiteSpace(nomeAlimento))
                {
                    return CriarItemAlimento(nomeAlimento, quantidade, unidade, 1.0, dia, tipo);
                }
                else if (string.IsNullOrWhiteSpace(unidadeStr))
                {
                    // Se não houver unidade, tratar tudo como nome
                    nomeAlimento = (unidadeStr + " " + nomeAlimento).Trim();
                    return CriarItemAlimento(nomeAlimento, quantidade, UnidadeMedida.Desconhecida, 0.7, dia, tipo);
                }
                else
                {
                    // Se unidade não reconhecida, colocar tudo no nome
                    nomeAlimento = (unidadeStr + " " + nomeAlimento).Trim();
                    return CriarItemAlimento(nomeAlimento, quantidade, UnidadeMedida.Desconhecida, 0.7, dia, tipo);
                }
            }
        }

        // Padrão: só nome (sem quantidade)
        if (padraomento.IsMatch(linha) && !Regex.IsMatch(linha, @"^\d+[\d,\.\s]*$"))
        {
            return CriarItemAlimento(linha, 1, UnidadeMedida.Unidade, 0.3, dia, tipo);
        }

        return null;
    }

    private UnidadeMedida ResolverUnidade(string unidadeStr)
    {
        if (string.IsNullOrWhiteSpace(unidadeStr))
            return UnidadeMedida.Desconhecida;

        var unidadeLimpa = unidadeStr.Trim();

        // Tentar match exato
        if (MapaUnidades.TryGetValue(unidadeLimpa, out var unidade))
            return unidade;

        // Tentar match parcial (para casos como "colher de sopa" em "colherdesopa")
        foreach (var (chave, valor) in MapaUnidades)
        {
            if (unidadeLimpa.Contains(chave, StringComparison.OrdinalIgnoreCase))
                return valor;
        }

        return UnidadeMedida.Desconhecida;
    }

    private ItemAlimento CriarItemAlimento(string nome, decimal quantidade, UnidadeMedida unidade, double confianca, DiaDieta dia, TipoRefeicao tipo)
    {
        // Garantir que haja uma refeição deste tipo
        var refeicao = dia.Refeicoes.FirstOrDefault(r => r.Tipo == tipo);
        if (refeicao == null)
        {
            refeicao = Refeicao.Criar(tipo, dia.Id);
            dia.AdicionarRefeicao(refeicao);
        }

        return ItemAlimento.Criar(nome, quantidade, unidade, confianca, refeicao.Id);
    }
}
