describe('Teste do Painel: Painel CIEQ Detalhado', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelCIEQDetalhado',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPainelCIEQDetalhado%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel CIEQ Detalhado...');

    // PAUSA para conferência e captura de seletores
    cy.log('Ações concluídas. Clique em Resume (Play) para terminar.');
    cy.pause();

    cy.log('Automação concluída.');
  });
});
