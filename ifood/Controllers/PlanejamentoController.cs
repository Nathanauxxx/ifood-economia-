using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ifood.Infrastructure.Data;
using ifood.Dtos;

using ifood.Domain.Repositories;

namespace ifood.Controllers;

[Authorize]
[ApiController]
[Route("api/planejamento")]
public class PlanejamentoController : ControllerBase
{
    private readonly ITransacaoRepository _transacaoRepository;

    public PlanejamentoController(ITransacaoRepository transacaoRepository)
    {
        _transacaoRepository = transacaoRepository;
    }

    private Guid ObterUsuarioId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(idClaim) || !Guid.TryParse(idClaim, out var usuarioId))
        {
            throw new UnauthorizedAccessException("Usuário não autenticado ou ID inválido.");
        }
        return usuarioId;
    }

    [HttpGet("previsao-mensal")]
    public async Task<ActionResult<PrevisaoGastoDto>> ObterPrevisaoMensal()
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

        var hoje = DateTime.UtcNow;
        var primeiroDiaMes = new DateTime(hoje.Year, hoje.Month, 1);
        var ultimoDiaMes = primeiroDiaMes.AddMonths(1).AddDays(-1);

        // Obter todas as transações do usuário no mês atual
        var transacoesDoMesEnumerable = await _transacaoRepository.ListarFiltradoAsync(
            usuarioId, primeiroDiaMes, ultimoDiaMes, null, null);
        var transacoesDoMes = transacoesDoMesEnumerable.ToList();

        var totalDespesas = transacoesDoMes.Where(t => t.Tipo == "Despesa").Sum(t => t.Valor);
        var totalReceitas = transacoesDoMes.Where(t => t.Tipo == "Receita").Sum(t => t.Valor);

        int diasDecorridos = hoje.Day;
        int diasNoMes = ultimoDiaMes.Day;

        // Se o mês acabou de começar, considerar pelo menos 1 dia decorrido para evitar divisão por zero
        if (diasDecorridos == 0) diasDecorridos = 1;

        decimal gastoMedioDiario = totalDespesas / diasDecorridos;
        decimal gastoProjetadoMensal = gastoMedioDiario * diasNoMes;

        // Limita casas decimais
        gastoMedioDiario = Math.Round(gastoMedioDiario, 2);
        gastoProjetadoMensal = Math.Round(gastoProjetadoMensal, 2);

        string statusPrevisao;
        string alertaMensagem;

        if (totalReceitas == 0)
        {
            statusPrevisao = "Defina sua receita";
            alertaMensagem = "Você ainda não registrou receitas para este mês no iFood Economia. Adicione suas receitas para comparar com as projeções de gastos!";
        }
        else if (gastoProjetadoMensal > totalReceitas)
        {
            statusPrevisao = "Alerta de Déficit";
            alertaMensagem = $"Cuidado! Se você continuar gastando neste ritmo, terminará o mês com um saldo negativo de R$ {Math.Round(gastoProjetadoMensal - totalReceitas, 2)}! Recomendamos cortar pedidos de iFood supérfluos.";
        }
        else if (gastoProjetadoMensal > (totalReceitas * 0.85m))
        {
            statusPrevisao = "Atenção: Margem Estreita";
            alertaMensagem = "Sua projeção de gastos está consumindo mais de 85% da sua receita deste mês. Tente economizar em categorias com maior peso, como delivery ou lazer!";
        }
        else
        {
            statusPrevisao = "Dentro do Planejado";
            alertaMensagem = "Excelente! Sua projeção de gastos está controlada. Você está no caminho certo para poupar este mês!";
        }

        return Ok(new PrevisaoGastoDto(
            totalDespesas,
            totalReceitas,
            diasDecorridos,
            diasNoMes,
            gastoMedioDiario,
            gastoProjetadoMensal,
            statusPrevisao,
            alertaMensagem
        ));
    }

    [HttpGet("economia")]
    public async Task<ActionResult<MetasEconomiaDto>> ObterMetasEconomia()
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

        var hoje = DateTime.UtcNow;
        var primeiroDiaMes = new DateTime(hoje.Year, hoje.Month, 1);
        var ultimoDiaMes = primeiroDiaMes.AddMonths(1).AddDays(-1);

        // Transações do mês
        var transacoesDoMesEnumerable = await _transacaoRepository.ListarFiltradoAsync(
            usuarioId, primeiroDiaMes, ultimoDiaMes, null, null);
        var transacoesDoMes = transacoesDoMesEnumerable.ToList();

        var totalReceitas = transacoesDoMes.Where(t => t.Tipo == "Receita").Sum(t => t.Valor);
        var totalDespesas = transacoesDoMes.Where(t => t.Tipo == "Despesa").Sum(t => t.Valor);
        var saldoMes = totalReceitas - totalDespesas;
        var valorEconomizado = saldoMes > 0 ? saldoMes : 0;

        decimal taxaEconomiaAtual = 0;
        if (totalReceitas > 0)
        {
            taxaEconomiaAtual = (valorEconomizado / totalReceitas) * 100m;
        }

        taxaEconomiaAtual = Math.Round(taxaEconomiaAtual, 2);

        // Meta recomendada: 20% do orçamento
        decimal metaEconomiaSugerida = 20m;
        decimal valorMetaSugerida = Math.Round(totalReceitas * (metaEconomiaSugerida / 100m), 2);

        // Identificar gastos com alimentação, delivery e iFood especificamente
        // Categoria 4 é Categoria Padrão de Alimentação (também buscamos por palavras-chave na descrição)
        var gastosAlimentacao = transacoesDoMes
            .Where(t => t.Tipo == "Despesa" && 
                        (t.CategoriaId == 4 || 
                         t.Descricao.ToLower().Contains("ifood") || 
                         t.Descricao.ToLower().Contains("delivery") || 
                         t.Descricao.ToLower().Contains("restaurante") || 
                         t.Descricao.ToLower().Contains("burguer") || 
                         t.Descricao.ToLower().Contains("pizza")))
            .Sum(t => t.Valor);

        // Se o usuário reduzir o consumo de delivery/alimentação supérflua em 15%
        decimal economiaPotencialIfood = Math.Round(gastosAlimentacao * 0.15m, 2);

        // Dicas personalizadas dinamicamente baseado no perfil de gastos do usuário!
        var dicas = new List<string>();

        if (gastosAlimentacao > (totalReceitas * 0.3m) && totalReceitas > 0)
        {
            dicas.Add("Seus gastos com iFood e Alimentação representam uma fatia muito alta da sua renda (mais de 30%). Tente programar compras de supermercado e cozinhar em casa durante a semana!");
        }
        else if (gastosAlimentacao > 0)
        {
            dicas.Add($"Você gastou R$ {gastosAlimentacao} em delivery/alimentação este mês. Reduzir as compras no iFood em apenas 15% trará uma economia de R$ {economiaPotencialIfood} mensais que você poderá investir!");
        }
        else
        {
            dicas.Add("Adicione seus gastos de delivery usando a categoria 'Alimentação' e colocando descrições como 'iFood' para receber simulações mais detalhadas.");
        }

        if (taxaEconomiaAtual >= metaEconomiaSugerida)
        {
            dicas.Add("Parabéns! Você ultrapassou a recomendação clássica da regra dos 50/30/20 e economizou mais de 20% da sua renda atual!");
        }
        else if (totalReceitas > 0)
        {
            dicas.Add($"Para atingir a rule-of-thumb financeira de economizar {metaEconomiaSugerida}%, seu foco de poupança deve ser de R$ {valorMetaSugerida} este mês. Atualmente, faltam R$ {Math.Max(0, valorMetaSugerida - valorEconomizado)}.");
        }

        dicas.Add("Dica iFood Economia: Aproveite os cupons de frete grátis do iFood Club e busque por produtos com o selo 'Super Restaurante' com melhor custo benefício para otimizar suas refeições.");
        dicas.Add("Evite compras por impulso à noite no iFood. Deixe refeições pré-prontas no congelador para os dias de cansaço extremo.");

        return Ok(new MetasEconomiaDto(
            totalReceitas,
            totalDespesas,
            saldoMes,
            taxaEconomiaAtual,
            valorEconomizado,
            metaEconomiaSugerida,
            valorMetaSugerida,
            gastosAlimentacao,
            economiaPotencialIfood,
            dicas
        ));
    }
}
