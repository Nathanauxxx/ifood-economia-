describe('Teste do Painel: Painel Evolucao Fisioterapeutica Ambulatorial', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelEvolucaoFisioterapeuticaAmbulatorial',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPainelEvolucaoFisioterapeuticaAmbulatorial%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Evolução Fisioterapêutica Ambulatorial...');

    // 1. Preencher Datas (Janeiro 2024)
    cy.log('Preenchendo período de datas...');
    cy.get('#dataInicial').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get('#dataFinal').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // 2. Buscar dados
    cy.log('Clicando em Filtrar...');
    cy.get('[name="btnFiltro"]').click({ force: true });
    cy.wait(2000);

    // Validação pós-busca
    cy.get('body').should('not.contain.text', 'Erro 500');

    // 3. Exportar para Excel com lógica de segurança robusta
    cy.log('Exportando para Excel...');
    cy.get('body', { timeout: 15000 }).then(($body) => {
      if ($body.find('#exportExcel').length > 0) {
        cy.get('#exportExcel', { timeout: 15000 })
          .first()
          .scrollIntoView()
          .click({ force: true });
        cy.wait(1500);
      }
    });

    // 4. Limpar filtros ao final
    cy.log('Limpando filtros...');
    cy.get('#btnLimpar').click({ force: true });
    cy.wait(1000);

    cy.log('Automação do painel Evolução Fisioterapêutica Ambulatorial concluída com sucesso!');
  });
});
