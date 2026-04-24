using DieTete.Application.PlanoDieta.Dtos;
using ErrorOr;
using MediatR;

namespace DieTete.Application.PlanoDieta.Queries.ObterPlanoDieta;

public record ObterPlanoDietaQuery(Guid Id, Guid UsuarioId) : IRequest<ErrorOr<PlanoDietaDto>>;
