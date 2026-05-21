using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ifood.Infrastructure.Data;
using ifood.Dtos;
using ifood.Domain.Entities;

using ifood.Domain.Repositories;

namespace ifood.Controllers;

[Authorize]
[ApiController]
[Route("api/categorias")]
public class CategoriasController : ControllerBase
{
    private readonly ICategoriaRepository _categoriaRepository;
    private readonly ITransacaoRepository _transacaoRepository;

    public CategoriasController(ICategoriaRepository categoriaRepository, ITransacaoRepository transacaoRepository)
    {
        _categoriaRepository = categoriaRepository;
        _transacaoRepository = transacaoRepository;
    }

    private Guid ObterUsuarioId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(idClaim) || !Guid.TryParse(idClaim, out var usuarioId))
        {
            throw new UnauthorizedAccessException("Usuário não autenticado ou ID inválido no token.");
        }
        return usuarioId;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoriaResponseDto>>> Listar()
    {
        Guid usuarioId;
        try
        {
            usuarioId = ObterUsuarioId();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }

        // Retorna categorias padrão (UsuarioId == null) E as categorias criadas pelo próprio usuário
        var categoriasEntity = await _categoriaRepository.ListarPadraoECustomizadasAsync(usuarioId);
        var categorias = categoriasEntity
            .Select(c => new CategoriaResponseDto(c.Id, c.Nome, c.Tipo, c.CorHex, c.Icone, c.UsuarioId))
            .ToList();

        return Ok(categorias);
    }

    [HttpPost]
    public async Task<ActionResult<CategoriaResponseDto>> Criar(CriarCategoriaDto dto)
    {
        Guid usuarioId;
        try
        {
            usuarioId = ObterUsuarioId();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }

        // Evitar categorias duplicadas para o mesmo usuário
        var existe = await _categoriaRepository.ExisteDuplicadaAsync(dto.Nome, dto.Tipo, usuarioId);
        if (existe)
        {
            return BadRequest(new { mensagem = $"Já existe uma categoria de {dto.Tipo} com o nome '{dto.Nome}'." });
        }

        var cor = string.IsNullOrEmpty(dto.CorHex) ? "#cccccc" : dto.CorHex;
        var icone = string.IsNullOrEmpty(dto.Icone) ? "wallet2" : dto.Icone;
        var categoria = new Categoria(dto.Nome, dto.Tipo, cor, icone, usuarioId);

        await _categoriaRepository.AdicionarAsync(categoria);
        await _categoriaRepository.SalvarAlteracoesAsync();

        var responseDto = new CategoriaResponseDto(
            categoria.Id, 
            categoria.Nome, 
            categoria.Tipo, 
            categoria.CorHex, 
            categoria.Icone, 
            categoria.UsuarioId
        );

        return CreatedAtAction(nameof(Listar), new { id = categoria.Id }, responseDto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        Guid usuarioId;
        try
        {
            usuarioId = ObterUsuarioId();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }

        var categoria = await _categoriaRepository.ObterPorIdAsync(id);
        if (categoria == null)
        {
            return NotFound(new { mensagem = "Categoria não encontrada." });
        }

        if (categoria.UsuarioId == null)
        {
            return BadRequest(new { mensagem = "Não é permitido excluir categorias padrão do sistema." });
        }

        if (categoria.UsuarioId != usuarioId)
        {
            return Forbid();
        }

        // Caso haja transações associadas a esta categoria, o banco bloquearia.
        // Verificamos antes para retornar uma resposta amigável.
        var temTransacoes = await _transacaoRepository.ExisteTransacaoParaCategoriaAsync(id);
        if (temTransacoes)
        {
            return BadRequest(new { mensagem = "Não é possível excluir esta categoria porque existem transações associadas a ela." });
        }

        _categoriaRepository.Deletar(categoria);
        await _categoriaRepository.SalvarAlteracoesAsync();

        return NoContent();
    }
}
