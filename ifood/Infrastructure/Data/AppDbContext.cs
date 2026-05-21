using Microsoft.EntityFrameworkCore;
using ifood.Domain.Entities;

namespace ifood.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios { get; set; } = null!;
    public DbSet<Categoria> Categorias { get; set; } = null!;
    public DbSet<Transacao> Transacoes { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Índice Único para Email
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Configuração de cascade delete
        modelBuilder.Entity<Transacao>()
            .HasOne(t => t.Usuario)
            .WithMany(u => u.Transacoes)
            .HasForeignKey(t => t.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Transacao>()
            .HasOne(t => t.Categoria)
            .WithMany(c => c.Transacoes)
            .HasForeignKey(t => t.CategoriaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Categoria>()
            .HasOne(c => c.Usuario)
            .WithMany(u => u.Categorias)
            .HasForeignKey(c => c.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed das Categorias Padrão
        modelBuilder.Entity<Categoria>().HasData(
            new Categoria(1, "Salário", "Receita", "#2ecc71", "cash-stack", null),
            new Categoria(2, "Investimentos", "Receita", "#9b59b6", "graph-up-arrow", null),
            new Categoria(3, "Outras Receitas", "Receita", "#1abc9c", "plus-circle", null),
            new Categoria(4, "Alimentação", "Despesa", "#e67e22", "egg-fried", null),
            new Categoria(5, "Transporte", "Despesa", "#3498db", "car-front", null),
            new Categoria(6, "Moradia", "Despesa", "#e74c3c", "house", null),
            new Categoria(7, "Lazer", "Despesa", "#f1c40f", "controller", null),
            new Categoria(8, "Saúde", "Despesa", "#e84393", "heart-pulse", null),
            new Categoria(9, "Educação", "Despesa", "#16a085", "book", null),
            new Categoria(10, "Outros Gastos", "Despesa", "#95a5a6", "three-dots", null)
        );
    }
}
