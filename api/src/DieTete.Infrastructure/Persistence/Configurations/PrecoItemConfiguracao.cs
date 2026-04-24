using DieTete.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DieTete.Infrastructure.Persistence.Configurations;

public class PrecoItemConfiguracao : IEntityTypeConfiguration<PrecoItem>
{
    public void Configure(EntityTypeBuilder<PrecoItem> builder)
    {
        builder.ToTable("PrecosItens");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.NomeItem).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Preco).HasPrecision(10, 2);
        builder.Property(p => p.NomeEstabelecimento).HasMaxLength(300).IsRequired();
        builder.HasIndex(p => p.NomeItem);
        builder.Ignore(p => p.Expirado);
    }
}
