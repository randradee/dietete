using FluentValidation;

namespace DieTete.Application.Auth.Commands.Entrar;

public class EntrarValidador : AbstractValidator<EntrarComando>
{
    public EntrarValidador()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Senha).NotEmpty();
    }
}
