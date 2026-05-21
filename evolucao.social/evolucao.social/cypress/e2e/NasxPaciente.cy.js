describe('Teste do Painel: Nascidos por Paciente', () => {

  beforeEach(() => {
    cy.loginSeguroPainel({ 
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelGerNASPac2',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPainelGerNASPac2%2F'
    });
  });

  it('Deve preencher os filtros de período e interagir com os botões', () => {
    cy.log('Iniciando automação do Painel Ger NAS x Pac2...');

    // 1. Seleção robusta de Mês (Janeiro)
    cy.get('#mes').then(($select) => {
      const options = $select.find('option').map((i, el) => el.value).get();
      const val = options.find(v => v === '01' || v === '1' || v.toLowerCase().includes('jan')) || options[1];
      cy.get('#mes').select(val, { force: true });
      cy.log(`Selecionado mês: ${val}`);
    });

    // 2. Seleção robusta de Ano (2024)
    cy.get('#ano').then(($select) => {
      const options = $select.find('option').map((i, el) => el.value).get();
      const val = options.find(v => v === '2024') || options[options.length - 1];
      cy.get('#ano').select(val, { force: true });
      cy.log(`Selecionado ano: ${val}`);
    });

    // 3. Clicar em Buscar/Filtrar
    cy.log('Clicando em Buscar...');
    cy.get('[name="buscaDataSolicita"]').click({ force: true });
    cy.wait(2000);

    // Validação pós-filtro
    cy.get('body').should('not.contain.text', 'Erro 500');

    // 4. Exportar para Excel
    cy.log('Exportando para Excel...');
    cy.get('body').then(($body) => {
      if ($body.find('#exportExcel').length > 0) {
        cy.get('#exportExcel').click({ force: true });
        cy.wait(1000);
      }
    });

    // 5. Limpar filtros
    cy.log('Limpando filtros...');
    cy.get('[name="limpar"]').click({ force: true });
    cy.wait(1000);

    cy.log('Automação do painel Ger NAS x Pac2 concluída com sucesso!');
  });
});
