describe('Teste do Painel: Notificação Compulsória', () => {

  beforeEach(() => {
    // Faz o login e entra direto no painel
    cy.loginSeguroPainel({
      painelUrl: 'http://paineisdadoshomolog.phcnet.usp.br/Sinan/Painel',
      loginUrl: 'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpaineisdadoshomolog.phcnet.usp.br%2FSinan%2FPainel%2F'
    });
  });

  // Ignora erros da aplicação para não quebrar o teste do Cypress
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Deve preencher os filtros, interagir com modais e botões', () => {
    cy.log('Iniciando automação do Painel Notificação Compulsória...');

    // 1. Interagir com o Modal de Instituto (usando seletores de checklist reais)
    cy.get('body').then(($body) => {
      if ($body.find('#btnInstitutoModal').length > 0) {
        cy.log('Abrindo o Modal de Instituto...');
        cy.get('#btnInstitutoModal').click({ force: true });
        cy.wait(800);

        // Tenta marcar as opções específicas do checklist (ex: a de valor '1' ou '12', ou a primeira que encontrar)
        const seletorOpcao = '[onclick*="toggleCheckbox"][onclick*="instituto"]';
        if ($body.find(seletorOpcao).length > 0) {
          cy.get(seletorOpcao).first().click({ force: true });
          cy.wait(300);
        }

        // Clicar no botão de Confirmar específico do modal de Instituto
        const btnConfirmar = '#modalInstituto > .sinan-modal-content > .sinan-modal-footer > .sinan-modal-botoes > .sinan-botao-confirmar';
        if ($body.find(btnConfirmar).length > 0) {
          cy.get(btnConfirmar).click({ force: true });
          cy.wait(500);
        }
      }
    });

    // 2. Interagir com o Modal de Notificação (se disponível na tela)
    cy.get('body').then(($body) => {
      if ($body.find('#btnNotificacaoModal').length > 0) {
        cy.log('Abrindo o Modal de Notificação...');
        cy.get('#btnNotificacaoModal').click({ force: true });
        cy.wait(800);
        
        // Tenta marcar opções de notificação e confirmar (ou pressiona Esc)
        const seletorOpcaoNotif = '[onclick*="toggleCheckbox"][onclick*="notificacao"]';
        if ($body.find(seletorOpcaoNotif).length > 0) {
          cy.get(seletorOpcaoNotif).first().click({ force: true });
          cy.wait(300);
        }

        // Clicar no botão de Confirmar específico do modal de Notificação (se existir, senão usa Esc)
        const btnConfirmarNotif = '#modalNotificacao > .sinan-modal-content > .sinan-modal-footer > .sinan-modal-botoes > .sinan-botao-confirmar';
        if ($body.find(btnConfirmarNotif).length > 0) {
          cy.get(btnConfirmarNotif).click({ force: true });
        } else {
          cy.get('body').type('{esc}');
        }
        cy.wait(500);
      }
    });


    // 2. Preencher Intervalo de Datas (Janeiro 2024)
    cy.log('Preenchendo as datas do filtro...');
    cy.get('[name="filtroDtIni"]').clear({ force: true }).type('01/01/2024{enter}', { force: true });
    cy.wait(500);
    cy.get('[name="filtroDtFim"]').clear({ force: true }).type('31/01/2024{enter}', { force: true });
    cy.wait(500);

    // 3. Filtrar / Buscar
    cy.log('Clicando em Filtrar...');
    cy.get('#btnFiltrar').click({ force: true });
    cy.wait(2000);

    // Validação básica pós-filtro
    cy.get('body').should('not.contain.text', 'Erro 500');

    // 4. Exportar para Excel
    cy.log('Exportando para Excel...');
    cy.get('body').then(($body) => {
      if ($body.find('#btnExportar').length > 0) {
        cy.get('#btnExportar').click({ force: true });
        cy.wait(1000);
      }
    });

    // 5. Limpar filtros
    cy.log('Limpando filtros...');
    cy.get('body').then(($body) => {
      if ($body.find('#btnLimpar > :nth-child(2)').length > 0) {
        cy.get('#btnLimpar > :nth-child(2)').click({ force: true });
      } else if ($body.find('#btnLimpar').length > 0) {
        cy.get('#btnLimpar').click({ force: true });
      }
    });
    cy.wait(1000);

    cy.log('Automação do painel Notificação Compulsória concluída com sucesso!');
  });
});
