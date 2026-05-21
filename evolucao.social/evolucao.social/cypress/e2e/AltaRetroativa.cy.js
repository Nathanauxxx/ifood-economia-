describe('Teste do Painel: Alta Retroativa', () => {

    beforeEach(() => {
        // 1. Faz login automático e aceita os termos antes de começar
        cy.loginSeguroPainel({
            painelUrl: 'http://painelmvhomolog.phcnet.usp.br/AltaRetroativa'
        });
    });

    it('Deve preencher as datas de Alta Retroativa e filtrar', () => {
        const dataDe = '01/01/2024';
        const dataAte = '15/05/2024';
        const dataFinAlta = '15/05/2024';

        cy.log('Iniciando preenchimento do formulário...');

        // 2. Preenchendo as Datas (usando os seletores que você enviou)
        cy.get('[name="dataDe"]').clear({ force: true }).type(dataDe, { force: true });
        cy.get('[name="dataAte"]').clear({ force: true }).type(dataAte, { force: true });

        // Campo opcional ou complementar que você passou
        if (Cypress.$('#dtFinAlta').length > 0) {
            cy.get('#dtFinAlta').clear({ force: true }).type(dataFinAlta, { force: true });
        }

        // 3. Clicar em Filtrar
        cy.get('[name="btnFiltro"]').first().click({ force: true });

        // 4. Validação básica
        cy.get('body').should('not.contain.text', 'Erro 500');
        cy.log('Filtro aplicado com sucesso!');
    });
});
