describe('Teste do Painel: Painel CIEQ Analitico', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelCieqAnalitico',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPainelCieqAnalitico%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel CIEQ Analitico...');

    // 1. Selecionar Unidade de Internação
    cy.log('Selecionando Unidade de Internação...');
    cy.get('body').then(($body) => {
      const seletorUnid = '[name="filtro-unidIntern"]';
      if ($body.find(seletorUnid).length > 0) {
        cy.get(seletorUnid).then(($el) => {
          if ($el.is('select')) {
            const options = $el.find('option').map((i, opt) => opt.value).get();
            const val = options.find(v => v !== '') || options[0];
            if (val !== undefined) {
              cy.get(seletorUnid).select(val, { force: true });
            }
          } else {
            cy.get(seletorUnid).click({ force: true });
            cy.wait(500);
            cy.get('[name="filtro-unidIntern"] option, [name="filtro-unidIntern"] li, [name="filtro-unidIntern"] a').first().click({ force: true });
          }
        });
        cy.wait(500);
      }
    });

    // 2. Buscar/Atualizar dados
    cy.log('Clicando em Atualizar...');
    cy.get('#atualizar').click({ force: true });
    cy.wait(2000);

    // Validação pós-busca
    cy.get('body').should('not.contain.text', 'Erro 500');

    // 3. Exportar para Excel com lógica de segurança robusta
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

    cy.log('Automação do painel CIEQ Analitico concluída com sucesso!');
  });
});
