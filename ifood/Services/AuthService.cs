using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using ifood.Domain.Entities;

namespace ifood.Services;

public interface IAuthService
{
    string HashPassword(Usuario usuario, string password);
    bool VerifyPassword(Usuario usuario, string hashedPassword, string providedPassword);
    string GenerateJwtToken(Usuario usuario);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;
    private readonly PasswordHasher<Usuario> _passwordHasher;

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
        _passwordHasher = new PasswordHasher<Usuario>();
    }

    public string HashPassword(Usuario usuario, string password)
    {
        return _passwordHasher.HashPassword(usuario, password);
    }

    public bool VerifyPassword(Usuario usuario, string hashedPassword, string providedPassword)
    {
        var result = _passwordHasher.VerifyHashedPassword(usuario, hashedPassword, providedPassword);
        return result == PasswordVerificationResult.Success;
    }

    public string GenerateJwtToken(Usuario usuario)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        
        // Obter chave secreta do appsettings.json ou usar uma padrão segura para dev
        var secretKey = _configuration["JwtSettings:Secret"] ?? "ChaveSuperSecretaEExtremamenteLongaParaOFinanceiroAPI123456!";
        var key = Encoding.ASCII.GetBytes(secretKey);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nome),
            new Claim(ClaimTypes.Email, usuario.Email)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7), // Expira em 7 dias
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = _configuration["JwtSettings:Issuer"] ?? "FinanceiroApi",
            Audience = _configuration["JwtSettings:Audience"] ?? "FinanceiroWeb"
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
