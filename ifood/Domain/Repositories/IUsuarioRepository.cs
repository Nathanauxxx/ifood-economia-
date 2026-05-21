using ifood.Domain.Entities;

namespace ifood.Domain.Repositories;

public interface IUsuarioRepository
{
    Task<Usuario?> ObterPorIdAsync(Guid id);
    Task<Usuario?> ObterPorEmailAsync(string email);
    Task AdicionarAsync(Usuario usuario);
    Task SalvarAlteracoesAsync();
}
