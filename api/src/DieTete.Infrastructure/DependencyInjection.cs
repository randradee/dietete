using DieTete.Domain.Interfaces.Repositories;
using DieTete.Domain.Interfaces.Services;
using DieTete.Infrastructure.Identity;
using DieTete.Infrastructure.Persistence;
using DieTete.Infrastructure.Persistence.Repositories;
using DieTete.Infrastructure.Services.Parsing;
using DieTete.Infrastructure.Services.Pricing;
using DieTete.Infrastructure.Services.Storage;
using DieTete.Infrastructure.Services.Token;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DieTete.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<DieTeteDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Postgres")));

        services.AddIdentity<UsuarioAplicacao, IdentityRole<Guid>>(options =>
        {
            options.Password.RequiredLength = 8;
            options.Password.RequireNonAlphanumeric = false;
            options.User.RequireUniqueEmail = true;
        })
        .AddEntityFrameworkStores<DieTeteDbContext>()
        .AddDefaultTokenProviders();

        services.AddScoped<IPlanoDietaRepositorio, PlanoDietaRepositorio>();
        services.AddScoped<IListaComprasRepositorio, ListaComprasRepositorio>();
        services.AddScoped<IGrupoFamiliarRepositorio, GrupoFamiliarRepositorio>();
        services.AddScoped<IPrecoItemRepositorio, PrecoItemRepositorio>();

        services.AddScoped<IServicoToken, ServicoToken>();
        services.AddScoped<IServicoAutenticacao, ServicoAutenticacao>();
        services.AddScoped<IArmazenamentoArquivo, ArmazenamentoArquivoLocal>();
        services.AddScoped<IParsadorPlanoDieta, ParsadorPlanoDieta>();

        if (configuration.GetValue<bool>("ConsultaPrecos:Habilitado"))
            services.AddScoped<IConsultaPrecos, ScraperPrecosDaHora>();
        else
            services.AddScoped<IConsultaPrecos, ConsultaPrecoDesabilitada>();

        services.AddHttpClient<ScraperPrecosDaHora>();

        return services;
    }
}
