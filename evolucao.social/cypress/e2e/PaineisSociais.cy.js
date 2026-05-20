describe('Teste do Painel: Paineis Sociais', () => {
  it.skip('Mapear seletores e fluxo principal', () => {
    const painelUrl = 'http://painelmvhomolog.phcnet.usp.br/PaineisSociais';

    cy.log('TODO: validar URL real e completar automacao do painel.');
    cy.loginSeguroPainel({ painelUrl });
    cy.pause();
  });
});
