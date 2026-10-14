# QA Scout

**Explore com missão. Volte com evidência.**

QA Scout é um companheiro de teste exploratório baseado em sessões (SBTM). Você escreve o charter, liga o cronômetro, anota o que encontra no ritmo da exploração e, no fim, sai com um relatório pronto para o time.

🔗 **Acesse:** https://azevedothamirest.github.io/qa-scout/

![Testes e2e](https://github.com/azevedothamirest/qa-scout/actions/workflows/ci.yml/badge.svg)

> **Beta aberto.** Primeira vez? Siga o [tutorial](docs/tutorial.md) (uns 10 minutos). Usou? [Conte como foi](https://github.com/azevedothamirest/qa-scout/issues/new/choose): bugs, ideias e críticas são muito bem-vindos.

## Por que existe

Teste exploratório costuma ser um trabalho invisível: encontra os bugs mais interessantes, mas deixa pouco rastro. O QA Scout dá estrutura sem virar roteiro, e transforma a sessão em evidência que Produto e Dev conseguem ler.

## Funcionalidades

- **Charter no modelo de Elisabeth Hendrickson:** *Explorar ___ com ___ para descobrir ___*, mais área, ambiente e duração (30, 60 ou 90 min).
- **Cronômetro com pausa**, barra de progresso e aviso de tempo extra.
- **Notas por tipo:** bug, dúvida, ideia, risco e observação, cada uma com o minuto exato da sessão.
  - `Alt+1` a `Alt+5` troca o tipo, `Ctrl+Enter` salva.
  - Prefixos de comando: `/bug`, `/duvida`, `/ideia`, `/risco`, `/obs`.
  - Prints colados com `Ctrl+V` ou anexados, comprimidos automaticamente.
- **Heurísticas:** 18 cartas com tours inspirados em James Whittaker e casos do dia a dia brasileiro (CPF com máscara, acentos, valores em reais, fuso).
- **Debriefing:** divisão do tempo em Teste, Bug e Setup (TBS), áreas cobertas e próximas sessões.
- **Captura automática** no navegador de teste: cliques, campos preenchidos e páginas abertas viram observações com print. Você confirma, edita (texto e tipo) ou exclui cada uma; só as revisadas entram no relatório.
- **Relatório** em Markdown para colar no Jira, GitHub, Notion ou Slack, **Copiar só os bugs** para abrir os tickets, e exportação em PDF pelo navegador.
- **Tema claro e escuro**, com botão para alternar.
- **Histórico com busca** por área, charter ou conteúdo das notas.

## Navegador de teste: um comando e pronto

Sem instalar extensão nem passar pela Chrome Web Store. Com o Node instalado:

```bash
npx github:azevedothamirest/qa-scout https://endereco-do-sistema-em-teste
```

Ou, com o projeto clonado: `npm install` e depois `npm run navegador -- https://endereco-do-sistema-em-teste`.

Abre um navegador de teste separado, com o painel do QA Scout numa janela à esquerda e o sistema à direita. Nele, **todas as abas são acompanhadas**: comece a sessão e explore, os cliques viram observações com print (no máximo 1 por segundo, com o ponto clicado marcado). O valor digitado nos campos nunca é lido nem guardado, e sessão pausada não registra nada. Seu Chrome do dia a dia não é tocado. O perfil fica em `~/.qa-scout/perfil` e guarda os logins entre uma sessão e outra. Na primeira vez, o comando baixa o Chromium sozinho.

## Privacidade

Tudo fica salvo no navegador de quem usa: `localStorage` na versão web e o armazenamento local do navegador de teste. Não há servidor, conta ou envio de dados.

## Rodando localmente

```bash
npm install
npm start          # http://localhost:4173
```

O app é `index.html` (HTML e CSS) e `app.js` (JavaScript puro), sem framework e sem build. A captura do navegador de teste fica em `extensao/`, carregada pelo comando `qa-scout`.

## Testes

A suíte e2e usa **Playwright** e roda a cada push pelo GitHub Actions, em três perfis: desktop, celular (Pixel 7) e navegador de teste (Chromium real com a captura carregada).

```bash
npx playwright install chromium
npm test
npm run test:report
```

Cobertura atual: histórico e busca, validação do charter, registro de notas por atalho e por comando, pausa do cronômetro, persistência após recarregar, geração do relatório em Markdown, regra da divisão TBS somando 100%, captura automática de cliques, campos e páginas (sem guardar o valor digitado), revisão das notas automáticas e abertura do navegador de teste com um comando.

## Próximos passos

- [ ] Abrir bug no Jira ou Azure DevOps direto da nota
- [ ] Resumo da sessão e sugestão de cenários com IA
- [ ] Métricas acumuladas por área
- [ ] Sessões em dupla

## English

QA Scout is a session-based exploratory testing companion: write a charter, run a timer, log typed notes (bug, question, idea, risk, observation) with screenshots, draw testing heuristics when stuck, and export a Markdown or PDF session report. Run `npx github:azevedothamirest/qa-scout <url>` to open a dedicated test browser where clicks, filled fields and visited pages become screenshot-backed observations for you to review. Data stays on your machine. Tested end to end with Playwright on desktop, mobile and the test browser.

---

Feito por [Thamires Azevedo](https://azevedothamirest.github.io) · QA Sênior · [@qa.thami](https://www.instagram.com/qa.thami/)
