describe('Teste do Painel: Assistencial Fugulin', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/AssistencialFugulin'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do painel Assistencial Fugulin...');

    // Preencher Datas (Período menor para evitar travamento do servidor)
    cy.get('[name="start"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get('[name="end"]').clear({ force: true }).type('02/01/2024{enter}', { force: true });
    cy.wait(500);

    // Filtrar Unidade (Selecionar 'Todos' no checklist e aplicar filtro)
    cy.get('#btnFiltroUnidade').click({ force: true });
    cy.wait(500);
    cy.get('#checklist > :nth-child(1)').click({ force: true });
    cy.wait(500);
    cy.get('#filtroUnidade').click({ force: true });

    // Buscar dados
    cy.get('[name="buscaDataSolicita"]').click({ force: true });
    
    // Exportar para Excel
    cy.get('body').then(($body) => {
      if ($body.find('#exportExcel').length > 0) {
        cy.get('#exportExcel').click({ force: true });
        cy.wait(1000);
      }
    });

    // PAUSA: Para você ver a pesquisa sendo feita antes dele limpar a tela
    cy.log('Ações concluídas (Busca e Exportação). Clique no botão Resume (Play) do Cypress para limpar os filtros.');
    cy.pause();

    // Limpar filtros
    cy.get('[name="btnLimpar"]').click({ force: true });

    cy.log('Automação concluída.');
  });
});
