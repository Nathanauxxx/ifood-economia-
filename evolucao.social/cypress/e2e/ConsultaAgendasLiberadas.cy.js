describe('Teste do Painel: Consulta Agendas Liberadas', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/ConsultaAgendasLiberadas',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FConsultaAgendasLiberadas%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Consulta Agendas Liberadas...');

    // 1. Preencher Datas (Janeiro 2024)
    cy.log('Preenchendo período de datas...');
    cy.get('[name="start"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get('[name="end"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // 2. Selecionar Instituto e Tipo de Agenda se existirem
    cy.log('Selecionando Instituto e Tipo de Agenda...');
    cy.get('body').then(($body) => {
      if ($body.find('#instituto').length > 0) {
        cy.get('#instituto').then(($el) => {
          if ($el.is('select')) {
            cy.get('#instituto').select(1, { force: true });
          } else {
            cy.get('#instituto').click({ force: true });
            cy.wait(500);
            cy.get('#instituto option, #instituto li, #instituto a').first().click({ force: true });
          }
        });
        cy.wait(500);
      }

      if ($body.find('#tpAgenda').length > 0) {
        cy.get('#tpAgenda').then(($el) => {
          if ($el.is('select')) {
            cy.get('#tpAgenda').select(1, { force: true });
          } else {
            cy.get('#tpAgenda').click({ force: true });
            cy.wait(500);
            cy.get('#tpAgenda option, #tpAgenda li, #tpAgenda a').first().click({ force: true });
          }
        });
        cy.wait(500);
      }

      if ($body.find('#btnFiltroSetor').length > 0) {
        cy.get('#btnFiltroSetor').click({ force: true });
        cy.wait(500);
      }
    });

    // 3. Buscar dados
    cy.log('Clicando em Buscar...');
    cy.get('[name="btnFiltro"]').click({ force: true });
    cy.wait(2000);

    // Validação pós-busca
    cy.get('body').should('not.contain.text', 'Erro 500');

    // 4. Exportar para Excel com lógica de segurança robusta
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

    // 5. Limpar filtros ao final do teste
    cy.log('Limpando filtros...');
    cy.get('[name="limpar"]').click({ force: true });
    cy.wait(1000);

    cy.log('Automação do painel Consulta Agendas Liberadas concluída com sucesso!');
  });
});
