using DieTete.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DieTete.Infrastructure.Persistence.Configurations;

public class ListaComprasConfiguracao : IEntityTypeConfiguration<ListaCompras>
{
    public void Configure(EntityTypeBuilder<ListaCompras> builder)
    {
        builder.ToTable("ListasCompras");
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Periodo).IsRequired();
        builder.Property(l => l.Tipo).IsRequired();
        builder.Property(l => l.DataInicio).IsRequired();
        builder.Property(l => l.DataFim).IsRequired();
        builder.HasMany(l => l.Itens)
            .WithOne()
            .HasForeignKey(i => i.ListaComprasId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
