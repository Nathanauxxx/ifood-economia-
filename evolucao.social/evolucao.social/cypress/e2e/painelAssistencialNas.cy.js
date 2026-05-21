describe('Teste do Painel: Assistencial NAS', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelAssistNAS'
    });
  });

  it('Deve preencher os filtros e interagir com os botões', () => {
    cy.log('Iniciando automação do painel...');

    // Interagir com ícones de calendário/seletores se necessário
    cy.get(':nth-child(7) > .input-group-addon > .fa').click({ force: true });
    
    // Seleção robusta de Mês (Janeiro)
    cy.get('#mes2').then(($select) => {
      const options = $select.find('option').map((i, el) => el.value).get();
      cy.log('Opções disponíveis em #mes2: ' + options.join(', '));
      
      // Tenta selecionar Janeiro de várias formas comuns (01, 1, Janeiro)
      const valorParaSelecionar = options.find(v => v === '01' || v === '1' || v.toLowerCase().includes('jan')) || options[1]; 
      cy.get('#mes2').select(valorParaSelecionar, { force: true });
    });

    cy.get(':nth-child(8) > .input-group-addon > .fa').click({ force: true });

    // Seleção robusta de Ano 2
    cy.get('#ano2').then(($select) => {
      const options = $select.find('option').map((i, el) => el.value).get();
      const anoParaSelecionar = options.find(v => v === '2024') || options[options.length - 1];
      cy.get('#ano2').select(anoParaSelecionar, { force: true });
    });

    // Selecionar Mês e Ano Geral
    cy.get(':nth-child(4) > .input-group-addon > .fa').click({ force: true });
    cy.get(':nth-child(5) > .input-group-addon').click({ force: true });
    
    // Seleção robusta de Mês Geral
    cy.get('#mes').then(($select) => {
      const options = $select.find('option').map((i, el) => el.value).get();
      const valorParaSelecionar = options.find(v => v === '01' || v === '1' || v.toLowerCase().includes('jan')) || options[1]; 
      cy.get('#mes').select(valorParaSelecionar, { force: true });
    });

    cy.get('#ano').select('2024', { force: true });

    // Buscar dados
    cy.get('[name="buscaDataSolicita"]').click({ force: true });
    cy.wait(2000);

    // Exportar para Excel
    cy.get('#exportExcel').click({ force: true });
    
    // Limpar filtros
    cy.get('[name="limpar"]').click({ force: true });

    cy.log('Automação concluída.');
  });
});
