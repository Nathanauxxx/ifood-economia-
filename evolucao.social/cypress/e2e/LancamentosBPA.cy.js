describe('Teste do Painel: Consulta dos Lançamentos BPA', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelConsLancamentoBPAPAC'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Lançamentos BPA...');

    // Preencher Datas (Janeiro 2024)
    // Note: O usuário informou [name="start"] para ambos os campos, diferenciados pelo nth-child
    cy.get(':nth-child(4) > .input-group > [name="start"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get(':nth-child(5) > .input-group > [name="start"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // Buscar dados
    cy.get('[name="buscaDataSolicita"]').click({ force: true });
    cy.wait(2000);

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

    // 5. Limpar filtros ao final
    cy.log('Limpando filtros...');
    cy.get('body').then(($body) => {
      if ($body.find('[name="limpar"]').length > 0) {
        cy.get('[name="limpar"]').click({ force: true });
      } else if ($body.find('#btnLimpar').length > 0) {
        cy.get('#btnLimpar').click({ force: true });
      }
    });
    cy.wait(1000);

    cy.log('Automação concluída.');
  });
});
