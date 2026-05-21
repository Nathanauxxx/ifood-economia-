using ifood.Domain.Exceptions;

namespace ifood.Domain.Entities;

public class Transacao
{
    public Guid Id { get; private set; }
    public string Descricao { get; private set; } = string.Empty;
    public decimal Valor { get; private set; }
    public DateTime Data { get; private set; }
    public string Tipo { get; private set; } = "Despesa"; // "Receita" ou "Despesa"

    public int CategoriaId { get; private set; }
    public Categoria? Categoria { get; private set; }

    public Guid UsuarioId { get; private set; }
    public Usuario? Usuario { get; private set; }

    public DateTime DataCriacao { get; private set; }

    // Construtor privado para o EF Core
    private Transacao() { }

    public Transacao(string descricao, decimal valor, DateTime data, string tipo, int categoriaId, Guid usuarioId)
    {
        Validar(descricao, valor, tipo, categoriaId, usuarioId);

        Id = Guid.NewGuid();
        Descricao = descricao.Trim();
        Valor = valor;
        Data = data;
        Tipo = tipo;
        CategoriaId = categoriaId;
        UsuarioId = usuarioId;
        DataCriacao = DateTime.UtcNow;
    }

    public void Atualizar(string descricao, decimal valor, DateTime data, string tipo, int categoriaId)
    {
        Validar(descricao, valor, tipo, categoriaId, UsuarioId);

        Descricao = descricao.Trim();
        Valor = valor;
        Data = data;
        Tipo = tipo;
        CategoriaId = categoriaId;
    }

    private static void Validar(string descricao, decimal valor, string tipo, int categoriaId, Guid usuarioId)
    {
        if (string.IsNullOrWhiteSpace(descricao))
        {
            throw new DomainException("A descrição da transação é obrigatória.");
        }
        if (descricao.Length < 2)
        {
            throw new DomainException("A descrição deve ter no mínimo 2 caracteres.");
        }
        if (valor <= 0)
        {
            throw new DomainException("O valor da transação deve ser maior que zero.");
        }
        if (tipo != "Receita" && tipo != "Despesa")
        {
            throw new DomainException("O tipo da transação deve ser 'Receita' ou 'Despesa'.");
        }
        if (categoriaId <= 0)
        {
            throw new DomainException("A transação deve ter uma categoria válida.");
        }
        if (usuarioId == Guid.Empty)
        {
            throw new DomainException("A transação deve estar vinculada a um usuário.");
        }
    }
}
