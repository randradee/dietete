namespace DieTete.Application.ListaCompras.Dtos;

public record ListaComprasDto(
    Guid Id,
    string Periodo,
    string Tipo,
    DateOnly DataInicio,
    DateOnly DataFim,
    List<ItemListaComprasDto> Itens);
