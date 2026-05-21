# Automação Painel Evolução Social

## Como usar

### Primeira vez (salvar seu login):
```powershell
$env:CYPRESS_USUARIO='seu_usuario'
$env:CYPRESS_SENHA='sua_senha'
npm run cy:run
```

### Depois disso (entra sozinho):
```powershell
npm run cy:run
```

ou 

```powershell
npm start
```

### Execução rápida (smoke) e completa (full)
```powershell
npm run cy:smoke
```

```powershell
npm run cy:smoke:verbose
```

```powershell
npm run cy:smoke:tag
```

```powershell
npm run cy:smoke:tag:ff
```

```powershell
npm run cy:full
```

- `cy:smoke`: executa amostra reduzida (2 unidades x 2 institutos por padrão).
- `cy:smoke:tag`: executa somente testes com tag `@smoke`.
- `cy:smoke:tag:ff`: executa testes `@smoke` com fail-fast (para no primeiro erro).
- `cy:smoke:verbose`: mesmo smoke, mas com logs detalhados para diagnostico.
- `cy:full`: executa todas as combinações de unidades e institutos.
- `cy:full:shard1` e `cy:full:shard2`: dividem a execução full em 2 partes para paralelizar no CI.

No modo smoke, a estrategia de amostragem padrao e `smart`, que distribui itens da lista (primeiro, meio, ultimo quando possivel) para aumentar cobertura sem crescer tempo.

Para voltar ao comportamento antigo (pegar so os primeiros), rode com:

```powershell
cypress run --spec cypress/e2e/botoes.cy.js --env FULL_RUN=false,SAMPLE_STRATEGY=head,MAX_UNIDADES=2,MAX_INSTITUTOS=2
```

## CI com paralelismo (GitHub Actions)

Workflow criado em [.github/workflows/cypress-parallel.yml](.github/workflows/cypress-parallel.yml):

- Em pull request e push na main: roda `cy:smoke`.
- Em execução manual e agendada (02:00 UTC): roda full em paralelo com 2 shards.

Para login no CI, configure os secrets do repositório:

- `CYPRESS_USUARIO`
- `CYPRESS_SENHA`

## O que faz
1. **Fluxo 1**: Loga automaticamente com as credenciais salvas
2. **Fluxo 2**: Aplica os filtros:
   - Nome do Paciente: (vazio)
   - Atendimento: (vazio)
   - Unidade de Internação: TODOS
   - Institutos: Todos
   - Data Inicial: 11/04/2026
   - Data Final: 11/05/2026

## Trocar de usuário
Para salvar credenciais de outro usuário, execute novamente o comando da primeira vez com o novo usuário e senha.

## Arquivos de credenciais
As credenciais são salvas em `cypress/fixtures/credenciais.*.json` (um arquivo por usuário).
