using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ifood.Infrastructure.Data;
using ifood.Dtos;
using ifood.Domain.Entities;
using ifood.Services;

using ifood.Domain.Repositories;

namespace ifood.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IAuthService _authService;

    public AuthController(IUsuarioRepository usuarioRepository, IAuthService authService)
    {
        _usuarioRepository = usuarioRepository;
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<LoginResponseDto>> Register(RegistrarUsuarioDto dto)
    {
        var usuarioExistente = await _usuarioRepository.ObterPorEmailAsync(dto.Email.ToLower());
        if (usuarioExistente != null)
        {
            return BadRequest(new { mensagem = "Este email já está sendo utilizado." });
        }

        var usuario = new Usuario(dto.Nome, dto.Email);
        var hash = _authService.HashPassword(usuario, dto.Senha);
        usuario.DefinirSenhaHash(hash);

        await _usuarioRepository.AdicionarAsync(usuario);
        await _usuarioRepository.SalvarAlteracoesAsync();

        var responseDto = new UsuarioResponseDto(usuario.Id, usuario.Nome, usuario.Email, usuario.DataCriacao);
        var token = _authService.GenerateJwtToken(usuario);

        return Ok(new LoginResponseDto(responseDto, token));
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginUsuarioDto dto)
    {
        var usuario = await _usuarioRepository.ObterPorEmailAsync(dto.Email.ToLower());
        if (usuario == null)
        {
            return Unauthorized(new { mensagem = "Credenciais inválidas." });
        }

        var senhaValida = _authService.VerifyPassword(usuario, usuario.SenhaHash, dto.Senha);
        if (!senhaValida)
        {
            return Unauthorized(new { mensagem = "Credenciais inválidas." });
        }

        var responseDto = new UsuarioResponseDto(usuario.Id, usuario.Nome, usuario.Email, usuario.DataCriacao);
        var token = _authService.GenerateJwtToken(usuario);

        return Ok(new LoginResponseDto(responseDto, token));
    }
}
