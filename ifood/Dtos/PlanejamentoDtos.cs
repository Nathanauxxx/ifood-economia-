using System;
using System.Collections.Generic;

namespace ifood.Dtos;

public record PrevisaoGastoDto(
    decimal TotalDespesasMesAtual,
    decimal TotalReceitasMesAtual,
    int DiasDecorridos,
    int DiasNoMes,
    decimal GastoMedioDiario,
    decimal GastoProjetadoMensal,
    string StatusPrevisao,
    string AlertaMensagem
);

public record MetasEconomiaDto(
    decimal TotalReceitas,
    decimal TotalDespesas,
    decimal SaldoMes,
    decimal TaxaEconomiaAtual, // Porcentagem do salário economizada
    decimal ValorEconomizado,
    decimal MetaEconomiaSugerida, // Porcentagem recomendada (ex: 20%)
    decimal ValorMetaSugerida, // Valor correspondente à meta recomendada
    decimal GastosAlimentacaoDelivery, // Gastos na categoria culinária/Alimentação
    decimal EconomiaPotencialIfood, // Se diminuir 15% dos pedidos do iFood
    List<string> DicasEconomia
);
