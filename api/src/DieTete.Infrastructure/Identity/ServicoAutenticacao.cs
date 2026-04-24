using DieTete.Domain.Interfaces.Services;
using Microsoft.AspNetCore.Identity;

namespace DieTete.Infrastructure.Identity;

public class ServicoAutenticacao(
    UserManager<UsuarioAplicacao> gerenciadorUsuarios,
    SignInManager<UsuarioAplicacao> gerenciadorLogin) : IServicoAutenticacao
{
    public async Task<ResultadoAutenticacao> RegistrarAsync(string nomeCompleto, string email, string senha, CancellationToken ct = default)
    {
        var existente = await gerenciadorUsuarios.FindByEmailAsync(email);
        if (existente is not null)
            return new ResultadoAutenticacao(false, null, null, null, null, "E-mail já cadastrado.");

        var usuario = new UsuarioAplicacao { NomeCompleto = nomeCompleto, Email = email, UserName = email };
        var resultado = await gerenciadorUsuarios.CreateAsync(usuario, senha);

        if (!resultado.Succeeded)
            return new ResultadoAutenticacao(false, null, null, null, null,
                string.Join("; ", resultado.Errors.Select(e => e.Description)));

        await gerenciadorUsuarios.AddToRoleAsync(usuario, "Usuario");
        var papeis = await gerenciadorUsuarios.GetRolesAsync(usuario);

        return new ResultadoAutenticacao(true, usuario.Id, usuario.NomeCompleto, usuario.Email, papeis);
    }

    public async Task<ResultadoAutenticacao> EntrarAsync(string email, string senha, CancellationToken ct = default)
    {
        var usuario = await gerenciadorUsuarios.FindByEmailAsync(email);
        if (usuario is null)
            return new ResultadoAutenticacao(false, null, null, null, null, "Credenciais inválidas.");

        var resultado = await gerenciadorLogin.CheckPasswordSignInAsync(usuario, senha, lockoutOnFailure: false);
        if (!resultado.Succeeded)
            return new ResultadoAutenticacao(false, null, null, null, null, "Credenciais inválidas.");

        var papeis = await gerenciadorUsuarios.GetRolesAsync(usuario);
        return new ResultadoAutenticacao(true, usuario.Id, usuario.NomeCompleto, usuario.Email, papeis);
    }

    public async Task<ResultadoAutenticacao?> ObterUsuarioPorIdAsync(Guid usuarioId, CancellationToken ct = default)
    {
        var usuario = await gerenciadorUsuarios.FindByIdAsync(usuarioId.ToString());
        if (usuario is null) return null;
        var papeis = await gerenciadorUsuarios.GetRolesAsync(usuario);
        return new ResultadoAutenticacao(true, usuario.Id, usuario.NomeCompleto, usuario.Email, papeis);
    }

    public async Task<bool> AtualizarTokenAtualizacaoAsync(Guid usuarioId, string token, DateTime expiracao, CancellationToken ct = default)
    {
        var usuario = await gerenciadorUsuarios.FindByIdAsync(usuarioId.ToString());
        if (usuario is null) return false;
        usuario.AtualizarTokenAtualizacao(token, expiracao);
        var resultado = await gerenciadorUsuarios.UpdateAsync(usuario);
        return resultado.Succeeded;
    }

    public async Task<bool> ValidarTokenAtualizacaoAsync(Guid usuarioId, string token, CancellationToken ct = default)
    {
        var usuario = await gerenciadorUsuarios.FindByIdAsync(usuarioId.ToString());
        return usuario?.TokenAtualizacaoValido(token) ?? false;
    }
}
