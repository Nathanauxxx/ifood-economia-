describe('Teste do Painel: Gerencial Fugulin x Paciente', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelGerFugulinPac'
    });
  });

  // Ignora erros da aplicação (como o 'reading style') para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Gerencial Fugulin x Paciente...');

    // Interagir com o ícone do mês
    cy.get(':nth-child(1) > .input-group > .input-group-addon').click({ force: true });
    
    // Seleção segura de Mês (Janeiro)
    cy.get('body').then(($body) => {
      if ($body.find('#mes').length > 0) {
        cy.get('#mes').then(($select) => {
          const options = $select.find('option').map((i, el) => el.value).get();
          const val = options.find(v => v === '01' || v === '1' || v.toLowerCase().includes('jan')) || options[1];
          cy.get('#mes').select(val, { force: true });
        });
      }
    });

    // Interagir com o ícone do ano
    cy.get(':nth-child(5) > :nth-child(2) > .input-group > .input-group-addon').click({ force: true });

    // Seleção segura de Ano
    cy.get('body').then(($body) => {
      if ($body.find('#ano').length > 0) {
        cy.get('#ano').then(($select) => {
          const options = $select.find('option').map((i, el) => el.value).get();
          const val = options.find(v => v === '2024') || options[options.length - 1];
          cy.get('#ano').select(val, { force: true });
        });
      }
    });

    // Exportar para Excel
    cy.get('#exportExcel').click({ force: true });

    // PAUSA: Removida para execução automática de ponta a ponta
    cy.wait(1000);

    // Limpar filtros
    cy.get('[name="limpar"]').click({ force: true });

    cy.log('Automação concluída com sucesso.');
  });
});
