require('cypress-mochawesome-reporter/register');
require('@cypress/grep').register();
require('cypress-fail-fast');

const IGNORE_NULL_POSTMESSAGE_ERROR =
  String(Cypress.env('IGNORE_POSTMESSAGE_ERROR') ?? 'true').toLowerCase() === 'true';

function isNullPostMessageError(error) {
  const message = String(error?.message || '');
  return message.includes("Cannot read properties of null (reading 'postMessage')");
}

Cypress.on('uncaught:exception', (error) => {
  if (IGNORE_NULL_POSTMESSAGE_ERROR && isNullPostMessageError(error)) {
    Cypress.log({
      name: 'uncaught:exception',
      message: 'Ignorando erro conhecido de postMessage nulo durante redirecionamento.',
    });
    return false;
  }

  return true;
});

const LOGIN_USER_SELECTORS = [
  'input[name="Email"]',
  '#Email',
  'input[name="usuario"]',
  'input[name="username"]',
  'input[name="UserName"]',
  '#usuario',
  '#username',
  '#UserName',
  'input[id*="Usuario"]',
  'input[id*="UserName"]',
  'input[placeholder*="Usu"]',
  'input[placeholder*="user"]',
];

const LOGIN_PASSWORD_SELECTORS = [
  'input[name="Password"]',
  '#Password',
  'input[name="senha"]',
  'input[name="password"]',
  '#senha',
  '#password',
  'input[id*="Senha"]',
  'input[id*="Password"]',
  'input[type="password"]',
];

const LOGIN_SUBMIT_SELECTORS = [
  'button[type="submit"]',
  'input[type="submit"]',
  'button[name="Entrar"]',
  'button[id*="Entrar"]',
  'button[id*="Login"]',
  '.btn-login',
  '.login button',
];

const FILTER_SELECTORS = {
  nomePaciente: [
    'input[name="nomePaciente"]',
    'input[name="NomePaciente"]',
    '#NomePaciente',
    'input[id*="NomePaciente"]',
  ],
  atendimento: [
    'input[name="atendimento"]',
    'input[name="Atendimento"]',
    '#Atendimento',
    'input[id*="Atendimento"]',
  ],
  unidadeInternacao: [
    '#unidInt',
    'select[name="unidadeInternacao"]',
    'select[name="UnidadeInternacao"]',
    '#UnidadeInternacao',
    'select[id*="Unidade"]',
  ],
  institutos: [
    '#instituto',
    'select[name="instituto"]',
    'select[name="institutos"]',
    'select[name="Instituto"]',
    '#Instituto',
    '#Institutos',
    'select[id*="Instituto"]',
  ],
  dataInicial: [
    '#dataInicial',
    'input[name="dataInicial"]',
    'input[name="DataInicial"]',
    '#DataInicial',
    'input[id*="DataInicial"]',
  ],
  dataFinal: [
    '#dataFinal',
    'input[name="dataFinal"]',
    'input[name="DataFinal"]',
    '#DataFinal',
    'input[id*="DataFinal"]',
  ],
};

const SEARCH_BUTTON_SELECTORS = [
  '#btnFiltrar',
  'button[type="submit"]',
  'button[id*="Pesquisar"]',
  'button[id*="Buscar"]',
  'input[type="submit"]',
  '.btn-primary',
];

const LOGIN_URL =
  'http://sistemashchomolog.phcnet.usp.br/Conta/Login?returnUrl=http%3A%2F%2Fpainelmvhomolog.phcnet.usp.br%2FPainelEvolucaoSocial%2F';

