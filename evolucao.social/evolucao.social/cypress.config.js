const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const grep = require('@cypress/grep/plugin');
const cypressFailFast = require('cypress-fail-fast/plugin');

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/results/reports',
    charts: true,
    reportPageTitle: 'Relatorio de Testes - Evolucao Social',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    overwrite: false,
    html: true,
    json: true,
  },
  e2e: {
    baseUrl: 'http://painelmvhomolog.phcnet.usp.br/PainelEvolucaoSocial',
    chromeWebSecurity: false,
    testIsolation: false,
    defaultCommandTimeout: 15000,
    supportFile: 'cypress/support/commands.js',
    fixturesFolder: 'cypress/fixtures',
    specPattern: 'cypress/e2e/**/*.cy.js',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
    resultsFolder: 'cypress/results',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      grep.plugin(config);
      cypressFailFast(on, config);

      on('after:run', (results) => {
        if (!results) {
          return null;
        }

        const reportDir = path.join(__dirname, 'cypress', 'results');
        fs.mkdirSync(reportDir, { recursive: true });

        const totalTests = results.totalTests || 0;
        const totalPassed = results.totalPassed || 0;
        const totalFailed = results.totalFailed || 0;
        const totalSkipped = results.totalSkipped || 0;
        const durationMs = results.totalDuration || 0;
        const durationSec = Math.round(durationMs / 1000);

        const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Relatorio Simples - Evolucao Social</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
      crossorigin="anonymous"
    />
  </head>
  <body class="bg-light">
    <main class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card shadow-sm">
            <div class="card-body">
              <h1 class="h4 mb-3">Relatorio Simples - Evolucao Social</h1>
              <p class="text-muted mb-4">Resumo da ultima execucao do Cypress.</p>
              <div class="row g-3">
                <div class="col-6">
                  <div class="p-3 bg-success text-white rounded">Passaram: <strong>${totalPassed}</strong></div>
                </div>
                <div class="col-6">
                  <div class="p-3 bg-danger text-white rounded">Falharam: <strong>${totalFailed}</strong></div>
                </div>
                <div class="col-6">
                  <div class="p-3 bg-secondary text-white rounded">Ignorados: <strong>${totalSkipped}</strong></div>
                </div>
                <div class="col-6">
                  <div class="p-3 bg-primary text-white rounded">Total: <strong>${totalTests}</strong></div>
                </div>
              </div>
              <hr />
              <p class="mb-0">Duracao aproximada: <strong>${durationSec}s</strong></p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </body>
</html>
`;

        const reportPath = path.join(reportDir, 'relatorio-simples.html');
        fs.writeFileSync(reportPath, html, 'utf8');

        const reportPathQuoted = `"${reportPath}"`;
        if (process.platform === 'win32') {
          exec(`start "" ${reportPathQuoted}`);
        } else if (process.platform === 'darwin') {
          exec(`open ${reportPathQuoted}`);
        } else {
          exec(`xdg-open ${reportPathQuoted}`);
        }
        return null;
      });

      on('task', {
        fileExists(filePath) {
          return fs.existsSync(filePath);
        },
        resolveCredentialPath({ preferredPaths, fixturesDir }) {
          for (const candidate of preferredPaths || []) {
            if (candidate && fs.existsSync(candidate)) {
              try {
                const raw = fs.readFileSync(candidate, 'utf8');
                const data = JSON.parse(raw);
                if (data?.usuario && data?.senha) {
                  return candidate;
                }
              } catch (error) {
                // Ignora arquivo invalido e continua buscando
              }
            }
          }

          if (!fixturesDir || !fs.existsSync(fixturesDir)) {
            return null;
          }

          const files = fs
            .readdirSync(fixturesDir)
            .filter((name) => name.startsWith('credenciais.') && name.endsWith('.json'));

          for (const fileName of files) {
            const filePath = `${fixturesDir}/${fileName}`;
            try {
              const raw = fs.readFileSync(filePath, 'utf8');
              const data = JSON.parse(raw);
              if (data?.usuario && data?.senha) {
                return filePath;
              }
            } catch (error) {
              // Ignora arquivo invalido e continua buscando
            }
          }

          return null;
        },
      });

      return config;
    },
  },
});
