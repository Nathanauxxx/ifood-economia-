using ifood.Domain.Exceptions;

namespace ifood.Domain.Entities;

public class Categoria
{
    public int Id { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string Tipo { get; private set; } = "Despesa"; // "Receita" ou "Despesa"
    public string CorHex { get; private set; } = "#cccccc";
    public string Icone { get; private set; } = "wallet2";
    
    // Relacionamento com Usuário (nulo se for categoria padrão global do sistema)
    public Guid? UsuarioId { get; private set; }
    public Usuario? Usuario { get; private set; }

    public ICollection<Transacao> Transacoes { get; private set; } = new List<Transacao>();

    // Construtor privado para o EF Core
    private Categoria() { }

    public Categoria(string nome, string tipo, string corHex, string icone, Guid? usuarioId)
    {
        Validar(nome, tipo);

        Nome = nome.Trim();
        Tipo = tipo;
        CorHex = string.IsNullOrWhiteSpace(corHex) ? "#cccccc" : corHex.Trim();
        Icone = string.IsNullOrWhiteSpace(icone) ? "wallet2" : icone.Trim();
        UsuarioId = usuarioId;
    }

    // Usado pelo seeder e migrations (permite setar Id manualmente para sementes)
    public Categoria(int id, string nome, string tipo, string corHex, string icone, Guid? usuarioId)
    {
        Validar(nome, tipo);

        Id = id;
        Nome = nome.Trim();
        Tipo = tipo;
        CorHex = string.IsNullOrWhiteSpace(corHex) ? "#cccccc" : corHex.Trim();
        Icone = string.IsNullOrWhiteSpace(icone) ? "wallet2" : icone.Trim();
        UsuarioId = usuarioId;
    }

    public void Atualizar(string nome, string corHex, string icone)
    {
        Validar(nome, Tipo);

        Nome = nome.Trim();
        CorHex = string.IsNullOrWhiteSpace(corHex) ? "#cccccc" : corHex.Trim();
        Icone = string.IsNullOrWhiteSpace(icone) ? "wallet2" : icone.Trim();
    }

    private static void Validar(string nome, string tipo)
    {
        if (string.IsNullOrWhiteSpace(nome))
        {
            throw new DomainException("O nome da categoria é obrigatório.");
        }
        if (nome.Length < 2)
        {
            throw new DomainException("O nome da categoria deve ter no mínimo 2 caracteres.");
        }
        if (tipo != "Receita" && tipo != "Despesa")
        {
            throw new DomainException("O tipo da categoria deve ser 'Receita' ou 'Despesa'.");
        }
    }
}
