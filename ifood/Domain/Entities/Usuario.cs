using ifood.Domain.Exceptions;

namespace ifood.Domain.Entities;

public class Usuario
{
    public Guid Id { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string SenhaHash { get; private set; } = string.Empty;
    public DateTime DataCriacao { get; private set; }

    // Relacionamentos
    public ICollection<Transacao> Transacoes { get; private set; } = new List<Transacao>();
    public ICollection<Categoria> Categorias { get; private set; } = new List<Categoria>();

    // Construtor privado para o EF Core
    private Usuario() { }

    public Usuario(string nome, string email)
    {
        ValidarNome(nome);
        ValidarEmail(email);

        Id = Guid.NewGuid();
        Nome = nome;
        Email = email.ToLower().Trim();
        DataCriacao = DateTime.UtcNow;
    }

    public void DefinirSenhaHash(string senhaHash)
    {
        if (string.IsNullOrWhiteSpace(senhaHash))
        {
            throw new DomainException("O hash da senha não pode ser vazio.");
        }
        SenhaHash = senhaHash;
    }

    public void AtualizarPerfil(string nome, string email)
    {
        ValidarNome(nome);
        ValidarEmail(email);

        Nome = nome;
        Email = email.ToLower().Trim();
    }

    private static void ValidarNome(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
        {
            throw new DomainException("O nome do usuário é obrigatório.");
        }
        if (nome.Length < 2)
        {
            throw new DomainException("O nome deve ter no mínimo 2 caracteres.");
        }
    }

    private static void ValidarEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new DomainException("O e-mail é obrigatório.");
        }
        if (!email.Contains("@") || !email.Contains("."))
        {
            throw new DomainException("Formato de e-mail inválido.");
        }
    }
}
