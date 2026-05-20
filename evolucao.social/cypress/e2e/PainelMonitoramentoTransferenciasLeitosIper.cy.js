describe('Teste do Painel: Painel de Monitoramento de Transferencias de Leitos IPER', () => {
  it.skip('Mapear seletores e fluxo principal', () => {
    const painelUrl = 'http://painelmvhomolog.phcnet.usp.br/PainelMonitoramentoTransferenciasLeitosIper';

    cy.log('TODO: validar URL real e completar automacao do painel.');
    cy.loginSeguroPainel({ painelUrl });
    cy.pause();
  });
});
