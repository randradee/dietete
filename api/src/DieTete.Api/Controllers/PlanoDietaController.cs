using DieTete.Application.PlanoDieta.Commands.EnviarPlanoDieta;
using DieTete.Application.PlanoDieta.Queries.ObterPlanoDieta;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DieTete.Api.Controllers;

[Route("api/planos-dieta")]
[Authorize]
public class PlanoDietaController(IMediator mediator) : BaseController
{
    [HttpPost]
    public async Task<IActionResult> Enviar(IFormFile arquivo, CancellationToken ct)
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        if (arquivo is null || arquivo.Length == 0)
        {
            return BadRequest("Arquivo não fornecido.");
        }

        using var stream = arquivo.OpenReadStream();
        var comando = new EnviarPlanoDietaComando(
            UsuarioId: usuarioId,
            ConteudoPdf: stream,
            NomeArquivo: arquivo.FileName,
            TamanhoBytes: arquivo.Length
        );

        var resultado = await mediator.Send(comando, ct);
        return resultado.Match(dto => Ok(dto), TratarErros);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObterPorId(Guid id, CancellationToken ct)
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var query = new ObterPlanoDietaQuery(id, usuarioId);
        var resultado = await mediator.Send(query, ct);
        return resultado.Match(dto => Ok(dto), TratarErros);
    }
}
