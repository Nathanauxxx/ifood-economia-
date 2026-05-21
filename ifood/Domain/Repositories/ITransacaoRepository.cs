using ifood.Domain.Entities;

namespace ifood.Domain.Repositories;

public interface ITransacaoRepository
{
    Task<Transacao?> ObterPorIdAsync(Guid id, Guid usuarioId);
    Task<IEnumerable<Transacao>> ListarFiltradoAsync(
        Guid usuarioId,
        DateTime? dataInicio,
        DateTime? dataFim,
        string? tipo,
        int? categoriaId);
    Task<decimal> ObterSomaTipoAsync(Guid usuarioId, string tipo);
    Task<bool> ExisteTransacaoParaCategoriaAsync(int categoriaId);
    Task AdicionarAsync(Transacao transacao);
    void Deletar(Transacao transacao);
    void Atualizar(Transacao transacao);
    Task SalvarAlteracoesAsync();
}
