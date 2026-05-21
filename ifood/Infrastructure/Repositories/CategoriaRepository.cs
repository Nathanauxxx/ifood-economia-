using Microsoft.EntityFrameworkCore;
using ifood.Domain.Entities;
using ifood.Domain.Repositories;
using ifood.Infrastructure.Data;

namespace ifood.Infrastructure.Repositories;

public class CategoriaRepository : ICategoriaRepository
{
    private readonly AppDbContext _context;

    public CategoriaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Categoria?> ObterPorIdAsync(int id)
    {
        return await _context.Categorias.FindAsync(id);
    }

    public async Task<IEnumerable<Categoria>> ListarPadraoECustomizadasAsync(Guid usuarioId)
    {
        return await _context.Categorias
            .Where(c => c.UsuarioId == null || c.UsuarioId == usuarioId)
            .OrderBy(c => c.Tipo)
            .ThenBy(c => c.Nome)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<bool> ExisteDuplicadaAsync(string nome, string tipo, Guid usuarioId)
    {
        return await _context.Categorias
            .AnyAsync(c => (c.UsuarioId == null || c.UsuarioId == usuarioId) && 
                           c.Nome.ToLower() == nome.ToLower() && 
                           c.Tipo == tipo);
    }

    public async Task AdicionarAsync(Categoria categoria)
    {
        await _context.Categorias.AddAsync(categoria);
    }

    public void Deletar(Categoria categoria)
    {
        _context.Categorias.Remove(categoria);
    }

    public async Task SalvarAlteracoesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
