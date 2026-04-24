using DieTete.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DieTete.Infrastructure.Persistence.Configurations;

public class GrupoFamiliarConfiguracao : IEntityTypeConfiguration<GrupoFamiliar>
{
    public void Configure(EntityTypeBuilder<GrupoFamiliar> builder)
    {
        builder.ToTable("GruposFamiliares");
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Nome).HasMaxLength(100).IsRequired();
    }
}
