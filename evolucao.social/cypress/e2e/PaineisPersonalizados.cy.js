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
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelConsLancamentoBPAPAC',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPainelConsLancamentoBPAPAC%2F'
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
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/ConsultaAgendasLiberadas',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FConsultaAgendasLiberadas%2F'
    });

    cy.log('Iniciando automação do Painel Consulta Agendas Liberadas...');

    // 1. Preencher Datas (Janeiro 2024)
    cy.log('Preenchendo período de datas...');
    cy.get('[name="start"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get('[name="end"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // 2. Selecionar Instituto e Tipo de Agenda se existirem
    cy.log('Selecionando Instituto e Tipo de Agenda...');
    cy.get('body').then(($body) => {
      if ($body.find('#instituto').length > 0) {
        cy.get('#instituto').then(($el) => {
          if ($el.is('select')) {
            cy.get('#instituto').select(1, { force: true });
          } else {
            cy.get('#instituto').click({ force: true });
            cy.wait(500);
            cy.get('#instituto option, #instituto li, #instituto a').first().click({ force: true });
          }
        });
        cy.wait(500);
      }

      if ($body.find('#tpAgenda').length > 0) {
        cy.get('#tpAgenda').then(($el) => {
          if ($el.is('select')) {
            cy.get('#tpAgenda').select(1, { force: true });
          } else {
            cy.get('#tpAgenda').click({ force: true });
            cy.wait(500);
            cy.get('#tpAgenda option, #tpAgenda li, #tpAgenda a').first().click({ force: true });
          }
        });
        cy.wait(500);
      }

      if ($body.find('#btnFiltroSetor').length > 0) {
        cy.get('#btnFiltroSetor').click({ force: true });
        cy.wait(500);
      }
    });

    // 3. Buscar dados
    cy.log('Clicando em Buscar...');
    cy.get('[name="btnFiltro"]').click({ force: true });
    cy.wait(2000);

    // Validação pós-busca
    cy.get('body').should('not.contain.text', 'Erro 500');

    // 4. Exportar para Excel com lógica de segurança robusta
    cy.log('Exportando para Excel...');
    cy.get('body', { timeout: 15000 }).then(($body) => {
      if ($body.find('#exportExcel').length > 0) {
        cy.get('#exportExcel', { timeout: 15000 })
          .first()
          .scrollIntoView()
          .click({ force: true });
        cy.wait(1500);
      }
    });

    // 5. Limpar filtros ao final do teste
    cy.log('Limpando filtros...');
    cy.get('[name="limpar"]').click({ force: true });
    cy.wait(1000);

    cy.log('Automação do painel Consulta Agendas Liberadas concluída com sucesso!');
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
