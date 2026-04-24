using DieTete.Domain.Entities;
using DieTete.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DieTete.Infrastructure.Persistence;

public class DieTeteDbContext(DbContextOptions<DieTeteDbContext> options)
    : IdentityDbContext<UsuarioAplicacao, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<GrupoFamiliar> GruposFamiliares => Set<GrupoFamiliar>();
    public DbSet<PlanoDieta> PlanosDieta => Set<PlanoDieta>();
    public DbSet<DiaDieta> DiasDieta => Set<DiaDieta>();
    public DbSet<Refeicao> Refeicoes => Set<Refeicao>();
    public DbSet<ItemAlimento> ItensAlimento => Set<ItemAlimento>();
    public DbSet<ListaCompras> ListasCompras => Set<ListaCompras>();
    public DbSet<ItemListaCompras> ItensListaCompras => Set<ItemListaCompras>();
    public DbSet<PrecoItem> PrecosItens => Set<PrecoItem>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(DieTeteDbContext).Assembly);

        builder.Entity<IdentityRole<Guid>>().ToTable("Papeis");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UsuariosPapeis");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UsuariosReivindicacoes");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UsuariosLogins");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("PapeisReivindicacoes");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UsuariosTokens");
    }
}
