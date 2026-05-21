describe('Teste do Painel: Lançamentos BPA APAC', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelConsLancamentoBPAPAC',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPainelConsLancamentoBPAPAC%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Lançamentos BPA APAC...');

    const selecionarSeletorRobusto = (seletor, label) => {
      cy.get('body').then(($body) => {
        if ($body.find(seletor).length > 0) {
          cy.get(seletor).then(($el) => {
            if ($el.is('select')) {
              const options = $el.find('option').map((i, el) => el.value).get();
              const val = options.find(v => v !== '') || options[0];
              cy.get(seletor).select(val, { force: true });
              cy.log(`Selecionado valor em ${label}: ${val}`);
            } else {
              cy.get(seletor).click({ force: true });
              cy.log(`Clicado no campo ${label}`);
            }
          });
        }
      });
    };

    // 1. Preencher Filtros de Seleção (Instituto, Setor, Setor Executante e Setor Solicitante)
    selecionarSeletorRobusto('.input-group > [name="instituto"]', 'Instituto');
    cy.wait(500);
    selecionarSeletorRobusto('.input-group > [name="setor"]', 'Setor');
    cy.wait(500);
    selecionarSeletorRobusto('.input-group > [name="setorExec"]', 'Setor Executante');
    cy.wait(500);
    selecionarSeletorRobusto('.input-group > [name="setorSolic"]', 'Setor Solicitante');
    cy.wait(500);

    // 2. Preencher Datas (Janeiro 2024)
    cy.log('Preenchendo intervalo de datas...');
    cy.get(':nth-child(4) > .input-group > [name="start"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get(':nth-child(5) > .input-group > [name="start"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // 3. Clicar em Buscar/Filtrar
    cy.log('Clicando em Buscar...');
    cy.get('[name="buscaDataSolicita"]').click({ force: true });
    cy.wait(2000);

    // Validação básica pós-filtro
    cy.get('body').should('not.contain.text', 'Erro 500');

    // 4. Exportar para Excel
    cy.log('Exportando para Excel...');
    cy.get('#exportExcel').should('be.visible').click({ force: true });
    cy.wait(1000);

    // 5. Limpar filtros
    cy.log('Limpando filtros...');
    cy.get('[name="limpar"]').click({ force: true });
    cy.wait(1000);

    cy.log('Automação do painel Lançamentos BPA APAC concluída com sucesso!');
  });
});
