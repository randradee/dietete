using DieTete.Application.Cqrs;
using DieTete.Application.ListaCompras.Commands.AtualizarItemLista;
using DieTete.Application.ListaCompras.Commands.GerarListaCompras;
using DieTete.Application.ListaCompras.Dtos;
using DieTete.Application.ListaCompras.Queries.ObterListaCompras;
using DieTete.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DieTete.Api.Controllers;

[Route("api/listas-compras")]
[Authorize]
public class ListaComprasController(IDispatcher dispatcher) : BaseController
{
    [HttpPost("gerar")]
    public async Task<IActionResult> Gerar(GerarListaComprasComando comando, CancellationToken ct)
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var comandoComUsuario = comando with { UsuarioId = usuarioId };

        var resultado = await dispatcher.EnviarAsync<GerarListaComprasComando, ListaComprasDto>(comandoComUsuario, ct);
        return resultado.Match(dto => Ok(dto), TratarErros);
    }

    [HttpGet]
    public async Task<IActionResult> Obter(
        [FromQuery] Guid? grupoFamiliarId,
        [FromQuery] PeriodoCompras? periodo,
        [FromQuery] TipoListaCompras? tipo,
        CancellationToken ct)
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var query = new ObterListaComprasQuery(usuarioId, grupoFamiliarId, periodo, tipo);
        var resultado = await dispatcher.ConsultarAsync<ObterListaComprasQuery, List<ListaComprasDto>>(query, ct);
        return resultado.Match(dtos => Ok(dtos), TratarErros);
    }

    [HttpPatch("{listaId}/itens/{itemId}")]
    public async Task<IActionResult> AtualizarItem(
        Guid listaId,
        Guid itemId,
        AtualizarItemListaComando comando,
        CancellationToken ct)
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var comandoAtualizado = comando with { ListaId = listaId, ItemId = itemId, UsuarioId = usuarioId };

        var resultado = await dispatcher.EnviarAsync<AtualizarItemListaComando, ItemListaComprasDto>(comandoAtualizado, ct);
        return resultado.Match(dto => Ok(dto), TratarErros);
    }
}
