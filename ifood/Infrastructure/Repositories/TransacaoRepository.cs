using Microsoft.EntityFrameworkCore;
using ifood.Domain.Entities;
using ifood.Domain.Repositories;
using ifood.Infrastructure.Data;

namespace ifood.Infrastructure.Repositories;

public class TransacaoRepository : ITransacaoRepository
{
    private readonly AppDbContext _context;

    public TransacaoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Transacao?> ObterPorIdAsync(Guid id, Guid usuarioId)
    {
        return await _context.Transacoes
            .Include(t => t.Categoria)
            .FirstOrDefaultAsync(t => t.Id == id && t.UsuarioId == usuarioId);
    }

    public async Task<IEnumerable<Transacao>> ListarFiltradoAsync(
        Guid usuarioId,
        DateTime? dataInicio,
        DateTime? dataFim,
        string? tipo,
        int? categoriaId)
    {
        var query = _context.Transacoes
            .Include(t => t.Categoria)
            .Where(t => t.UsuarioId == usuarioId);

        if (dataInicio.HasValue)
        {
            query = query.Where(t => t.Data >= dataInicio.Value);
        }

        if (dataFim.HasValue)
        {
            query = query.Where(t => t.Data <= dataFim.Value);
        }

        if (!string.IsNullOrEmpty(tipo))
        {
            query = query.Where(t => t.Tipo == tipo);
        }

        if (categoriaId.HasValue)
        {
            query = query.Where(t => t.CategoriaId == categoriaId.Value);
        }

        return await query
            .OrderByDescending(t => t.Data)
            .ThenByDescending(t => t.DataCriacao)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<decimal> ObterSomaTipoAsync(Guid usuarioId, string tipo)
    {
        return await _context.Transacoes
            .Where(t => t.UsuarioId == usuarioId && t.Tipo == tipo)
            .SumAsync(t => t.Valor);
    }

    public async Task<bool> ExisteTransacaoParaCategoriaAsync(int categoriaId)
    {
        return await _context.Transacoes.AnyAsync(t => t.CategoriaId == categoriaId);
    }

    public async Task AdicionarAsync(Transacao transacao)
    {
        await _context.Transacoes.AddAsync(transacao);
    }

    public void Deletar(Transacao transacao)
    {
        _context.Transacoes.Remove(transacao);
    }

    public void Atualizar(Transacao transacao)
    {
        _context.Transacoes.Update(transacao);
    }

    public async Task SalvarAlteracoesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
