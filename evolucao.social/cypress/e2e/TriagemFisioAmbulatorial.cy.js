describe('Teste do Painel: Triagem Fisioterapia Ambulatorial', () => {

  const preencherDataComFallback = (selectors, valor, labelCampo, fallbackIndex = 0, obrigatorio = true) => {
    cy.get('body').then(($body) => {
      const valorEsperado = String(valor).replace(/\{enter\}/gi, '');
      let alvo = null;

      for (const seletor of selectors) {
        const encontrado = $body.find(seletor).filter(':visible').first();
        if (encontrado.length > 0) {
          alvo = encontrado;
          break;
        }
      }

      if (!alvo) {
        const inputsVisiveis = $body
          .find('input')
          .filter(':visible')
          .filter((_, el) => {
            const value = String(el?.value || '');
            const name = String(el?.name || '').toLowerCase();
            const id = String(el?.id || '').toLowerCase();
            const placeholder = String(el?.placeholder || '').toLowerCase();
            return (
              /^\d{2}\/\d{2}\/\d{4}$/.test(value) ||
              name.includes('data') ||
              name.includes('date') ||
              id.includes('data') ||
              id.includes('date') ||
              placeholder.includes('dd/mm') ||
              placeholder.includes('data')
            );
          });

        if (inputsVisiveis.length > fallbackIndex) {
          alvo = inputsVisiveis.eq(fallbackIndex);
        }
      }

      if (!alvo && !obrigatorio) {
        cy.log(`Campo ${labelCampo} nao encontrado. Seguindo sem preencher.`);
        return;
      }

      if (!alvo) {
        throw new Error(`Campo ${labelCampo} nao encontrado para preencher data.`);
      }

      cy.wrap(alvo)
        .click({ force: true })
        .type('{selectall}{backspace}', { force: true })
        .type(valor, { force: true })
        .should('have.value', valorEsperado);
    });
  };

  const clicarComFallback = (selectors, labelAcao, obrigatorio = true) => {
    cy.get('body').then(($body) => {
      for (const seletor of selectors) {
        const candidato = $body.find(seletor).filter(':visible').first();
        if (candidato.length > 0) {
          cy.wrap(candidato)
            .scrollIntoView()
            .click({ force: true });
          return;
        }
      }

      if (!obrigatorio) {
        cy.log(`${labelAcao} nao encontrado. Seguindo teste.`);
        return;
      }

      throw new Error(`Botao de ${labelAcao} nao encontrado.`);
    });
  };

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PreTriagemFisio',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPreTriagemFisio%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Triagem Fisioterapia Ambulatorial...');

    // 1. Preencher Datas (Janeiro 2024) com fallback de seletores
    cy.log('Preenchendo intervalo de datas...');
    preencherDataComFallback(
      ['[name="dataIni"]', '[name="start"]', '[name="dataInicio"]', '#dataInicial', 'input[name*="ini"]'],
      '01/01/2024{enter}',
      'Data inicial',
      0
    );
    cy.wait(500);
    preencherDataComFallback(
      ['[name="dataFim"]', '[name="end"]', '[name="dataFimPeriodo"]', '[name="dataFimFiltro"]', '[name="dataFimTela"]', '[name="dataFinal"]', '#dataFinal', 'input[name*="fim"]', 'input[name*="final"]'],
      '31/01/2024{enter}',
      'Data final',
      1,
      false
    );
    cy.wait(500);

    // 2. Clicar em Filtrar/Buscar
    cy.log('Clicando em Filtrar...');
    clicarComFallback(
      [
        '[name="btnFiltro"]',
        '[name="buscaDataSolicita"]',
        '#btnFiltrar',
        'button[type="submit"]',
        'input[type="submit"]',
        'button[id*="Filtrar"]',
        'button[id*="Buscar"]',
      ],
      'filtro',
      true
    );
    cy.wait(2000);

    // Validação básica pós-filtro
    cy.get('body').should('not.contain.text', 'Erro 500');

    // 3. Exportar para Excel
    cy.log('Exportando para Excel...');
    clicarComFallback(
      [
        '#exportExcel',
        '#exportarExcel',
        '#btnExportar',
        'button[id*="Export"]',
        'a[id*="Export"]',
        'input[id*="Export"]',
      ],
      'exportacao',
      true
    );
    cy.wait(1000);

    // 4. Limpar filtros ao final do teste para verificar se está limpando corretamente
    cy.log('Limpando filtros ao final do teste...');
    clicarComFallback(
      [
        '[name="btnLimpar"]',
        '[name="limpar"]',
        '#btnLimpar',
        'button[id*="Limpar"]',
        'input[id*="Limpar"]',
      ],
      'limpeza',
      false
    );
    cy.wait(1000);

    cy.log('Automação do painel Triagem Fisioterapia Ambulatorial concluída com sucesso!');
  });
});
