using System.Text.RegularExpressions;
using DieTete.Domain.Entities;
using DieTete.Domain.Interfaces.Repositories;
using DieTete.Domain.Interfaces.Services;
using HtmlAgilityPack;

namespace DieTete.Infrastructure.Services.Pricing;

public class ScraperPrecosDaHora(HttpClient httpClient, IPrecoItemRepositorio repositorio) : IConsultaPrecos
{
    private const string SiteUrl = "https://precodahora.ba.gov.br/products/";
    private const int TimeoutSegundos = 10;
    private readonly Regex _precoRegex = new(@"R\$\s*(\d+[.,]\d{2})", RegexOptions.Compiled);

    public async Task<decimal?> ConsultarPrecoMedioAsync(string nomeItem, CancellationToken ct = default)
    {
        try
        {
            // 1. Verificar cache
            var precoEmCache = await repositorio.ObterMaisRecenteAsync(nomeItem, ct);
            if (precoEmCache is not null && !precoEmCache.Expirado)
            {
                return precoEmCache.Preco;
            }

            // 2. Fazer scraping
            var precoMedio = await FazerScrapingAsync(nomeItem, ct);

            // 3. Salvar no cache se encontrou preço
            if (precoMedio.HasValue)
            {
                var novoPreco = PrecoItem.Criar(nomeItem, precoMedio.Value, "precodahora.ba.gov.br");
                await repositorio.AdicionarAsync(novoPreco, ct);
                await repositorio.SalvarAlteracoesAsync(ct);
            }

            return precoMedio;
        }
        catch
        {
            // Falhar silenciosamente (site indisponível, timeout, etc)
            return null;
        }
    }

    private async Task<decimal?> FazerScrapingAsync(string nomeItem, CancellationToken ct)
    {
        // Configurar timeout
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(TimeSpan.FromSeconds(TimeoutSegundos));

        // GET com headers
        var url = $"{SiteUrl}?q={Uri.EscapeDataString(nomeItem)}";
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        request.Headers.Add("Accept", "text/html,application/xhtml+xml");
        request.Headers.Add("Accept-Language", "pt-BR,pt;q=0.9");

        var response = await httpClient.SendAsync(request, cts.Token);
        response.EnsureSuccessStatusCode();

        var html = await response.Content.ReadAsStringAsync(cts.Token);

        // Parsear HTML
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        // Extrair preços
        var precos = new List<decimal>();
        var nodes = doc.DocumentNode.SelectNodes("//*[text()]");

        if (nodes is not null)
        {
            foreach (var node in nodes)
            {
                var texto = node.InnerText;
                var matches = _precoRegex.Matches(texto);

                foreach (Match match in matches)
                {
                    var valorStr = match.Groups[1].Value.Replace(',', '.');
                    if (decimal.TryParse(valorStr, System.Globalization.CultureInfo.InvariantCulture, out var preco))
                    {
                        precos.Add(preco);
                    }
                }
            }
        }

        // Retornar mediana se encontrou preços
        if (precos.Count == 0)
            return null;

        precos.Sort();
        var mediana = precos.Count % 2 == 0
            ? (precos[precos.Count / 2 - 1] + precos[precos.Count / 2]) / 2
            : precos[precos.Count / 2];

        return mediana;
    }
}
