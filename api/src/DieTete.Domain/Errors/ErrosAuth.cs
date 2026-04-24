using ErrorOr;

namespace DieTete.Domain.Errors;

public static class ErrosAuth
{
    public static readonly Error EmailJaCadastrado =
        Error.Conflict("Auth.EmailJaCadastrado", "Este e-mail já está cadastrado.");

    public static readonly Error CredenciaisInvalidas =
        Error.Unauthorized("Auth.CredenciaisInvalidas", "E-mail ou senha inválidos.");

    public static readonly Error TokenInvalido =
        Error.Unauthorized("Auth.TokenInvalido", "Token inválido ou expirado.");
}
