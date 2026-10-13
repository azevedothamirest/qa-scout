# QA Scout

**Explore com missão. Volte com evidência.**

QA Scout é um companheiro de teste exploratório baseado em sessões (SBTM). Você escreve o charter, liga o cronômetro, anota o que encontra no ritmo da exploração e, no fim, sai com um relatório pronto para o time.

🔗 **Acesse:** https://azevedothamirest.github.io/qa-scout/

![Testes e2e](https://github.com/azevedothamirest/qa-scout/actions/workflows/ci.yml/badge.svg)

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
- **Relatório** em Markdown para colar no Jira, GitHub, Notion ou Slack, e exportação em PDF pelo navegador.
- **Histórico com busca** por área, charter ou conteúdo das notas.

## Privacidade

Tudo fica salvo no navegador de quem usa (`localStorage`). Não há servidor, conta ou envio de dados.

## Rodando localmente

```bash
npm install
npm start          # http://localhost:4173
```

O app é um único `index.html`, sem build.

## Testes

A suíte e2e usa **Playwright** e roda em dois perfis, desktop e celular (Pixel 7), a cada push pelo GitHub Actions.

```bash
npx playwright install chromium
npm test
npm run test:report
```

Cobertura atual: histórico e busca, validação do charter, registro de notas por atalho e por comando, pausa do cronômetro, persistência após recarregar, geração do relatório em Markdown e regra da divisão TBS somando 100%.

## Próximos passos

- [ ] Abrir bug no Jira ou Azure DevOps direto da nota
- [ ] Resumo da sessão e sugestão de cenários com IA
- [ ] Métricas acumuladas por área
- [ ] Sessões em dupla

## English

QA Scout is a session-based exploratory testing companion: write a charter, run a timer, log typed notes (bug, question, idea, risk, observation) with screenshots, draw testing heuristics when stuck, and export a Markdown or PDF session report. Data stays in your browser. Tested end to end with Playwright on desktop and mobile.

---

Feito por [Thamires Azevedo](https://azevedothamirest.github.io) · QA Sênior · [@qa.thami](https://www.instagram.com/qa.thami/)
