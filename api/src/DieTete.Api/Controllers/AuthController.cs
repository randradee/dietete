using DieTete.Application.Auth.Commands.AtualizarToken;
using DieTete.Application.Auth.Commands.Entrar;
using DieTete.Application.Auth.Commands.Registrar;
using DieTete.Application.Auth.Dtos;
using DieTete.Application.Cqrs;
using Microsoft.AspNetCore.Mvc;

namespace DieTete.Api.Controllers;

[Route("api/auth")]
public class AuthController(IDispatcher dispatcher) : BaseController
{
    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar(RegistrarComando comando, CancellationToken ct)
    {
        var resultado = await dispatcher.EnviarAsync<RegistrarComando, RespostaAutenticacao>(comando, ct);
        return resultado.Match(resposta => Ok(resposta), TratarErros);
    }

    [HttpPost("entrar")]
    public async Task<IActionResult> Entrar(EntrarComando comando, CancellationToken ct)
    {
        var resultado = await dispatcher.EnviarAsync<EntrarComando, RespostaAutenticacao>(comando, ct);
        return resultado.Match(resposta => Ok(resposta), TratarErros);
    }

    [HttpPost("atualizar-token")]
    public async Task<IActionResult> AtualizarToken(AtualizarTokenComando comando, CancellationToken ct)
    {
        var resultado = await dispatcher.EnviarAsync<AtualizarTokenComando, RespostaAutenticacao>(comando, ct);
        return resultado.Match(resposta => Ok(resposta), TratarErros);
    }
}
