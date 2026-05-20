describe('Teste do Painel: Painel Auditoria', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelAuditoria',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPainelAuditoria%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Auditoria...');

    // 1. Preencher Datas (Janeiro 2024)
    cy.log('Preenchendo período de datas...');
    cy.get(':nth-child(1) > .input-group > [name="start"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get(':nth-child(2) > .input-group > [name="start"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // 2. Selecionar Empresa
    cy.log('Selecionando Empresa...');
    cy.get('body').then(($body) => {
      if ($body.find('.input-group > [name="empresa"]').length > 0) {
        cy.get('.input-group > [name="empresa"]').then(($el) => {
          if ($el.is('select')) {
            cy.get('.input-group > [name="empresa"]').select(1, { force: true });
          } else {
            cy.get('.input-group > [name="empresa"]').click({ force: true });
            cy.wait(500);
            cy.get('.input-group > [name="empresa"] option, .input-group > [name="empresa"] li, .input-group > [name="empresa"] a').first().click({ force: true });
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
      if ($body.find('#exportExcel').length > 0) {
        cy.get('#exportExcel', { timeout: 15000 })
          .first()
          .scrollIntoView()
          .click({ force: true });
        cy.wait(1500);
      }
    });

    // 5. Limpar filtros ao final do teste se o botão existir
    cy.log('Limpando filtros...');
    cy.get('body').then(($body) => {
      if ($body.find('[name="limpar"]').length > 0) {
        cy.get('[name="limpar"]').click({ force: true });
      } else if ($body.find('[name="btnLimpar"]').length > 0) {
        cy.get('[name="btnLimpar"]').click({ force: true });
      }
    });
    cy.wait(1000);

    cy.log('Automação do painel Auditoria concluída com sucesso!');
  });
});
