using System.ComponentModel.DataAnnotations;

namespace ifood.Dtos;

public record RegistrarUsuarioDto(
    [Required, MaxLength(100)] string Nome,
    [Required, EmailAddress, MaxLength(100)] string Email,
    [Required, MinLength(6), MaxLength(50)] string Senha
);

public record LoginUsuarioDto(
    [Required, EmailAddress] string Email,
    [Required] string Senha
);

public record UsuarioResponseDto(
    Guid Id,
    string Nome,
    string Email,
    DateTime DataCriacao
);

public record LoginResponseDto(
    UsuarioResponseDto Usuario,
    string Token
);
