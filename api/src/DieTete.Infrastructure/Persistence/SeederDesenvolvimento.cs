using DieTete.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace DieTete.Infrastructure.Persistence;

public static class SeederDesenvolvimento
{
    public static async Task SeedAsync(
        UserManager<UsuarioAplicacao> gerenciadorUsuarios,
        RoleManager<IdentityRole<Guid>> gerenciadorPapeis)
    {
        foreach (var papel in new[] { "Admin", "Usuario" })
        {
            if (!await gerenciadorPapeis.RoleExistsAsync(papel))
                await gerenciadorPapeis.CreateAsync(new IdentityRole<Guid>(papel));
        }

        const string emailAdmin = "admin@dietete.local";
        if (await gerenciadorUsuarios.FindByEmailAsync(emailAdmin) is null)
        {
            var admin = new UsuarioAplicacao
            {
                NomeCompleto = "Administrador",
                Email = emailAdmin,
                UserName = emailAdmin,
                EmailConfirmed = true,
            };

            await gerenciadorUsuarios.CreateAsync(admin, "Admin@123");
            await gerenciadorUsuarios.AddToRoleAsync(admin, "Admin");
            await gerenciadorUsuarios.AddToRoleAsync(admin, "Usuario");
        }
    }
}
