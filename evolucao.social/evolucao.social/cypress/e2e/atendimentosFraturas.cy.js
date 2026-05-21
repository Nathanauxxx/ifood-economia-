describe('Teste Completo: Atendimento Cirúrgico - Fratura Exposta', () => {
  
  beforeEach(() => {
    // 1. Faz login automático e aceita os termos antes de começar
    cy.loginSeguroPainel({ 
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/AtendCirFraturaExposta' 
    });
  });

  it('Deve testar a filtragem, exportação e limpar por ordem', () => {
    const dataInicio = '01/01/2024';
    const dataFim = '15/05/2024';

    // 2. Testando as Datas
    cy.log('Preenchendo as datas...');
    cy.get('input[name="start"]').first().clear({force: true}).type(dataInicio, {force: true});
    cy.get('input[name="end"]').first().clear({force: true}).type(dataFim, {force: true});

    // 3. Selecionando Unidade e Instituto (com proteção contra options vazias)
    cy.get('[name="filtro-grupo"]').find('option').then($options => {
        const validOptions = $options.filter((i, el) => el.value && el.value !== '');
        if (validOptions.length > 0) {
            cy.get('[name="filtro-grupo"]').select(validOptions.first().val(), {force: true});
        }
    });

    cy.get('[name="filtro-subGrupo"]').find('option').then($options => {
        const validOptions = $options.filter((i, el) => el.value && el.value !== '');
        if (validOptions.length > 0) {
            cy.get('[name="filtro-subGrupo"]').select(validOptions.first().val(), {force: true});
        }
    });

    // --- AÇÃO 1: FILTRAR ---
    cy.log('Ação 1: Clicando em Filtrar');
    cy.get('[name="btnFiltro"]').click({force: true});
    cy.get('body').should('not.contain.text', 'Erro 500');

    // --- AÇÃO 2: EXPORTAR ---
    cy.log('Ação 2: Clicando em Exportar Excel');
    cy.get('#exportExcel').should('be.visible').click({force: true});
    cy.get('body').should('not.contain.text', 'Erro 500');

    // --- AÇÃO 3: LIMPAR ---
    cy.log('Ação 3: Clicando em Limpar');
    cy.get('[name="limpar"]').click({force: true});
    
    // Verificando se a data inicial foi limpa (mudou em relação ao que digitamos)
    cy.get('input[name="start"]').first().then($input => {
      expect($input.val()).to.not.equal(dataInicio);
    });

    cy.log('Todos os botões foram testados na ordem com sucesso!');
  });
});
