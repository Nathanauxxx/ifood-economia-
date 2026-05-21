using System.ComponentModel.DataAnnotations;

namespace ifood.Dtos;

public record CriarCategoriaDto(
    [Required, MaxLength(50)] string Nome,
    [Required, RegularExpression("Receita|Despesa", ErrorMessage = "O tipo deve ser 'Receita' ou 'Despesa'.")] string Tipo,
    [MaxLength(7)] string CorHex,
    [MaxLength(50)] string Icone
);

public record CategoriaResponseDto(
    int Id,
    string Nome,
    string Tipo,
    string CorHex,
    string Icone,
    Guid? UsuarioId
);
