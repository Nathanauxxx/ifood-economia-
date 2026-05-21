describe('Teste do Painel: Quimioterapia', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/Quimioterapia'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Quimioterapia...');

    // Preencher Datas (Janeiro 2024)
    cy.get('[name="start"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get('[name="end"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // Selecionar Unidade (Se for um select #unidInt)
    cy.get('body').then(($body) => {
      if ($body.find('#unidInt').length > 0) {
        cy.get('#unidInt').then(($select) => {
          if ($select.is('select')) {
            const options = $select.find('option').map((i, el) => el.value).get();
            const val = options.find(v => v !== '') || options[0];
            cy.get('#unidInt').select(val, { force: true });
          } else {
            cy.get('#unidInt').click({ force: true });
          }
        });
      }
    });

    // Buscar dados
    cy.get('[name="buscaDataSolicita"]').click({ force: true });
    cy.wait(2000);

    // Exportar (Usando o seletor .dt-button > span fornecido)
    cy.get('body').then(($body) => {
      if ($body.find('.dt-button > span').length > 0) {
        cy.get('.dt-button > span').first().click({ force: true });
        cy.wait(1000);
      }
    });

    // PAUSA para conferência
    cy.log('Ações concluídas (Filtros e Exportação). Clique em Resume (Play) para limpar.');
    cy.pause();

    // Limpar filtros (Tentando seletores comuns)
    cy.get('body').then(($body) => {
      if ($body.find('[name="limpar"]').length > 0) {
        cy.get('[name="limpar"]').click({ force: true });
      } else if ($body.find('[name="btnLimpar"]').length > 0) {
        cy.get('[name="btnLimpar"]').click({ force: true });
      }
    });

    cy.log('Automação concluída.');
  });
});
