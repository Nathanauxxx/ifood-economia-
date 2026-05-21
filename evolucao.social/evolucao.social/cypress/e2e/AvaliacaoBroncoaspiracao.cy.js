describe('Teste do Painel: Avaliação de Broncoaspiração', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelAvalBroncoAsp'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Avaliação de Broncoaspiração...');

    // Preencher Datas de Avaliação (Janeiro 2024)
    cy.get('[name="dataIniAval"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.get('[name="dataFimAval"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // Preencher Datas de Internação (Janeiro 2024)
    cy.get('[name="dataIniInter"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.get('[name="dataFimInter"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // Filtrar
    cy.get('#btnFiltrar').click({ force: true });
    cy.wait(2000);

    // Exportar para Excel (Seguindo o padrão de exportar no final)
    cy.get('body').then(($body) => {
      if ($body.find('#btnExportar').length > 0) {
        cy.get('#btnExportar').click({ force: true });
        cy.wait(1000);
      }
    });

    // PAUSA para conferência
    cy.log('Ações concluídas (Filtros e Exportação). Clique em Resume (Play) para limpar.');
    cy.pause();

    // Limpar filtros
    cy.get('#btnLimpar').click({ force: true });

    cy.log('Automação concluída.');
  });
});
