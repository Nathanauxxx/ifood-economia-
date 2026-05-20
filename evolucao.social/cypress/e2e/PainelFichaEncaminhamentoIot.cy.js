describe('Teste do Painel: Painel Ficha Encaminhamento IOT', () => {
  it.skip('Mapear seletores e fluxo principal', () => {
    const painelUrl = 'http://painelmvhomolog.phcnet.usp.br/PainelFichaEncaminhamentoIot';

    cy.log('TODO: validar URL real e completar automacao do painel.');
    cy.loginSeguroPainel({ painelUrl });
    cy.pause();
  });
});
