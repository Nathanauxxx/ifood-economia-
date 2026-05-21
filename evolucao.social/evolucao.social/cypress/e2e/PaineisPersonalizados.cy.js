describe('Teste dos Painéis Personalizados (Skeletons interativos)', () => {

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  /* ==========================================================================
     1. Painel de Consulta dos Lançamentos BPA APAC
     ========================================================================== */
  it('1. Painel de Consulta dos Lançamentos BPA APAC', () => {
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelConsLancamentoBPAAPAC'
    });
    cy.log('Acesso ao Painel Lançamentos BPA APAC para captura de seletores.');
    cy.pause(); // O Cypress vai parar aqui para você inspecionar a tela
  });

  /* ==========================================================================
     2. Painel Notificação Compulsória
     ========================================================================== */
  it('2. Painel Notificação Compulsória', () => {
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelNotificacaoCompulsoria'
    });
    cy.log('Acesso ao Painel Notificação Compulsória para captura de seletores.');
    cy.pause();
  });

  /* ==========================================================================
     3. Parecer Médico
     ========================================================================== */
  it('3. Parecer Médico', () => {
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/ParecerMedico'
    });
    cy.log('Acesso ao Parecer Médico para captura de seletores.');
    cy.pause();
  });

  /* ==========================================================================
     4. Painel Relatório de Alta de Pacientes
     ========================================================================== */
  it('4. Painel Relatório de Alta de Pacientes', () => {
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelRelatorioAltaPacientes'
    });
    cy.log('Acesso ao Painel Relatório de Alta de Pacientes para captura de seletores.');
    cy.pause();
  });

  /* ==========================================================================
     5. Triagem Fisioterapia Ambulatorial
     ========================================================================== */
  it('5. Triagem Fisioterapia Ambulatorial', () => {
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/TriagemFisioAmbulatorial'
    });
    cy.log('Acesso ao painel Triagem fisioterapia ambulatorial para captura de seletores.');
    cy.pause();
  });

  /* ==========================================================================
     6. Relatório Assistencial
     ========================================================================== */
  it('6. Relatório Assistencial', () => {
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/RelatorioAssistencial'
    });
    cy.log('Acesso ao Relatório Assistencial para captura de seletores.');
    cy.pause();
  });

  /* ==========================================================================
     7. Consulta Agendas Liberadas
     ========================================================================== */
  it('7. Consulta Agendas Liberadas', () => {
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/ConsultaAgendasLiberadas'
    });
    cy.log('Acesso à Consulta Agendas Liberadas para captura de seletores.');
    cy.pause();
  });

  /* ==========================================================================
     8. Pacientes Agendados e Atendidos ICHC
     ========================================================================== */
  it('8. Pacientes Agendados e Atendidos ICHC', () => {
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PacientesAgendadosAtendidosICHC'
    });
    cy.log('Acesso aos Pacientes Agendados e Atendidos ICHC para captura de seletores.');
    cy.pause();
  });

  /* ==========================================================================
     9. Pacientes Agen/Aten IPQ
     ========================================================================== */
  it('9. Pacientes Agen/Aten IPQ', () => {
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PacientesAgenAtenIPQ'
    });
    cy.log('Acesso a Pacientes Agen/Aten IPQ para captura de seletores.');
    cy.pause();
  });

  /* ==========================================================================
     10. Prod. Internação IPQ
     ========================================================================== */
  it('10. Prod. Internação IPQ', () => {
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/ProdInternacaoIPQ'
    });
    cy.log('Acesso a Prod. Internação IPQ para captura de seletores.');
    cy.pause();
  });

  /* ==========================================================================
     11. Painel Evoluções Médicas IOT
     ========================================================================== */
  it('11. Painel Evoluções Médicas IOT', () => {
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelEvolucoesMedicasIOT'
    });
    cy.log('Acesso ao Painel Evoluções Médicas IOT para captura de seletores.');
    cy.pause();
  });

  /* ==========================================================================
     12. Fonoaudiologia
     ========================================================================== */
  it('12. Fonoaudiologia', () => {
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/Fonoaudiologia'
    });
    cy.log('Acesso ao Painel Fonoaudiologia para captura de seletores.');
    cy.pause();
  });

  /* ==========================================================================
     13. Painel Salas Interditadas
     ========================================================================== */
  it('13. Painel Salas Interditadas', () => {
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelSalasInterdit'
    });
    cy.log('Acesso ao Painel Salas Interdit. para captura de seletores.');
    cy.pause();
  });

});
