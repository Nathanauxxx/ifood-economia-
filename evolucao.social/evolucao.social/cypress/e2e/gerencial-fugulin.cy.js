describe('Teste do Painel: Gerencial Fugulin', () => {
  let modulo;

  const selecionarPrimeiraOpcao = (seletor) => {
    if (!seletor) {
      return;
    }

    cy.get('body').then(($body) => {
      if ($body.find(seletor).length === 0) {
        return;
      }

      cy.get(seletor).find('option').then(($options) => {
        const validOptions = $options.filter((i, el) => el.value && el.value !== '');
        if (validOptions.length > 0) {
          cy.get(seletor).select(validOptions.first().val(), { force: true });
        }
      });
    });
  };

  const preencherDataComFallback = (selectorPreferencial, valor, fallbackIndex, labelCampo) => {
    cy.get('body').then(($body) => {
      const seletoresCandidatos = [
        selectorPreferencial,
        'input[name="start"]',
        'input[name="end"]',
        'input[name="dataDe"]',
        'input[name="dataAte"]',
        '#dataInicial',
        '#dataFinal',
      ].filter(Boolean);

      let alvo = null;

      for (const seletor of seletoresCandidatos) {
        const encontrado = $body.find(seletor).filter(':visible').first();
        if (encontrado.length > 0) {
          alvo = encontrado;
          break;
        }
      }

      if (!alvo) {
        const inputsVisiveis = $body
          .find('input')
          .filter(':visible')
          .filter((_, el) => String(el?.value || '').match(/^\d{2}\/\d{2}\/\d{4}$/));

        if (inputsVisiveis.length > fallbackIndex) {
          alvo = inputsVisiveis.eq(fallbackIndex);
        }
      }

      if (!alvo) {
        throw new Error(`Campo ${labelCampo} nao encontrado para preencher data.`);
      }

      cy.wrap(alvo)
        .click({ force: true })
        .type('{selectall}{backspace}', { force: true })
        .type(valor, { force: true })
        .should('have.value', valor);
    });
  };

  before(() => {
    cy.fixture('paineis').then((paineis) => {
      modulo = paineis.gerencialFugulin;
      expect(modulo, 'configuracao do modulo gerencialFugulin').to.exist;
      expect(modulo.url, 'url do modulo').to.be.a('string').and.not.be.empty;
    });
  });

  beforeEach(() => {
    cy.loginSeguroPainel({
      painelUrl: modulo.url,
      loginUrl: modulo.loginUrl,
    });
  });

  it('Deve ler o modulo e automatizar a filtragem', () => {
    cy.log(`Modulo carregado: ${modulo.nome}`);
    cy.wait(2000);

    const dataInicial = '01/01/2024';
    const dataFinal = '31/12/2024';

    preencherDataComFallback(modulo.seletores.dataInicial, dataInicial, 0, 'Data inicial');
    preencherDataComFallback(modulo.seletores.dataFinal, dataFinal, 1, 'Data final');

    selecionarPrimeiraOpcao(modulo.seletores.unidade);
    selecionarPrimeiraOpcao(modulo.seletores.institutos);

    cy.get('body').then(($body) => {
      const seletorFiltrarUnidade = modulo.seletores.filtrarUnidade || '#btnFiltroUnidade';
      if ($body.find(seletorFiltrarUnidade).length > 0) {
        cy.get(seletorFiltrarUnidade).first().click({ force: true });
      }
    });

    cy.get('body').then(($body) => {
      if ($body.find(modulo.seletores.filtrar).length > 0) {
        cy.get(modulo.seletores.filtrar).first().click({ force: true });
      } else {
        cy.contains('button, a, input', /filtrar|buscar|pesquisar/i)
          .first()
          .click({ force: true });
      }

      cy.get('body').should('not.contain.text', 'Erro 500');
      cy.get('body').should('not.contain.text', 'Exception');
      cy.get('body').should('not.contain.text', 'stack trace');
    });

    cy.url().then((urlAtual) => {
      expect(urlAtual).to.include('/GerencialFugulin');
    });
  });

  it('Deve validar que os seletores do modulo estao disponiveis para automacao', () => {
    expect(modulo.seletores.filtrarUnidade).to.be.a('string').and.not.be.empty;
    expect(modulo.seletores.filtrar).to.be.a('string').and.not.be.empty;

    cy.get('body').then(($body) => {
      const encontrouAlgumSeletor =
        $body.find(modulo.seletores.unidade).length > 0 ||
        $body.find(modulo.seletores.institutos).length > 0 ||
        $body.find(modulo.seletores.dataInicial).length > 0 ||
        $body.find(modulo.seletores.dataFinal).length > 0 ||
        $body.find(modulo.seletores.filtrarUnidade).length > 0 ||
        $body.find(modulo.seletores.filtrar).length > 0;

      expect(encontrouAlgumSeletor, 'ao menos um seletor do modulo na tela').to.be.true;
    });
  });
});
