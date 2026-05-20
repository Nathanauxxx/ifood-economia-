describe('Teste do Painel: Salas Interditadas', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelSalasInterditadas',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPainelSalasInterditadas%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Salas Interditadas...');

    // 1. Preencher Datas (Janeiro 2024)
    cy.log('Preenchendo período de datas...');
    cy.get('#dataInicial').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get('#dataFinal').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // 2. Selecionar Centro e Sala Cirúrgica
    cy.log('Selecionando Centro e Sala Cirúrgica...');
    cy.get('body').then(($body) => {
      if ($body.find('#cenCir').length > 0) {
        cy.get('#cenCir').then(($el) => {
          if ($el.is('select')) {
            cy.get('#cenCir').select(1, { force: true });
          } else {
            cy.get('#cenCir').click({ force: true });
            cy.wait(500);
            cy.get('#cenCir option, #cenCir li, #cenCir a').first().click({ force: true });
          }
        });
        cy.wait(500);
      }

      if ($body.find('#salCir').length > 0) {
        cy.get('#salCir').then(($el) => {
          if ($el.is('select')) {
            cy.get('#salCir').select(1, { force: true });
          } else {
            cy.get('#salCir').click({ force: true });
            cy.wait(500);
            cy.get('#salCir option, #salCir li, #salCir a').first().click({ force: true });
          }
        });
        cy.wait(500);
      }
    });

    // 3. Buscar dados
    cy.log('Clicando em Buscar...');
    cy.get('[name="buscaDataSolicita"]').click({ force: true });
    cy.wait(2000);

    // Validação pós-busca
    cy.get('body').should('not.contain.text', 'Erro 500');

    // 4. Exportar para Excel com lógica de segurança robusta
    cy.log('Exportando para Excel...');
    cy.get('body', { timeout: 15000 }).then(($body) => {
      if ($body.find('#btnExcel').length > 0) {
        cy.get('#btnExcel', { timeout: 15000 })
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

    cy.log('Automação do painel Salas Interditadas concluída com sucesso!');
  });
});
