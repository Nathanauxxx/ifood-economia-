describe('Teste do Painel: Controle Transf.', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/ControleTransfusional'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Controle Transf...');

    // Preencher Datas (Janeiro 2024)
    cy.get('[name="start"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get('[name="end"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // Filtrar Unidade (Se houver botão para abrir)
    cy.get('body').then(($body) => {
      if ($body.find('#btnFiltroUnidade').length > 0) {
        cy.get('#btnFiltroUnidade').click({ force: true });
        cy.wait(500);
        // Tenta selecionar 'Todos' se o menu abrir
        if ($body.find('#checklist > :nth-child(1)').length > 0) {
          cy.get('#checklist > :nth-child(1)').click({ force: true });
          cy.get('#filtroUnidade').click({ force: true });
        }
      }
    });

    // Buscar dados (Assumindo que o sistema use um botão de filtrar padrão como [name="buscaDataSolicita"])
    cy.get('body').then(($body) => {
      if ($body.find('[name="buscaDataSolicita"]').length > 0) {
        cy.get('[name="buscaDataSolicita"]').click({ force: true });
        cy.wait(2000);
      }
    });

    // Exportar para Excel
    cy.get('body').then(($body) => {
      if ($body.find('#exportExcel').length > 0) {
        cy.get('#exportExcel').click({ force: true });
        cy.wait(1000);
      }
    });

    // PAUSA para conferência
    cy.log('Ações concluídas (Busca e Exportação). Clique em Resume (Play) para limpar.');
    cy.pause();

    // Limpar filtros
    cy.get('[name="btnLimpar"]').click({ force: true });

    cy.log('Automação concluída.');
  });
});
