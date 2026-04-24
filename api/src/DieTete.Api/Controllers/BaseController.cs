using ErrorOr;
using Microsoft.AspNetCore.Mvc;

namespace DieTete.Api.Controllers;

[ApiController]
public abstract class BaseController : ControllerBase
{
    protected IActionResult TratarErros(List<Error> erros)
    {
        if (erros.All(e => e.Type == ErrorType.Validation))
        {
            var detalhesValidacao = new ValidationProblemDetails(
                erros.GroupBy(e => e.Code)
                     .ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray()));
            return ValidationProblem(detalhesValidacao);
        }

        var primeiroeErro = erros.First();
        var statusCode = primeiroeErro.Type switch
        {
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError
        };

        return Problem(title: primeiroeErro.Description, statusCode: statusCode, detail: primeiroeErro.Code);
    }
}
