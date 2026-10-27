# QA Scout

[![Português (Brasil)](https://img.shields.io/badge/Portugu%C3%AAs%20%28Brasil%29-296F82?style=for-the-badge)](README.md) [![Português (Portugal)](https://img.shields.io/badge/Portugu%C3%AAs%20%28Portugal%29-3DF5A7?style=for-the-badge)](README.pt-PT.md) [![English](https://img.shields.io/badge/English-296F82?style=for-the-badge)](README.en.md) [![Español](https://img.shields.io/badge/Espa%C3%B1ol-296F82?style=for-the-badge)](README.es.md)

**Explore com missão. Volte com evidência.**

QA Scout é um companheiro de teste exploratório baseado em sessões (SBTM). Escreve o charter, liga o cronómetro, anota o que encontra no ritmo da exploração e, no fim, sai com um relatório pronto para a equipa.

🔗 **Acesse:** https://azevedothamirest.github.io/qa-scout/

[![Testes](https://github.com/azevedothamirest/qa-scout/actions/workflows/ci.yml/badge.svg?event=pull_request)](https://github.com/azevedothamirest/qa-scout/actions/workflows/ci.yml?query=event%3Apull_request)

> **Beta aberto.** Primeira vez? Siga o [tutorial](docs/tutorial.md) (uns 10 minutos, em português do Brasil). Já usou? [Conte como correu](https://github.com/azevedothamirest/qa-scout/issues/new/choose): bugs, ideias e críticas são muito bem-vindos.

## Por que existe

Teste exploratório costuma ser um trabalho invisível: encontra os bugs mais interessantes, mas deixa pouco rastro. O QA Scout dá estrutura sem virar roteiro, e transforma a sessão em evidência que Produto e Desenvolvimento conseguem ler.

## Funcionalidades

- **Charter no modelo de Elisabeth Hendrickson:** *Explorar ___ com ___ para descobrir ___*, mais área, ambiente e duração livre, em minutos.
- **Cronómetro com pausa**, barra de progresso e aviso de tempo extra.
- **Notas por tipo:** bug, dúvida, ideia, risco e observação, cada uma com o minuto exato da sessão.
  - `Alt+1` a `Alt+5` troca o tipo, `Ctrl+Enter` guarda.
  - Prefixos de comando: `/bug`, `/duvida`, `/ideia`, `/risco`, `/obs`.
  - Capturas coladas com `Ctrl+V` ou anexados, comprimidas automaticamente.
- **Heurísticas:** 18 cartas com tours inspirados em James Whittaker e casos do dia a dia (NIF com máscara, acentos, valores em euros, fuso horário).
- **Debriefing:** divisão do tempo em Teste, Bug e Setup (TBS), áreas cobertas e próximas sessões.
- **Captura automática** no navegador de teste: cliques, campos preenchidos e páginas abertas passam a observações com captura de ecrã. Confirma, edita (texto e tipo) ou exclui cada uma; só as revistas entram no relatório.
- **Erros de consola e de rede** passam a notas por rever: erro de JavaScript e falha de ligação ou 5xx chegam como bug; `console.error` e 4xx, como risco.
- **Passos para reproduzir** num clique: ao editar uma nota, o QA Scout monta a lista com os cliques, campos e páginas que vieram antes dela.
- **`Alt+Shift+M`** no sistema em teste marca o momento com captura, sem sair do ecrã. **`Alt+1` a `Alt+5`** fazem o mesmo já com o tipo (bug, dúvida, ideia, risco, observação).
- **Captura automática ligada ao iniciar a sessão** na extensão: o separador do sistema em teste já começa acompanhado; outros separadores entram com **Acompanhar o separador atual**.
- **Relatório** em Markdown para colar no Jira, GitHub, Notion ou Slack, **Copiar só os bugs** para abrir os tickets, e exportação em PDF pelo navegador.
- **Copiar bug** pronto para o Jira ou GitHub: título, ambiente, navegador, página, passos para reproduzir, resultado obtido e esperado, e os erros de consola e rede do mesmo minuto.
- **Cópia de segurança das sessões** em JSON: transfira e importe pelo histórico (sessões repetidas são ignoradas).
- **Tema claro e escuro**, com botão para alternar.
- **Quatro idiomas:** português do Brasil, português de Portugal, inglês e espanhol, no globo do cabeçalho. Na primeira visita segue o idioma do navegador; a escolha fica guardada, e a captura automática escreve as notas no mesmo idioma.
- **Histórico com pesquisa** por área, charter ou conteúdo das notas.

## Extensão do Chrome

O QA Scout corre no painel lateral do Chrome, ao lado do sistema em teste:

1. Instale pela **[Chrome Web Store](https://chromewebstore.google.com/detail/qa-scout/goffncpkhonlejcokjgiobomlpiefpin)** e clique no ícone do QA Scout para abrir o painel.
2. Comece a sessão e, na página do sistema em teste, clique em **Acompanhar o separador atual**. Na primeira vez, o Chrome pede acesso aos sites: a captura do separador precisa dele, e nada é pedido na instalação. Separadores abertos a partir dele também entram.
3. Explore: cliques, campos, páginas, erros e falhas de rede desses separadores passam a notas por rever. Os outros separadores não são registados.

Por ser uma extensão nova, o Chrome com **proteção reforçada** pode mostrar "Prossiga com cautela" na instalação. É o aviso padrão para programadores novos na loja e desaparece com o tempo; clique em **Continuar instalação**.

Para testar uma versão ainda não publicada: corra `npm run pacote`, descomprima o `.zip` de `dist/`, abra `chrome://extensions`, ative o **Modo de programador** e clique em **Carregar expandida**. O passo a passo da publicação está em [`docs/chrome-web-store.md`](docs/chrome-web-store.md).

## Navegador de teste: um comando e pronto

Sem instalar nada no seu Chrome. Com o Node instalado:

```bash
npx github:azevedothamirest/qa-scout https://endereco-do-sistema-em-teste
```

Ou, com o projeto clonado: `npm install` e depois `npm run navegador -- https://endereco-do-sistema-em-teste`.

Abre um navegador de teste separado, com o painel do QA Scout numa janela à esquerda e o sistema à direita. Nele, **todos os separadores são acompanhados**: comece a sessão e explore, os cliques passam a observações com captura de ecrã (no máximo 1 por segundo, com o ponto clicado marcado). O valor digitado nos campos nunca é lido nem guardado, e sessão em pausa não regista nada. O seu Chrome do dia a dia não é tocado. O perfil fica em `~/.qa-scout/perfil` e guarda as sessões iniciadas entre uma sessão e outra. Na primeira vez, o comando transfere o Chromium sozinho.

## Explorar com o Claude (MCP)

O QA Scout tem um servidor [MCP](https://modelcontextprotocol.io) para o **Claude conduzir a sessão exploratória consigo**: passa-lhe a missão, ele abre o navegador de teste, lê o ecrã, clica, preenche, anota o que encontra e devolve o relatório. A captura grava tudo como faria consigo, e a sessão fica no histórico para rever.

**Corre no terminal do seu computador**, no Claude Code ou no Claude Desktop (Node.js 18+). Não funciona no claude.ai pelo navegador nem dentro da extensão, que só explica o uso no separador **MCP**.

```bash
claude mcp add qa-scout -- npx -y github:azevedothamirest/qa-scout mcp
claude mcp list   # qa-scout conectado
```

Depois, peça como um charter, com endereço e tempo:

> Use o QA Scout para uma sessão exploratória de 20 minutos em https://homolog.minhaloja.pt: explorar o checkout, com cupons e MB WAY, para descobrir cobranças erradas. Anote o que encontrar e me mostre o relatório.

Use só ambientes e dados de teste: o Claude lê o texto das páginas que visita, enquanto a sessão e as capturas ficam no seu computador. Instalação no Claude Desktop, mais exemplos de pedido, ferramentas, privacidade e solução de problemas: **[guia do MCP](docs/mcp.md)** (em português do Brasil).

## Privacidade

Política completa: [`privacidade.pt-PT.html`](privacidade.pt-PT.html).

Tudo fica guardado no navegador de quem usa: `localStorage` na versão web e o armazenamento local do navegador de teste. Não há servidor, conta ou envio de dados.

## Correr localmente

```bash
npm install
npm start          # http://localhost:4173
```

Sem framework e sem build: o que está no repositório é o que corre. `npm run pacote` gera o `.zip` para a Chrome Web Store.

## Estrutura do projeto

```
index.html          estrutura da página (site, painel da extensão e navegador de teste)
app.css             visual: tokens de cor, componentes e impressão do relatório
app.js              a aplicação, em JavaScript puro
i18n.js, i18n/      idiomas: troca de idioma e dicionários (pt-PT, en, es)
_locales/           nome e descrição da extensão em cada idioma
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

Quer contribuir? Veja o [guia de contribuição](CONTRIBUTING.md) (em português do Brasil).

## Testes

A suíte e2e usa **Playwright** e corre a cada pull request pelo GitHub Actions (a regressão), em três perfis: desktop, telemóvel (Pixel 7) e navegador de teste (Chromium real com a captura carregada).

```bash
npx playwright install chromium
npm test
npm run test:report
```

Cobertura atual: histórico e pesquisa, validação do charter, registo de notas por atalho e por comando, pausa do cronómetro, persistência após recarregar, geração do relatório em Markdown, regra da divisão TBS somando 100%, captura automática de cliques, campos e páginas (sem guardar o valor digitado), revisão das notas automáticas, captura de erros de JavaScript, consola e rede, atalho de marcar o momento, passos para reproduzir e abertura do navegador de teste com um comando, cópia de segurança e importação de sessões e bug copiado no formato de ticket, impressão do relatório em PDF, flashcards do método e pedido de acesso aos sites.

## Próximos passos

- [ ] Abrir bug no Jira ou Azure DevOps direto da nota
- [ ] Resumo da sessão e sugestão de cenários com IA
- [ ] Métricas acumuladas por área
- [ ] Sessões em dupla

---

Feito por [Thamires Azevedo](https://azevedothamirest.github.io) · QA Sênior · [@qa.thami](https://www.instagram.com/qa.thami/)
