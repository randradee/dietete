using DieTete.Application.PlanoDieta.Dtos;
using ErrorOr;

namespace DieTete.Application.PlanoDieta.Queries.ObterPlanoDieta;

public record ObterPlanoDietaQuery(Guid Id, Guid UsuarioId);
