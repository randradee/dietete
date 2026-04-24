namespace DieTete.Application.ListaCompras.Dtos;

public record ItemListaComprasDto(
    Guid Id,
    string Nome,
    decimal QuantidadeTotal,
    string Unidade,
    string Categoria,
    bool EditadoManualmente,
    decimal? PrecoEstimado);
