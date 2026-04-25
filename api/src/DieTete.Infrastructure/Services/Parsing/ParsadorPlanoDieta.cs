using System.Text.RegularExpressions;
using DieTete.Domain.Entities;
using DieTete.Domain.Enums;
using DieTete.Domain.Interfaces.Services;
using UglyToad.PdfPig;

namespace DieTete.Infrastructure.Services.Parsing;

public class ParsadorPlanoDieta : IParsadorPlanoDieta
{
    // HH:MM - Nome da Refeição  (sem "Opção N" no final)
    private static readonly Regex RegexCabecalho =
        new(@"^(\d{2}:\d{2})\s*-\s*(.+?)(\s*[-\(]\s*[Oo]p[çc][aã]o\s*\d+\)?\s*)?$", RegexOptions.Compiled);

    // "Nome 200g" ou "Nome 150ml"
    private static readonly Regex RegexPesoDirecto =
        new(@"^(.+?)\s+(\d+[\d,\.]*)\s*(g|kg|ml|l)\s*$", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    // "Nome 2 Fatia(s) (50g)" ou "Nome 1 Colher(es) de sopa rasa(s) (8ml)"
    private static readonly Regex RegexQtdeUnidadePeso =
        new(@"^(.+?)\s+(\d+[\d,\.]*)\s+(.+?)\s+\((\d+[\d,\.]*)\s*(g|ml)\)$", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Dictionary<string, UnidadeMedida> MapaUnidades = new(StringComparer.OrdinalIgnoreCase)
    {
        { "g", UnidadeMedida.Grama },
        { "gr", UnidadeMedida.Grama },
        { "grama", UnidadeMedida.Grama },
        { "gramas", UnidadeMedida.Grama },
        { "kg", UnidadeMedida.Quilograma },
        { "quilograma", UnidadeMedida.Quilograma },
        { "ml", UnidadeMedida.Mililitro },
        { "mililitro", UnidadeMedida.Mililitro },
        { "l", UnidadeMedida.Litro },
        { "litro", UnidadeMedida.Litro },
        { "un", UnidadeMedida.Unidade },
        { "unidade", UnidadeMedida.Unidade },
        { "unidades", UnidadeMedida.Unidade },
        { "medidor", UnidadeMedida.Unidade },
        { "colher de sopa", UnidadeMedida.ColherDeSopa },
        { "col. sopa", UnidadeMedida.ColherDeSopa },
        { "colher de chá", UnidadeMedida.ColherDeCha },
        { "colher de cha", UnidadeMedida.ColherDeCha },
        { "xícara", UnidadeMedida.Xicara },
        { "xicara", UnidadeMedida.Xicara },
        { "fatia", UnidadeMedida.Fatia },
        { "fatias", UnidadeMedida.Fatia },
        { "porção", UnidadeMedida.Porcao },
        { "porcao", UnidadeMedida.Porcao },
        { "colher", UnidadeMedida.Colher },
    };

    private static readonly Dictionary<string, TipoRefeicao> MapaRefeicoes = new(StringComparer.OrdinalIgnoreCase)
    {
        { "Pré treino", TipoRefeicao.CafeDaManha },
        { "Pre treino", TipoRefeicao.CafeDaManha },
        { "Café-da-manhã", TipoRefeicao.CafeDaManha },
        { "Café da manhã", TipoRefeicao.CafeDaManha },
        { "Cafe da manha", TipoRefeicao.CafeDaManha },
        { "Desjejum", TipoRefeicao.CafeDaManha },
        { "Lanche da manhã", TipoRefeicao.LancheDaManha },
        { "Colação", TipoRefeicao.LancheDaManha },
        { "Almoço", TipoRefeicao.Almoco },
        { "Almoco", TipoRefeicao.Almoco },
        { "Lanche da tarde", TipoRefeicao.LancheDaTarde },
        { "Lanche", TipoRefeicao.LancheDaTarde },
        { "Jantar", TipoRefeicao.Jantar },
        { "Ceia", TipoRefeicao.Ceia },
    };

    public async Task<ResultadoParsing> ParsearAsync(Stream pdfStream, CancellationToken ct = default)
    {
        try
        {
            if (pdfStream == null || pdfStream.Length == 0)
                return new ResultadoParsing([], 0, 0, false, "Stream PDF inválido ou vazio.");

            var texto = ExtrairTextoDoPdf(pdfStream);

            if (string.IsNullOrWhiteSpace(texto))
                return new ResultadoParsing([], 0, 0, false, "Nenhum texto foi extraído do PDF.");

            var dias = ParsearRefeicoes(texto);

            if (dias.Count == 0)
                return new ResultadoParsing([], 0, 0, false, "Nenhuma refeição foi detectada no PDF.");

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

    private static string ExtrairTextoDoPdf(Stream pdfStream)
    {
        using var document = PdfDocument.Open(pdfStream);
        var sb = new System.Text.StringBuilder();

        foreach (var pagina in document.GetPages())
        {
            var palavras = pagina.GetWords()
                .OrderByDescending(w => w.BoundingBox.Bottom)
                .ThenBy(w => w.BoundingBox.Left)
                .ToList();

            if (palavras.Count == 0)
                continue;

            const double tolerancia = 4.0;
            var linhas = new List<List<UglyToad.PdfPig.Content.Word>>();
            var linhaAtual = new List<UglyToad.PdfPig.Content.Word> { palavras[0] };
            double yAtual = palavras[0].BoundingBox.Bottom;

            for (int i = 1; i < palavras.Count; i++)
            {
                var p = palavras[i];
                if (Math.Abs(p.BoundingBox.Bottom - yAtual) > tolerancia)
                {
                    linhas.Add(linhaAtual);
                    linhaAtual = [];
                    yAtual = p.BoundingBox.Bottom;
                }
                linhaAtual.Add(p);
            }
            linhas.Add(linhaAtual);

            foreach (var linha in linhas)
                sb.AppendLine(string.Join(" ", linha.Select(p => p.Text)));
        }

        return sb.ToString();
    }

    private static List<DiaDieta> ParsearRefeicoes(string texto)
    {
        var diaAtual = DiaDieta.CriarPorDiaDaSemana(Guid.Empty, DayOfWeek.Monday, 1);
        TipoRefeicao? tipoAtual = null;
        bool emSecaoIgnorada = false;
        bool emRelatorio = false;

        var linhas = texto.Split(["\r\n", "\r", "\n"], StringSplitOptions.None);

        foreach (var linha in linhas)
        {
            var l = linha.Trim();
            if (string.IsNullOrWhiteSpace(l)) continue;

            // Página de relatório de nutrientes — ignorar o resto
            if (l.StartsWith("Relatório de nutrientes", StringComparison.OrdinalIgnoreCase))
            {
                emRelatorio = true;
                continue;
            }
            if (emRelatorio) continue;

            // Linhas de rodapé/cabeçalho estrutural
            if (EhLinhaEstrutura(l)) continue;

            // Início de seções a ignorar dentro de uma refeição
            if (l.StartsWith("Observações", StringComparison.OrdinalIgnoreCase) ||
                l.StartsWith("Obs:", StringComparison.OrdinalIgnoreCase) ||
                l.StartsWith("•", StringComparison.Ordinal))
            {
                emSecaoIgnorada = true;
                continue;
            }

            // Detectar cabeçalho de refeição HH:MM - Nome
            var tipoDetectado = DetectarCabecalho(l);
            if (tipoDetectado.HasValue)
            {
                tipoAtual = tipoDetectado.Value;
                emSecaoIgnorada = false;
                continue;
            }

            // Se for cabeçalho de opção alternativa (Opção 2), ignorar essa seção
            if (EhCabecalhoOpcaoAlternativa(l))
            {
                tipoAtual = null;
                emSecaoIgnorada = false;
                continue;
            }

            if (emSecaoIgnorada || tipoAtual is null) continue;

            var item = TentarParsearItem(l);
            if (item is null) continue;

            var refeicao = diaAtual.Refeicoes.FirstOrDefault(r => r.Tipo == tipoAtual.Value);
            if (refeicao is null)
            {
                refeicao = Refeicao.Criar(tipoAtual.Value, diaAtual.Id);
                diaAtual.AdicionarRefeicao(refeicao);
            }
            refeicao.AdicionarItem(item);
        }

        return diaAtual.Refeicoes.Count > 0 ? [diaAtual] : [];
    }

    private static bool EhLinhaEstrutura(string l) =>
        l.StartsWith("Nutricionista", StringComparison.OrdinalIgnoreCase) ||
        l.StartsWith("Página", StringComparison.OrdinalIgnoreCase) ||
        l.StartsWith("Planejamento", StringComparison.OrdinalIgnoreCase) ||
        l.StartsWith("Orientação", StringComparison.OrdinalIgnoreCase) ||
        l.StartsWith("Metas", StringComparison.OrdinalIgnoreCase) ||
        (l.StartsWith("- ") && l.Length > 2 && !char.IsDigit(l[2])) || // bullet de metas
        Regex.IsMatch(l, @"^[A-Z][a-záàâãéèêíïóôõöúçñ]+(\s+[A-Z][a-záàâãéèêíïóôõöúçñ]+){1,4}$"); // nome próprio isolado (rodapé quebrado)

    private static bool EhCabecalhoOpcaoAlternativa(string l)
    {
        var m = RegexCabecalho.Match(l);
        if (!m.Success) return false;
        // Tem "(Opção N)" ou "- Opção N" no grupo 3
        return !string.IsNullOrWhiteSpace(m.Groups[3].Value);
    }

    private static TipoRefeicao? DetectarCabecalho(string linha)
    {
        var m = RegexCabecalho.Match(linha);
        if (!m.Success) return null;
        if (!string.IsNullOrWhiteSpace(m.Groups[3].Value)) return null; // opção alternativa

        var nome = m.Groups[2].Value.Trim();

        foreach (var (chave, tipo) in MapaRefeicoes)
        {
            if (nome.Contains(chave, StringComparison.OrdinalIgnoreCase))
                return tipo;
        }
        return null;
    }

    private static ItemAlimento? TentarParsearItem(string linha)
    {
        // Ignorar "À vontade"
        if (linha.Contains("vontade", StringComparison.OrdinalIgnoreCase)) return null;

        // Padrão 1: "Nome QTDE Unidade(s) (PESOg)" — ex: "Pão integral 1 Fatia(s) (25g)"
        var m1 = RegexQtdeUnidadePeso.Match(linha);
        if (m1.Success &&
            decimal.TryParse(m1.Groups[2].Value.Replace(',', '.'), System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var qtde1) &&
            decimal.TryParse(m1.Groups[4].Value.Replace(',', '.'), System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out _))
        {
            var nome = LimparNome(m1.Groups[1].Value);
            var unidadeDisplay = m1.Groups[3].Value.Trim();
            var unidade = ResolverUnidadeDisplay(unidadeDisplay);
            return ItemAlimento.Criar(nome, qtde1, unidade, 1.0, Guid.Empty);
        }

        // Padrão 2: "Nome 200g" ou "Nome 150ml" — ex: "Arroz branco cozido 200g"
        var m2 = RegexPesoDirecto.Match(linha);
        if (m2.Success &&
            decimal.TryParse(m2.Groups[2].Value.Replace(',', '.'), System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var qtde2))
        {
            var nome = LimparNome(m2.Groups[1].Value);
            var unidade = ResolverUnidadeSigla(m2.Groups[3].Value);
            return ItemAlimento.Criar(nome, qtde2, unidade, 1.0, Guid.Empty);
        }

        return null;
    }

    private static string LimparNome(string nome) =>
        Regex.Replace(nome.Trim(), @"\s+", " ");

    private static UnidadeMedida ResolverUnidadeSigla(string sigla) => sigla.ToLowerInvariant() switch
    {
        "g" => UnidadeMedida.Grama,
        "kg" => UnidadeMedida.Quilograma,
        "ml" => UnidadeMedida.Mililitro,
        "l" => UnidadeMedida.Litro,
        _ => UnidadeMedida.Desconhecida,
    };

    private static UnidadeMedida ResolverUnidadeDisplay(string display)
    {
        var d = display.ToLowerInvariant();

        if (d.Contains("sopa")) return UnidadeMedida.ColherDeSopa;
        if (d.Contains("chá") || d.Contains("cha")) return UnidadeMedida.ColherDeCha;
        if (d.Contains("xíc") || d.Contains("xic")) return UnidadeMedida.Xicara;
        if (d.Contains("fatia")) return UnidadeMedida.Fatia;
        if (d.Contains("porç") || d.Contains("porc")) return UnidadeMedida.Porcao;
        if (d.Contains("colher")) return UnidadeMedida.Colher;
        if (d.Contains("ml")) return UnidadeMedida.Mililitro;
        if (d.Contains("unidade") || d.Contains("medidor")) return UnidadeMedida.Unidade;

        foreach (var (chave, valor) in MapaUnidades)
            if (d.Contains(chave)) return valor;

        return UnidadeMedida.Unidade;
    }
}
