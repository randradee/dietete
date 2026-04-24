using DieTete.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DieTete.Infrastructure.Persistence.Configurations;

public class PlanoDietaConfiguracao : IEntityTypeConfiguration<PlanoDieta>
{
    public void Configure(EntityTypeBuilder<PlanoDieta> builder)
    {
        builder.ToTable("PlanosDieta");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.NomeArquivoOriginal).HasMaxLength(255).IsRequired();
        builder.Property(p => p.CaminhoArquivo).HasMaxLength(500).IsRequired();
        builder.Property(p => p.Status).IsRequired();
        builder.Property(p => p.MensagemErro).HasMaxLength(1000);
        builder.HasMany(p => p.Dias)
            .WithOne()
            .HasForeignKey(d => d.PlanoDietaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
