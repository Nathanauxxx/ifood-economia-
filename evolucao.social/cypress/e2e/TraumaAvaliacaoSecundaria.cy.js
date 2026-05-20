describe('Teste do Painel: Trauma - Avaliacao Secundaria', () => {
  it.skip('Mapear seletores e fluxo principal', () => {
    const painelUrl = 'http://painelmvhomolog.phcnet.usp.br/TraumaAvaliacaoSecundaria';

    cy.log('TODO: validar URL real e completar automacao do painel.');
    cy.loginSeguroPainel({ painelUrl });
    cy.pause();
  });
});
