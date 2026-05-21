describe('Teste do Painel: Painel Moodle', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'COLOQUE_A_URL_AQUI'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Acesso ao Painel para captura de seletores', () => {
    cy.log('Painel carregado. Pegue os seletores dos botões aqui.');
    cy.pause(); // O Cypress vai parar aqui para você inspecionar a tela
  });
});
//esta com problema