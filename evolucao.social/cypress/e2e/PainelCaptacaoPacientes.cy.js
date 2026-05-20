describe('Teste do Painel: Painel Captacao de Pacientes', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelCaptacaoPaciente',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPainelCaptacaoPaciente%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Captacao de Pacientes...');

    // 1. Preencher Datas (Janeiro 2024)
    cy.log('Preenchendo período de datas...');
    cy.get('[name="start"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get('[name="end"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // 2. Interagir com Tipo de Resposta e Unidade
    cy.log('Selecionando Tipo de Resposta...');
    cy.get(':nth-child(1) > [name="tpResposta"]').click({ force: true });
    cy.wait(500);

    cy.log('Selecionando Unidade...');
    cy.get('body').then(($body) => {
      if ($body.find('#filtroUnidade').length > 0) {
        cy.get('#filtroUnidade').click({ force: true });
        cy.wait(500);
        
        // Se abrir um modal, clicamos na primeira opção válida e confirmamos
        cy.get('body').then(($modalBody) => {
          const itemSelect = ':nth-child(1) > .form-check-label';
          if ($modalBody.find(itemSelect).length > 0) {
            cy.get(itemSelect).first().click({ force: true });
            cy.wait(500);
          }
          
          if ($modalBody.find('#filtroUnidade').length > 0) {
            cy.get('#filtroUnidade').click({ force: true });
            cy.wait(500);
          }
        });
      }
    });

    // 3. Buscar dados
    cy.log('Clicando em Buscar...');
    cy.get('[name="buscaDataSolicita"]').click({ force: true });
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

    cy.log('Automação do painel Captacao de Pacientes concluída com sucesso!');
  });
});
