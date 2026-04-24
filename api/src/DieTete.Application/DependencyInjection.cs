using DieTete.Application.Cqrs;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace DieTete.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddValidatorsFromAssembly(assembly);
        services.AddScoped<IDispatcher, Dispatcher>();

        RegistrarManipuladores(services, assembly, typeof(IManipuladorComando<,>));
        RegistrarManipuladores(services, assembly, typeof(IManipuladorConsulta<,>));

        return services;
    }

    private static void RegistrarManipuladores(
        IServiceCollection services,
        Assembly assembly,
        Type tipoInterfaceAberto)
    {
        foreach (var tipo in assembly.GetTypes().Where(t => t.IsClass && !t.IsAbstract))
        {
            foreach (var iface in tipo.GetInterfaces().Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == tipoInterfaceAberto))
            {
                services.AddScoped(iface, tipo);
            }
        }
    }
}
