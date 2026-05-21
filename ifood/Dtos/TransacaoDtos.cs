using System.ComponentModel.DataAnnotations;

namespace ifood.Dtos;

public record CriarTransacaoDto(
    [Required, MaxLength(200)] string Descricao,
    [Required, Range(0.01, 1000000000.00, ErrorMessage = "O valor deve ser maior que zero.")] decimal Valor,
    [Required] DateTime Data,
    [Required, RegularExpression("Receita|Despesa", ErrorMessage = "O tipo deve ser 'Receita' ou 'Despesa'.")] string Tipo,
    [Required] int CategoriaId
);

public record TransacaoResponseDto(
    Guid Id,
    string Descricao,
    decimal Valor,
    DateTime Data,
    string Tipo,
    int CategoriaId,
    string CategoriaNome,
    string CategoriaCor,
    string CategoriaIcone,
    DateTime DataCriacao
);

public record SaldoGeralDto(
    decimal TotalReceitas,
    decimal TotalDespesas,
    decimal SaldoAtual
);
