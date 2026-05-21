describe('Teste do Painel: Consulta de Prescrição Ambulatorial', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelConsultaPrescPAMB',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPainelConsultaPrescPAMB%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Prescrição Ambulatorial...');

    // Selecionar Instituto (Escolhe a primeira opção válida)
    cy.get('body').then(($body) => {
      const seletorInstituto = '.input-group > [name="instituto"]';
      if ($body.find(seletorInstituto).length > 0) {
        cy.get(seletorInstituto).then(($select) => {
          if ($select.is('select')) {
            const options = $select.find('option').map((i, el) => el.value).get();
            const val = options.find(v => v !== '') || options[0];
            cy.get(seletorInstituto).select(val, { force: true });
          }
        });
      }
    });

    // Preencher Datas (Janeiro 2024)
    // Note: O usuário informou [name="start"] para ambos os campos, diferenciados pelo nth-child
    cy.get(':nth-child(4) > .input-group > [name="start"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get(':nth-child(5) > .input-group > [name="start"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // Buscar dados
    cy.get('[name="buscaDataSolicita"]').click({ force: true });
    cy.wait(2000);

    // Exportar para Excel
    cy.get('body').then(($body) => {
      if ($body.find('#exportExcel').length > 0) {
        cy.get('#exportExcel').click({ force: true });
        cy.wait(1000);
      }
    });

    // PAUSA para conferência
    cy.log('Ações concluídas (Busca e Exportação). Clique em Resume (Play) para limpar.');
    cy.pause();

    // Limpar filtros
    cy.get('[name="limpar"]').click({ force: true });

    cy.log('Automação concluída.');
  });
});
