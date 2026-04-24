using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DieTete.Domain.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DieTete.Infrastructure.Services.Token;

public class ServicoToken(IConfiguration configuration) : IServicoToken
{
    public string GerarTokenAcesso(Guid usuarioId, string email, string nomeCompleto, IList<string> papeis)
    {
        var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Chave"]!));
        var credenciais = new SigningCredentials(chave, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuarioId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Name, nomeCompleto),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        claims.AddRange(papeis.Select(papel => new Claim(ClaimTypes.Role, papel)));

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Emissor"],
            audience: configuration["Jwt:Audiencia"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(configuration["Jwt:ExpiracaoMinutos"] ?? "15")),
            signingCredentials: credenciais);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GerarTokenAtualizacao()
    {
        var bytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }
}
