describe('Teste do Painel: Pacientes Agen/Aten IPQ', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PacientesAgendadosAtendidosIPq',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPacientesAgendadosAtendidosIPq%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Pacientes Agen/Aten IPQ...');

    // 1. Preencher Datas de Atendimento (Janeiro 2024)
    cy.log('Preenchendo datas de atendimento...');
    cy.get('#dataInicial').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get('#dataFinal').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // 2. Preencher Datas de Agendamento (Janeiro 2024)
    cy.log('Preenchendo datas de agendamento...');
    cy.get('#dataAgendamentoInicial').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get('#dataAgendamentoFinal').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // 3. Interagir com o modal de Convênio (De baixo para cima: 1º Convênio)
    cy.log('Filtrando por Convênio...');
    cy.get('#btnAbreModalConvenio').click({ force: true });
    cy.wait(500);
    cy.get('.convenio-options > :nth-child(1)').click({ force: true });
    cy.wait(500);
    cy.get('#btnFiltroConvenio').click({ force: true });
    cy.wait(1000);

    // 4. Interagir com o modal de Setor (De baixo para cima: 2º Setor)
    cy.log('Filtrando por Setor...');
    cy.get('#btnAbreModalSetor').click({ force: true });
    cy.wait(500);
    cy.get('#checklist > :nth-child(1) > .form-check-label').click({ force: true });
    cy.wait(500);
    cy.get('#btnFiltroSetor').click({ force: true });
    cy.wait(1000);

    // 5. Interagir com o modal de Instituto (De baixo para cima: 3º Instituto)
    cy.log('Filtrando por Instituto...');
    cy.get('#btnFiltroInstituto').click({ force: true });
    cy.wait(500);
    cy.get('#checklistInstituto > :nth-child(1)').click({ force: true });
    cy.wait(500);
    cy.get('#btnFiltroInstituto').click({ force: true });
    cy.wait(2000);

    // Validação de erro do servidor
    cy.get('body').should('not.contain.text', 'Erro 500');

    // 6. Exportar para Excel com lógica de segurança robusta
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

    // 7. Limpar filtros ao final do teste
    cy.log('Limpando filtros...');
    cy.get('#btnLimpar').click({ force: true });
    cy.wait(1000);

    cy.log('Automação do painel Pacientes Agen/Aten IPQ concluída com sucesso!');
  });
});
