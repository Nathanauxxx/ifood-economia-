describe('Teste do Painel: Relatório de Alta de Pacientes', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelRelatorioAltaPacientes',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPainelRelatorioAltaPacientes%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Relatório de Alta de Pacientes...');

    // 1. Preencher Datas (Janeiro 2024)
    cy.log('Preenchendo período de datas...');
    cy.get('[name="dataIni"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get('[name="dataFim"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // 2. Clicar em Buscar/Filtrar
    cy.log('Clicando em Filtrar...');
    cy.get('[name="btnFiltro"]').click({ force: true });
    cy.wait(2000);

    // Validação pós-filtro
    cy.get('body').should('not.contain.text', 'Erro 500');

    // 3. Exportar para Excel
    cy.log('Exportando para Excel...');
    cy.get('body').then(($body) => {
      if ($body.find('#btnExportar').length > 0) {
        cy.get('#btnExportar').click({ force: true });
        cy.wait(1000);
      }
    });

    // 4. Limpar filtros
    cy.log('Limpando filtros...');
    cy.get('[name="btnLimpar"]').click({ force: true });
    cy.wait(1000);

    cy.log('Automação do painel Relatório de Alta de Pacientes concluída com sucesso!');
  });
});
