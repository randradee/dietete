using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace DieTete.Api.Middleware;

public class TratadorExcecoesGlobal(RequestDelegate proximo, ILogger<TratadorExcecoesGlobal> logger)
{
    public async Task InvokeAsync(HttpContext contexto)
    {
        try
        {
            await proximo(contexto);
        }
        catch (ValidationException ex)
        {
            logger.LogWarning("Erro de validação: {Erros}", string.Join(", ", ex.Errors.Select(e => e.ErrorMessage)));

            var detalheProblema = new ValidationProblemDetails(
                ex.Errors.GroupBy(e => e.PropertyName)
                         .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray()))
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Erro de validação"
            };

            contexto.Response.StatusCode = StatusCodes.Status400BadRequest;
            await contexto.Response.WriteAsJsonAsync(detalheProblema);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro inesperado");

            var detalheProblema = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Erro interno do servidor",
                Detail = "Ocorreu um erro inesperado. Tente novamente mais tarde."
            };

            contexto.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await contexto.Response.WriteAsJsonAsync(detalheProblema);
        }
    }
}
