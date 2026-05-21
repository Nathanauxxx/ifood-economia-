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
[Route("api/transacoes")]
public class TransacoesController : ControllerBase
{
    private readonly ITransacaoRepository _transacaoRepository;
    private readonly ICategoriaRepository _categoriaRepository;

    public TransacoesController(ITransacaoRepository transacaoRepository, ICategoriaRepository categoriaRepository)
    {
        _transacaoRepository = transacaoRepository;
        _categoriaRepository = categoriaRepository;
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
    public async Task<ActionResult<IEnumerable<TransacaoResponseDto>>> Listar(
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim,
        [FromQuery] string? tipo,
        [FromQuery] int? categoriaId)
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

        var transacoesEntity = await _transacaoRepository.ListarFiltradoAsync(
            usuarioId, dataInicio, dataFim, tipo, categoriaId);

        var transacoes = transacoesEntity
            .Select(t => new TransacaoResponseDto(
                t.Id,
                t.Descricao,
                t.Valor,
                t.Data,
                t.Tipo,
                t.CategoriaId,
                t.Categoria != null ? t.Categoria.Nome : string.Empty,
                t.Categoria != null ? t.Categoria.CorHex : string.Empty,
                t.Categoria != null ? t.Categoria.Icone : string.Empty,
                t.DataCriacao
            ))
            .ToList();

        return Ok(transacoes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransacaoResponseDto>> ObterPorId(Guid id)
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

        var t = await _transacaoRepository.ObterPorIdAsync(id, usuarioId);

        if (t == null)
        {
            return NotFound(new { mensagem = "Transação não encontrada." });
        }

        var responseDto = new TransacaoResponseDto(
            t.Id,
            t.Descricao,
            t.Valor,
            t.Data,
            t.Tipo,
            t.CategoriaId,
            t.Categoria != null ? t.Categoria.Nome : string.Empty,
            t.Categoria != null ? t.Categoria.CorHex : string.Empty,
            t.Categoria != null ? t.Categoria.Icone : string.Empty,
            t.DataCriacao
        );

        return Ok(responseDto);
    }

    [HttpGet("saldo")]
    public async Task<ActionResult<SaldoGeralDto>> ObterSaldo()
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

        var totalReceitas = await _transacaoRepository.ObterSomaTipoAsync(usuarioId, "Receita");
        var totalDespesas = await _transacaoRepository.ObterSomaTipoAsync(usuarioId, "Despesa");
        var saldoAtual = totalReceitas - totalDespesas;

        return Ok(new SaldoGeralDto(totalReceitas, totalDespesas, saldoAtual));
    }

    [HttpPost]
    public async Task<ActionResult<TransacaoResponseDto>> Criar(CriarTransacaoDto dto)
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

        // Validar se a categoria existe e pertence ao usuário ou é global (nula)
        var categoria = await _categoriaRepository.ObterPorIdAsync(dto.CategoriaId);
        if (categoria == null || (categoria.UsuarioId != null && categoria.UsuarioId != usuarioId))
        {
            return BadRequest(new { mensagem = "Categoria inválida." });
        }

        var transacao = new Transacao(dto.Descricao, dto.Valor, dto.Data, dto.Tipo, dto.CategoriaId, usuarioId);

        await _transacaoRepository.AdicionarAsync(transacao);
        await _transacaoRepository.SalvarAlteracoesAsync();

        // Recarrega a transação com a categoria para retornar os dados completos
        var transacaoSalva = await _transacaoRepository.ObterPorIdAsync(transacao.Id, usuarioId);

        var responseDto = new TransacaoResponseDto(
            transacaoSalva.Id,
            transacaoSalva.Descricao,
            transacaoSalva.Valor,
            transacaoSalva.Data,
            transacaoSalva.Tipo,
            transacaoSalva.CategoriaId,
            transacaoSalva.Categoria != null ? transacaoSalva.Categoria.Nome : string.Empty,
            transacaoSalva.Categoria != null ? transacaoSalva.Categoria.CorHex : string.Empty,
            transacaoSalva.Categoria != null ? transacaoSalva.Categoria.Icone : string.Empty,
            transacaoSalva.DataCriacao
        );

        return CreatedAtAction(nameof(ObterPorId), new { id = transacao.Id }, responseDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TransacaoResponseDto>> Atualizar(Guid id, CriarTransacaoDto dto)
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

        var transacao = await _transacaoRepository.ObterPorIdAsync(id, usuarioId);
        if (transacao == null)
        {
            return NotFound(new { mensagem = "Transação não encontrada." });
        }

        // Validar se a nova categoria existe e pertence ao usuário ou é global (nula)
        var categoria = await _categoriaRepository.ObterPorIdAsync(dto.CategoriaId);
        if (categoria == null || (categoria.UsuarioId != null && categoria.UsuarioId != usuarioId))
        {
            return BadRequest(new { mensagem = "Categoria inválida." });
        }

        transacao.Atualizar(dto.Descricao, dto.Valor, dto.Data, dto.Tipo, dto.CategoriaId);

        _transacaoRepository.Atualizar(transacao);
        await _transacaoRepository.SalvarAlteracoesAsync();

        // Recarrega a transação
        var transacaoAtualizada = await _transacaoRepository.ObterPorIdAsync(transacao.Id, usuarioId);

        var responseDto = new TransacaoResponseDto(
            transacaoAtualizada.Id,
            transacaoAtualizada.Descricao,
            transacaoAtualizada.Valor,
            transacaoAtualizada.Data,
            transacaoAtualizada.Tipo,
            transacaoAtualizada.CategoriaId,
            transacaoAtualizada.Categoria != null ? transacaoAtualizada.Categoria.Nome : string.Empty,
            transacaoAtualizada.Categoria != null ? transacaoAtualizada.Categoria.CorHex : string.Empty,
            transacaoAtualizada.Categoria != null ? transacaoAtualizada.Categoria.Icone : string.Empty,
            transacaoAtualizada.DataCriacao
        );

        return Ok(responseDto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(Guid id)
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

        var transacao = await _transacaoRepository.ObterPorIdAsync(id, usuarioId);
        if (transacao == null)
        {
            return NotFound(new { mensagem = "Transação não encontrada." });
        }

        _transacaoRepository.Deletar(transacao);
        await _transacaoRepository.SalvarAlteracoesAsync();

        return NoContent();
    }
}
