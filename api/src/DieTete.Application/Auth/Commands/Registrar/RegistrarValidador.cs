using FluentValidation;

namespace DieTete.Application.Auth.Commands.Registrar;

public class RegistrarValidador : AbstractValidator<RegistrarComando>
{
    public RegistrarValidador()
    {
        RuleFor(x => x.NomeCompleto)
            .NotEmpty().WithMessage("Nome completo é obrigatório.")
            .MaximumLength(150).WithMessage("Nome deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-mail é obrigatório.")
            .EmailAddress().WithMessage("E-mail inválido.");

        RuleFor(x => x.Senha)
            .NotEmpty().WithMessage("Senha é obrigatória.")
            .MinimumLength(8).WithMessage("Senha deve ter no mínimo 8 caracteres.");

        RuleFor(x => x.ConfirmacaoSenha)
            .Equal(x => x.Senha).WithMessage("As senhas não coincidem.");
    }
}
