describe('Teste do Painel: Painel PAV', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelPAV',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPainelPAV%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel PAV...');

    // Filtrar Unidade (Selecionar 'Todos' no checklist)
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

    // Buscar dados
    cy.get('[name="btnFiltro"]').click({ force: true });
    cy.wait(2000);

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

    // Limpar filtros (Tentando seletores comuns)
    cy.get('body').then(($body) => {
      if ($body.find('[name="limpar"]').length > 0) {
        cy.get('[name="limpar"]').click({ force: true });
      } else if ($body.find('#btnLimpar').length > 0) {
        cy.get('#btnLimpar').click({ force: true });
      }
    });

    cy.log('Automação concluída.');
  });
});
