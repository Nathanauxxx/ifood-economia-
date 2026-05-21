using ifood.Domain.Entities;

namespace ifood.Domain.Repositories;

public interface ICategoriaRepository
{
    Task<Categoria?> ObterPorIdAsync(int id);
    Task<IEnumerable<Categoria>> ListarPadraoECustomizadasAsync(Guid usuarioId);
    Task<bool> ExisteDuplicadaAsync(string nome, string tipo, Guid usuarioId);
    Task AdicionarAsync(Categoria categoria);
    void Deletar(Categoria categoria);
    Task SalvarAlteracoesAsync();
}
