describe('Teste do Painel: Painel Previsao Alta Enfermaria', () => {
  it.skip('Mapear seletores e fluxo principal', () => {
    const painelUrl = 'http://painelmvhomolog.phcnet.usp.br/PainelPrevisaoAltaEnfermaria';

    cy.log('TODO: validar URL real e completar automacao do painel.');
    cy.loginSeguroPainel({ painelUrl });
    cy.pause();
  });
});
