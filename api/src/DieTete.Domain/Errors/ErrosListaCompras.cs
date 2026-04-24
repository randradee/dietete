using ErrorOr;

namespace DieTete.Domain.Errors;

public static class ErrosListaCompras
{
    public static readonly Error NaoEncontrada =
        Error.NotFound("ListaCompras.NaoEncontrada", "Lista de compras não encontrada.");

    public static readonly Error ItemNaoEncontrado =
        Error.NotFound("ListaCompras.ItemNaoEncontrado", "Item da lista não encontrado.");

    public static readonly Error SemPlanoDieta =
        Error.Validation("ListaCompras.SemPlanoDieta", "Nenhum plano de dieta processado encontrado para gerar a lista.");
}
