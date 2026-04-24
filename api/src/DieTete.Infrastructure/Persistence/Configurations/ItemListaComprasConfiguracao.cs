using DieTete.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DieTete.Infrastructure.Persistence.Configurations;

public class ItemListaComprasConfiguracao : IEntityTypeConfiguration<ItemListaCompras>
{
    public void Configure(EntityTypeBuilder<ItemListaCompras> builder)
    {
        builder.ToTable("ItensListaCompras");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Nome).HasMaxLength(200).IsRequired();
        builder.Property(i => i.QuantidadeTotal).HasPrecision(10, 3);
        builder.Property(i => i.PrecoEstimado).HasPrecision(10, 2);
        builder.Property(i => i.Unidade).IsRequired();
        builder.Property(i => i.Categoria).IsRequired();
    }
}
