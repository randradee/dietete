using DieTete.Application.PlanoDieta.Dtos;
using ErrorOr;
using MediatR;

namespace DieTete.Application.PlanoDieta.Commands.EnviarPlanoDieta;

public record EnviarPlanoDietaComando(
    Guid UsuarioId,
    Stream ConteudoPdf,
    string NomeArquivo,
    long TamanhoBytes) : IRequest<ErrorOr<PlanoDietaDto>>;
