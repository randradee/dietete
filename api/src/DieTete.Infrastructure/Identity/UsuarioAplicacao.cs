using Microsoft.AspNetCore.Identity;

namespace DieTete.Infrastructure.Identity;

public class UsuarioAplicacao : IdentityUser<Guid>
{
    public string NomeCompleto { get; set; } = default!;
    public Guid? GrupoFamiliarId { get; set; }
    public string? TokenAtualizacao { get; set; }
    public DateTime? ExpiracaoTokenAtualizacao { get; set; }

    public bool TokenAtualizacaoValido(string token) =>
        TokenAtualizacao == token && ExpiracaoTokenAtualizacao > DateTime.UtcNow;

    public void AtualizarTokenAtualizacao(string token, DateTime expiracao)
    {
        TokenAtualizacao = token;
        ExpiracaoTokenAtualizacao = expiracao;
    }

    public void RevogarTokenAtualizacao()
    {
        TokenAtualizacao = null;
        ExpiracaoTokenAtualizacao = null;
    }
}
