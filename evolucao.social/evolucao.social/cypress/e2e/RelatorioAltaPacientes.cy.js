describe('Teste do Painel: Relatório de Alta de Pacientes', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelRelatorioAltaPacientes'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Relatório de Alta de Pacientes...');

    // Preencher Datas (Janeiro 2024)
    cy.get('[name="start"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get('[name="end"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

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

    // Limpar filtros
    cy.get('body').then(($body) => {
      if ($body.find('[name="limpar"]').length > 0) {
        cy.get('[name="limpar"]').click({ force: true });
      }
    });

    cy.log('Automação concluída.');
  });
});
