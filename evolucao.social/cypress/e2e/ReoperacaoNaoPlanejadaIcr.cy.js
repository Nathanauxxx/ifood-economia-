describe('Teste do Painel: Reoperacao Nao Planejada ICR', () => {
  it.skip('Mapear seletores e fluxo principal', () => {
    const painelUrl = 'http://painelmvhomolog.phcnet.usp.br/ReoperacaoNaoPlanejadaIcr';

    cy.log('TODO: validar URL real e completar automacao do painel.');
    cy.loginSeguroPainel({ painelUrl });
    cy.pause();
  });
});