function slugify(value) {
  return String(value || 'default')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function credPathForProfile(profile) {
  return `cypress/fixtures/credenciais.${slugify(profile)}.json`;
}

function saveCredenciais(credenciais) {
  const usuario = String(credenciais?.usuario || '').trim();
  const senha = String(credenciais?.senha || '');
  const profile = credenciais?.profile || usuario || 'default';
  const payload = { usuario, senha, profile };

  return cy
    .writeFile(credPathForProfile(profile), payload, { log: false })
    .then(() => cy.writeFile('cypress/fixtures/credenciais.json', payload, { log: false }))
    .then(() => payload);
}

function logCurrentUrl(label) {
  return cy.url({ timeout: 30000 }).then((currentUrl) => {
    Cypress.log({
      name: 'url-trace',
      message: `${label}: ${currentUrl}`,
    });
    return currentUrl;
  });
}

function firstVisibleElement($body, selectors) {
  for (const selector of selectors) {
    const $el = $body.find(selector).filter(':visible');
    if ($el.length) {
      return $el.first();
    }
  }
  return null;
}

function resolveCredenciais(options = {}) {
  const usuarioEnv = Cypress.env('usuario') || Cypress.env('USUARIO');
  const senhaEnv = Cypress.env('senha') || Cypress.env('SENHA');

  const usuario = options.usuario || usuarioEnv || '';
  const senha = options.senha || senhaEnv || '';
  const profile = options.profile || Cypress.env('perfil') || Cypress.env('PERFIL') || usuario || 'default';
  const credPath = credPathForProfile(profile);

  if (usuario && senha) {
    return saveCredenciais({ usuario, senha, profile });
  }

  const candidatePaths = [credPath, 'cypress/fixtures/credenciais.json'];

  return cy.task('resolveCredentialPath', {
    preferredPaths: candidatePaths,
    fixturesDir: 'cypress/fixtures',
  }).then((resolvedPath) => {
    if (!resolvedPath) {
      return { usuario: '', senha: '', profile };
    }

    return cy.readFile(resolvedPath, { log: false }).then((data) => ({
      usuario: data?.usuario || '',
      senha: data?.senha || '',
      profile: data?.profile || profile,
    }));
  });
}

function preencherLoginSeNecessario(credenciais, options = {}) {
  return cy.get('body', { timeout: 20000 }).then(($body) => {
    const userField = firstVisibleElement($body, LOGIN_USER_SELECTORS);
    const passwordField = firstVisibleElement($body, LOGIN_PASSWORD_SELECTORS);

    if (!userField || !passwordField) {
      cy.log('Sessao ja autenticada. Login nao necessario.');
      return;
    }

    const forcarDigitacaoManual =
      options.forcarDigitacaoManual === true ||
      Cypress.env('trocarUsuario') === true ||
      Cypress.env('trocarUsuario') === 'true';

    if (forcarDigitacaoManual) {
      cy.log('Troca de usuario ativa: digite usuario e senha e clique em Resume no Cypress.');
      cy.pause();

      return cy.get('body').then(($bodyAfterPause) => {
        const userAfterPause = firstVisibleElement($bodyAfterPause, LOGIN_USER_SELECTORS);
        const passAfterPause = firstVisibleElement($bodyAfterPause, LOGIN_PASSWORD_SELECTORS);
        const submitAfterPause = firstVisibleElement($bodyAfterPause, LOGIN_SUBMIT_SELECTORS);

        if (!userAfterPause || !passAfterPause || !submitAfterPause) {
          throw new Error('Nao foi possivel localizar campos de login apos digitacao manual.');
        }

        const usuarioDigitado = String(userAfterPause.val() || '').trim();
        const senhaDigitada = String(passAfterPause.val() || '');

        if (!usuarioDigitado || !senhaDigitada) {
          throw new Error('Digite usuario e senha antes de continuar o teste.');
        }

        return saveCredenciais({
          usuario: usuarioDigitado,
          senha: senhaDigitada,
          profile: usuarioDigitado,
        }).then(() => {
          cy.wrap(submitAfterPause).click({ force: true });
        });
      });
    }

    if (!credenciais.usuario || !credenciais.senha) {
      const usuarioDigitado = String(userField.val() || '').trim();
      const senhaDigitada = String(passwordField.val() || '');

      if (usuarioDigitado && senhaDigitada) {
        return saveCredenciais({
          usuario: usuarioDigitado,
          senha: senhaDigitada,
          profile: usuarioDigitado,
        }).then(() => {
          const submitAuto = firstVisibleElement($body, LOGIN_SUBMIT_SELECTORS);
          if (!submitAuto) {
            throw new Error('Botao de login nao encontrado.');
          }
          cy.wrap(submitAuto).click({ force: true });
        });
      }

      throw new Error(
        [
          'Credenciais nao disponiveis para efetuar login automatico.',
          'Para salvar ao digitar no Cypress Open, rode com troca de usuario:',
          'npx cypress open --env trocarUsuario=true',
        ].join(' '),
      );
    }

    cy.wrap(userField).clear({ force: true }).type(credenciais.usuario, { force: true });
    cy.wrap(passwordField).clear({ force: true }).type(credenciais.senha, {
      force: true,
      log: false,
    });

    const submitButton = firstVisibleElement($body, LOGIN_SUBMIT_SELECTORS);
    if (!submitButton) {
      throw new Error('Botao de login nao encontrado.');
    }

    cy.wrap(submitButton).click({ force: true });
  });
}

function typeIfFound(selectors, value) {
  return cy.get('body').then(($body) => {
    const el = firstVisibleElement($body, selectors);
    if (!el) {
      return null;
    }
    return cy.wrap(el).clear({ force: true }).type(value, { force: true });
  });
}

function selectIfFound(selectors, value) {
  return cy.get('body').then(($body) => {
    const el = firstVisibleElement($body, selectors);
    if (!el) {
      return null;
    }
    return cy.wrap(el).select(value, { force: true });
  });
}

function clickSearchButton() {
  return cy.get('body').then(($body) => {
    const el = firstVisibleElement($body, SEARCH_BUTTON_SELECTORS);
    if (!el) {
      throw new Error('Botao de buscar/pesquisar nao encontrado.');
    }
    cy.wrap(el).click({ force: true });
  });
}

Cypress.Commands.add('loginComSalvamento', (usuario, senha) => {
  cy.visit('/');
  
  return cy.get('body', { timeout: 20000 }).then(($body) => {
    const userField = firstVisibleElement($body, LOGIN_USER_SELECTORS);
    const passwordField = firstVisibleElement($body, LOGIN_PASSWORD_SELECTORS);
    
    if (!userField || !passwordField) {
      cy.log('Ja esta logado.');
      return;
    }
    
    cy.wrap(userField).clear({ force: true }).type(usuario, { force: true });
    cy.wrap(passwordField).clear({ force: true }).type(senha, { force: true, log: false });
    
    const submitButton = firstVisibleElement($body, LOGIN_SUBMIT_SELECTORS);
    if (submitButton) {
      cy.wrap(submitButton).click({ force: true });
    }
    
    return saveCredenciais({ usuario, senha, profile: usuario });
  }).then(() => {
    // Aguardar e aceitar termos
    cy.wait(4000);
    
    cy.url({ timeout: 5000 }).then((url) => {
      cy.log('URL atual: ' + url);
      
      if (url.includes('formularioshchomolog') || url.includes('NormasDeAcesso') || url.includes('Infos')) {
        cy.log('Detectada tela de termos, tentando aceitar...');
        
        cy.origin('http://formularioshchomolog.phcnet.usp.br', () => {
          cy.get('button', { timeout: 10000 }).each(($btn) => {
            const texto = $btn.text();
            if (texto.includes('SIM') || texto.includes('CONTINUAR')) {
              cy.wrap($btn).click({ force: true });
              return false; // para o loop
            }
          });
        });
        
        cy.wait(3000);
      }
    });
    
    // Ir para o painel
    cy.visit('http://painelmvhomolog.phcnet.usp.br/PainelEvolucaoSocial', { failOnStatusCode: false });
    cy.wait(2000);
    cy.log('Chegou no painel!');
  });
});

Cypress.Commands.add('loginInteligente', (options = {}) => {
  return resolveCredenciais(options).then((credenciais) => {
    if (credenciais.usuario && credenciais.senha) {
      cy.log(`Login automatico com usuario: ${credenciais.usuario}`);
      return cy.loginComSalvamento(credenciais.usuario, credenciais.senha);
    }
    
    throw new Error(
      'Nenhuma credencial salva encontrada. Execute primeiro com CYPRESS_USUARIO e CYPRESS_SENHA.'
    );
  });
});

Cypress.Commands.add('aplicarFiltrosPainel', (filtros) => {
  const payload = {
    nomePaciente: filtros?.nomePaciente ?? '',
    atendimento: filtros?.atendimento ?? '',
    unidadeInternacao: filtros?.unidadeInternacao ?? 'TODOS',
    institutos: filtros?.institutos ?? 'Todos',
    dataInicial: filtros?.dataInicial ?? '11/04/2026',
    dataFinal: filtros?.dataFinal ?? '11/05/2026',
  };

  cy.log('Iniciando aplicacao de filtros...');
  cy.wait(1000);

  // Nome do Paciente
  if (payload.nomePaciente) {
    cy.log(`Preenchendo Nome do Paciente: ${payload.nomePaciente}`);
    typeIfFound(FILTER_SELECTORS.nomePaciente, payload.nomePaciente);
  }

  // Atendimento
  if (payload.atendimento) {
    cy.log(`Preenchendo Atendimento: ${payload.atendimento}`);
    typeIfFound(FILTER_SELECTORS.atendimento, payload.atendimento);
  }

  // Unidade de Internação
  cy.log(`Selecionando Unidade de Internacao: ${payload.unidadeInternacao}`);
  selectIfFound(FILTER_SELECTORS.unidadeInternacao, payload.unidadeInternacao);
  cy.wait(500);

  // Institutos
  cy.log(`Selecionando Institutos: ${payload.institutos}`);
  selectIfFound(FILTER_SELECTORS.institutos, payload.institutos);
  cy.wait(500);

  // Data Inicial
  cy.log(`Preenchendo Data Inicial: ${payload.dataInicial}`);
  typeIfFound(FILTER_SELECTORS.dataInicial, payload.dataInicial);
  cy.wait(500);

  // Data Final
  cy.log(`Preenchendo Data Final: ${payload.dataFinal}`);
  typeIfFound(FILTER_SELECTORS.dataFinal, payload.dataFinal);
  cy.wait(500);

  // Clicar em Pesquisar/Buscar
  cy.log('Clicando no botao de pesquisar...');
  clickSearchButton();
  cy.wait(2000);
  
  cy.log('Filtros aplicados com sucesso!');
});

Cypress.Commands.add('loginSeguroPainel', (options = {}) => {
  const usuario = Cypress.env('USUARIO') || Cypress.env('usuario');
  const senha = Cypress.env('SENHA') || Cypress.env('senha');
  const painelUrl = options.painelUrl || Cypress.env('PAINEL_URL') || 'http://painelmvhomolog.phcnet.usp.br/PainelEvolucaoSocial';
  const loginUrlBase = options.loginUrl || Cypress.env('LOGIN_URL') || LOGIN_URL;
  let caminhoPainelEsperado = '/painel';

  try {
    caminhoPainelEsperado = new URL(painelUrl).pathname.toLowerCase();
  } catch (error) {
    // Mantem fallback caso a URL esteja invalida
  }

  if (!usuario || !senha) {
    throw new Error('Defina USUARIO e SENHA no cypress.env.json ou via variaveis de ambiente.');
  }

  const aceitarNormasSeNecessario = () => {
    return logCurrentUrl('URL ao validar normas').then((currentUrl) => {
      if (currentUrl.includes('formularioshchomolog') || currentUrl.includes('NormasDeAcesso') || currentUrl.includes('Infos')) {
        cy.log('Tela de normas detectada. Aceitando.');
        return cy.origin('http://formularioshchomolog.phcnet.usp.br', () => {
          cy.get('body', { timeout: 15000 }).then(($body) => {
            if ($body.find('#aceitar').length > 0) {
              cy.get('#aceitar').click({ force: true });
              return;
            }

            cy.contains('button, a, input', /(sim|continuar|aceitar|concordo)/i)
              .first()
              .click({ force: true });
          });
        });
      }

      return null;
    });
  };

  const autenticar = (jaEstaNaTelaLogin = false) => {
    if (!jaEstaNaTelaLogin) {
      cy.visit(loginUrlBase, { failOnStatusCode: false });
      logCurrentUrl('URL apos abrir login');
    }

    cy.get('body', { timeout: 20000 }).then(($body) => {
      const userField = $body
        .find('input[name="Email"], #Email, input[name="usuario"], input[type="text"], input[type="email"]')
        .filter(':visible')
        .first();

      const passwordField = $body
        .find('input[name="Password"], #Password, input[type="password"]')
        .filter(':visible')
        .first();

      if (!userField.length || !passwordField.length) {
        throw new Error('Campos de login nao encontrados na tela de autenticacao.');
      }

      cy.wrap(userField).clear().type(usuario, { log: false });
      cy.wrap(passwordField).clear().type(senha, { log: false });

      if ($body.find('.width-35:visible').length > 0) {
        cy.get('.width-35').first().click();
      } else {
        cy.get('button[type="submit"], input[type="submit"], .btn-login', { timeout: 10000 })
          .filter(':visible')
          .first()
          .click();
      }
    });

    logCurrentUrl('URL apos submit de login');

    return aceitarNormasSeNecessario();
  };

  const garantirRetornoAoPainel = (tentativa = 1) => {
    cy.visit(painelUrl, { failOnStatusCode: false });
    logCurrentUrl(`URL apos retorno ao painel (tentativa ${tentativa})`);

    return cy.url({ timeout: 30000 }).then((currentUrl) => {
      if (currentUrl.includes('/Conta/Login')) {
        if (tentativa < 3) {
          cy.log(`SSO retornou ao login. Reautenticando (tentativa ${tentativa + 1}/3).`);
          return autenticar(true).then(() => garantirRetornoAoPainel(tentativa + 1));
        }

        throw new Error('Sessao retornou para login apos autenticar em todas as tentativas. Verifique credenciais/SSO.');
      }

      const caminhoAtual = new URL(currentUrl).pathname.toLowerCase();
      if (caminhoAtual.includes(caminhoPainelEsperado)) {
        return null;
      }

      const caiuEmNormas =
        currentUrl.includes('formularioshchomolog') ||
        currentUrl.includes('NormasDeAcesso') ||
        currentUrl.includes('Infos');

      if (caiuEmNormas && tentativa < 3) {
        return aceitarNormasSeNecessario().then(() => garantirRetornoAoPainel(tentativa + 1));
      }

      throw new Error(`Nao foi possivel voltar ao painel esperado: ${caminhoPainelEsperado}`);
    });
  };

  cy.log('Iniciando login seguro no painel');

  // 1. Abre o painel — o servidor redireciona para login se necessario
  cy.visit(painelUrl, { failOnStatusCode: false });
  logCurrentUrl('URL apos abrir painel inicialmente');

  // 2. Autentica UMA unica vez se redirecionou para login
  cy.url({ timeout: 30000 }).then((currentUrl) => {
    if (currentUrl.includes('/Conta/Login')) {
      cy.log('Sessao nao autenticada. Realizando login (unica vez).');
      return autenticar(true);
    }

    if (
      currentUrl.includes('formularioshchomolog') ||
      currentUrl.includes('NormasDeAcesso') ||
      currentUrl.includes('Infos')
    ) {
      return aceitarNormasSeNecessario();
    }

    return null;
  });

  // 3. Retorna explicitamente ao painel apos login/aceite de normas
  garantirRetornoAoPainel();

  // 4. Garante que terminou no painel correto
  cy.url({ timeout: 30000 })
    .should('not.include', '/Conta/Login')
    .then((currentUrl) => {
      const caminhoAtual = new URL(currentUrl).pathname.toLowerCase();
      expect(caminhoAtual).to.include(caminhoPainelEsperado);
    });

  logCurrentUrl('URL final apos login');

  cy.log('Login realizado com sucesso e painel carregado.');
});

