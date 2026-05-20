describe('Teste do Painel: Parecer Médico', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/ParecerMedico',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FParecerMedico%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Parecer Médico...');

    // 1. Preencher Datas (Janeiro 2024)
    cy.log('Preenchendo intervalo de datas...');
    cy.get('.input-group > [name="dataInicio"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get('.input-group > [name="dataFim"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // 2. Clicar em Filtrar/Buscar (usando seletores de busca comuns)
    cy.log('Clicando em Filtrar...');
    cy.get('body').then(($body) => {
      if ($body.find('[name="btnFiltro"]').length > 0) {
        cy.get('[name="btnFiltro"]').click({ force: true });
      } else if ($body.find('[name="buscaDataSolicita"]').length > 0) {
        cy.get('[name="buscaDataSolicita"]').click({ force: true });
      } else if ($body.find('#btnFiltrar').length > 0) {
        cy.get('#btnFiltrar').click({ force: true });
      } else {
        cy.get('button[type="submit"]').first().click({ force: true });
      }
    });
    cy.wait(2000);

    // Validação básica pós-filtro
    cy.get('body').should('not.contain.text', 'Erro 500');
    // 3. Exportar para Excel
    cy.log('Exportando para Excel...');
    cy.get('body', { timeout: 15000 }).then(($body) => {
      if ($body.find('#exportExcel').length > 0) {
        cy.get('#exportExcel', { timeout: 15000 })
          .first()
          .scrollIntoView()
          .then(($btn) => {
            if ($btn.is(':disabled')) {
              cy.log('Botao #exportExcel veio desabilitado. Aplicando clique forcado.');
            }
            cy.wrap($btn).click({ force: true });
          });
      } else if ($body.find('#exportarExcel').length > 0) {
        cy.get('#exportarExcel', { timeout: 15000 })
          .first()
          .scrollIntoView()
          .then(($btn) => {
            if ($btn.is(':disabled')) {
              cy.log('Botao #exportarExcel veio desabilitado. Aplicando clique forcado.');
            }
            cy.wrap($btn).click({ force: true });
          });
      } else {
        cy.contains('button, a, input', /exportar|excel/i)
          .first()
          .scrollIntoView()
          .click({ force: true });
      }
    });
    cy.wait(1500);

    // 4. Limpar filtros
    cy.log('Limpando filtros...');
    cy.get('[name="limpar"]').click({ force: true });
    cy.wait(1000);

    cy.log('Automação do painel Parecer Médico concluída com sucesso!');
  });
});
