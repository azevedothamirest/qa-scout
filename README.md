# QA Scout

**Explore com missão. Volte com evidência.**

QA Scout é um companheiro de teste exploratório baseado em sessões (SBTM). Você escreve o charter, liga o cronômetro, anota o que encontra no ritmo da exploração e, no fim, sai com um relatório pronto para o time.

🔗 **Acesse:** https://azevedothamirest.github.io/qa-scout/

![Testes e2e](https://github.com/azevedothamirest/qa-scout/actions/workflows/ci.yml/badge.svg)

> **Beta aberto.** Primeira vez? Siga o [tutorial](docs/tutorial.md) (uns 10 minutos). Usou? [Conte como foi](https://github.com/azevedothamirest/qa-scout/issues/new/choose): bugs, ideias e críticas são muito bem-vindos.

## Por que existe

Teste exploratório costuma ser um trabalho invisível: encontra os bugs mais interessantes, mas deixa pouco rastro. O QA Scout dá estrutura sem virar roteiro, e transforma a sessão em evidência que Produto e Dev conseguem ler.

## Funcionalidades

- **Charter no modelo de Elisabeth Hendrickson:** *Explorar ___ com ___ para descobrir ___*, mais área, ambiente e duração livre, em minutos.
- **Cronômetro com pausa**, barra de progresso e aviso de tempo extra.
- **Notas por tipo:** bug, dúvida, ideia, risco e observação, cada uma com o minuto exato da sessão.
  - `Alt+1` a `Alt+5` troca o tipo, `Ctrl+Enter` salva.
  - Prefixos de comando: `/bug`, `/duvida`, `/ideia`, `/risco`, `/obs`.
  - Prints colados com `Ctrl+V` ou anexados, comprimidos automaticamente.
- **Heurísticas:** 18 cartas com tours inspirados em James Whittaker e casos do dia a dia brasileiro (CPF com máscara, acentos, valores em reais, fuso).
- **Debriefing:** divisão do tempo em Teste, Bug e Setup (TBS), áreas cobertas e próximas sessões.
- **Captura automática** no navegador de teste: cliques, campos preenchidos e páginas abertas viram observações com print. Você confirma, edita (texto e tipo) ou exclui cada uma; só as revisadas entram no relatório.
- **Erros de console e de rede** viram notas a revisar: erro de JavaScript e falha de conexão ou 5xx chegam como bug; `console.error` e 4xx, como risco.
- **Passos para reproduzir** num clique: ao editar uma nota, o QA Scout monta a lista com os cliques, campos e páginas que vieram antes dela.
- **`Alt+Shift+M`** no sistema em teste marca o momento com print, sem sair da tela. **`Alt+1` a `Alt+5`** fazem o mesmo já com o tipo (bug, dúvida, ideia, risco, observação).
- **Captura automática ligada ao iniciar a sessão** na extensão: a aba do sistema em teste já começa acompanhada; outras abas entram com **Acompanhar a aba atual**.
- **Relatório** em Markdown para colar no Jira, GitHub, Notion ou Slack, **Copiar só os bugs** para abrir os tickets, e exportação em PDF pelo navegador.
- **Copiar bug** pronto para o Jira ou GitHub: título, ambiente, navegador, página, passos para reproduzir, resultado obtido e esperado, e os erros de console e rede do mesmo minuto.
- **Backup das sessões** em JSON: baixe e importe pelo histórico (sessões repetidas são ignoradas).
- **Tema claro e escuro**, com botão para alternar.
- **Histórico com busca** por área, charter ou conteúdo das notas.

## Extensão do Chrome

O QA Scout roda no painel lateral do Chrome, ao lado do sistema em teste:

1. Instale pela **[Chrome Web Store](https://chromewebstore.google.com/detail/qa-scout/goffncpkhonlejcokjgiobomlpiefpin)** e clique no ícone do QA Scout para abrir o painel.
2. Comece a sessão e, na página do sistema em teste, clique em **Acompanhar a aba atual**. Na primeira vez, o Chrome pede acesso aos sites: o print da aba precisa dele, e nada é pedido na instalação. Abas abertas a partir dela entram junto.
3. Explore: cliques, campos, páginas, erros e falhas de rede dessas abas viram notas a revisar. As outras abas não são registradas.

Por ser uma extensão nova, o Chrome com **proteção reforçada** pode mostrar "Prossiga com cautela" na instalação. É o aviso padrão para desenvolvedores novos na loja e some com o tempo; clique em **Continuar instalação**.

Para testar uma versão ainda não publicada: rode `npm run pacote`, descompacte o `.zip` de `dist/`, abra `chrome://extensions`, ligue o **Modo do desenvolvedor** e clique em **Carregar sem compactação**. O passo a passo da publicação está em [`docs/chrome-web-store.md`](docs/chrome-web-store.md).

## Navegador de teste: um comando e pronto

Sem instalar nada no seu Chrome. Com o Node instalado:

```bash
npx github:azevedothamirest/qa-scout https://endereco-do-sistema-em-teste
```

Ou, com o projeto clonado: `npm install` e depois `npm run navegador -- https://endereco-do-sistema-em-teste`.

Abre um navegador de teste separado, com o painel do QA Scout numa janela à esquerda e o sistema à direita. Nele, **todas as abas são acompanhadas**: comece a sessão e explore, os cliques viram observações com print (no máximo 1 por segundo, com o ponto clicado marcado). O valor digitado nos campos nunca é lido nem guardado, e sessão pausada não registra nada. Seu Chrome do dia a dia não é tocado. O perfil fica em `~/.qa-scout/perfil` e guarda os logins entre uma sessão e outra. Na primeira vez, o comando baixa o Chromium sozinho.

## Explorar com o Claude (MCP)

O QA Scout também tem um servidor [MCP](https://modelcontextprotocol.io) para o Claude fazer a sessão exploratória com você: você passa a missão, ele abre o navegador de teste, explora, anota o que encontra e devolve o relatório. A extensão grava tudo como faria com uma pessoa (cliques, campos sem o valor, páginas, erros de console e rede, prints), e a sessão fica no histórico do QA Scout para você revisar.

**Claude Code:**

```bash
claude mcp add qa-scout -- npx -y github:azevedothamirest/qa-scout mcp
```

Com o projeto clonado, prefira apontar para ele (abre mais rápido): `claude mcp add qa-scout -- node /caminho/do/qa-scout/bin/qa-scout.js mcp`.

**Claude Desktop:** em Configurações → Desenvolvedor → Editar configuração, adicione:

```json
{
  "mcpServers": {
    "qa-scout": { "command": "npx", "args": ["-y", "github:azevedothamirest/qa-scout", "mcp"] }
  }
}
```

Depois é só pedir, por exemplo: *"Use o QA Scout para explorar o checkout de https://homolog.minhaloja.com por 20 minutos, com cupons e Pix, para descobrir cobranças erradas."*

Ferramentas: `iniciar_sessao`, `navegar`, `ver_pagina`, `clicar`, `preencher`, `escolher_opcao`, `anotar`, `ver_capturas`, `sugerir_heuristica` e `encerrar_sessao`. Use só ambientes e dados de teste; o Claude é um par de exploração, e a revisão das notas e o julgamento do que importa continuam com você.

## Privacidade

Política completa: [`privacidade.html`](privacidade.html).

Tudo fica salvo no navegador de quem usa: `localStorage` na versão web e o armazenamento local do navegador de teste. Não há servidor, conta ou envio de dados.

## Rodando localmente

```bash
npm install
npm start          # http://localhost:4173
```

Sem framework e sem build: o que está no repositório é o que roda. `npm run pacote` gera o `.zip` para a Chrome Web Store.

## Estrutura do projeto

```
index.html          estrutura da página (site, painel da extensão e navegador de teste)
app.css             visual: tokens de cor, componentes e impressão do relatório
app.js              a aplicação, em JavaScript puro
privacidade.html    política de privacidade (GitHub Pages)
manifest.json       manifesto da extensão do Chrome (Manifest V3)
extensao/           captura automática (service worker, script de conteúdo, script da página)
icones/             ícones da extensão
bin/qa-scout.js     comando que abre o navegador de teste
bin/mcp.js          servidor MCP para o Claude conduzir a sessão (qa-scout mcp)
scripts/            utilitários de desenvolvimento (empacotar para a loja)
tests/              testes e2e em Playwright e a loja fictícia usada neles
docs/               tutorial, escopo e roadmap, material da Chrome Web Store
```

Quer contribuir? Veja o [guia de contribuição](CONTRIBUTING.md).

## Testes

A suíte e2e usa **Playwright** e roda a cada push pelo GitHub Actions, em três perfis: desktop, celular (Pixel 7) e navegador de teste (Chromium real com a captura carregada).

```bash
npx playwright install chromium
npm test
npm run test:report
```

Cobertura atual: histórico e busca, validação do charter, registro de notas por atalho e por comando, pausa do cronômetro, persistência após recarregar, geração do relatório em Markdown, regra da divisão TBS somando 100%, captura automática de cliques, campos e páginas (sem guardar o valor digitado), revisão das notas automáticas, captura de erros de JavaScript, console e rede, atalho de marcar o momento, passos para reproduzir e abertura do navegador de teste com um comando, backup e importação de sessões e bug copiado no formato de ticket, impressão do relatório em PDF, flashcards do método e pedido de acesso aos sites.

## Próximos passos

- [ ] Abrir bug no Jira ou Azure DevOps direto da nota
- [ ] Resumo da sessão e sugestão de cenários com IA
- [ ] Métricas acumuladas por área
- [ ] Sessões em dupla

## English

QA Scout is a free, open source companion for session-based exploratory testing (SBTM): write a charter, run a timer, log typed notes (bug, question, idea, risk, observation) with screenshots, draw testing heuristics when stuck, and export a Markdown or PDF session report. Install the [Chrome extension](https://chromewebstore.google.com/detail/qa-scout/goffncpkhonlejcokjgiobomlpiefpin) and, in the side panel, clicks, filled fields, visited pages, JavaScript errors and failed requests of the tab you follow become notes for you to review, with one-click reproduction steps, a Jira/GitHub-ready bug and `Alt+1`–`Alt+5` shortcuts. Prefer a dedicated browser? Run `npx github:azevedothamirest/qa-scout <url>`. Want Claude to explore with you? Add the MCP server: `claude mcp add qa-scout -- npx -y github:azevedothamirest/qa-scout mcp`. No server, no account: data stays on your machine. Tested end to end with Playwright. Contributions welcome: see [CONTRIBUTING.md](CONTRIBUTING.md).

---

Feito por [Thamires Azevedo](https://azevedothamirest.github.io) · QA Sênior · [@qa.thami](https://www.instagram.com/qa.thami/)
