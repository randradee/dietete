using DieTete.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DieTete.Infrastructure.Persistence.Configurations;

public class ItemAlimentoConfiguracao : IEntityTypeConfiguration<ItemAlimento>
{
    public void Configure(EntityTypeBuilder<ItemAlimento> builder)
    {
        builder.ToTable("ItensAlimento");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Nome).HasMaxLength(200).IsRequired();
        builder.Property(i => i.Quantidade).HasPrecision(10, 3);
        builder.Property(i => i.Unidade).IsRequired();
        builder.Property(i => i.PontuacaoConfianca).IsRequired();
        builder.Ignore(i => i.NecessitaRevisao);
    }
}
