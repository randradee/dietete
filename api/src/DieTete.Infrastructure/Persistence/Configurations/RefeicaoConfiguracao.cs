using DieTete.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DieTete.Infrastructure.Persistence.Configurations;

public class RefeicaoConfiguracao : IEntityTypeConfiguration<Refeicao>
{
    public void Configure(EntityTypeBuilder<Refeicao> builder)
    {
        builder.ToTable("Refeicoes");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Tipo).IsRequired();
        builder.HasMany(r => r.Itens)
            .WithOne()
            .HasForeignKey(i => i.RefeicaoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
