using DieTete.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DieTete.Infrastructure.Persistence.Configurations;

public class UsuarioAplicacaoConfiguracao : IEntityTypeConfiguration<UsuarioAplicacao>
{
    public void Configure(EntityTypeBuilder<UsuarioAplicacao> builder)
    {
        builder.ToTable("Usuarios");
        builder.Property(u => u.NomeCompleto).HasMaxLength(150).IsRequired();
        builder.Property(u => u.TokenAtualizacao).HasMaxLength(512);
    }
}
