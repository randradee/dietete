using DieTete.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DieTete.Infrastructure.Persistence.Configurations;

public class DiaDietaConfiguracao : IEntityTypeConfiguration<DiaDieta>
{
    public void Configure(EntityTypeBuilder<DiaDieta> builder)
    {
        builder.ToTable("DiasDieta");
        builder.HasKey(d => d.Id);
        builder.HasMany(d => d.Refeicoes)
            .WithOne()
            .HasForeignKey(r => r.DiaDietaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
