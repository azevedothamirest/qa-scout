# QA Scout

Companheiro de teste exploratório baseado em sessões (SBTM), criado por Thamires Azevedo (QA Sênior). Projeto público, faz parte do portfólio dela (azevedothamirest.github.io), ao lado de QA Pulse e QA Sidekick.

- Site: https://azevedothamirest.github.io/qa-scout/ (GitHub Pages, publicado pelo workflow `pages.yml` a cada push na `main`)
- Escopo do produto, decisões e roadmap: `docs/escopo.md`

## Como o projeto está montado

- O app é `index.html` (estrutura) + `app.css` (visual) + `app.js` (JS puro), sem framework e sem build. Estrutura de pastas e regras para quem contribui em `CONTRIBUTING.md`. O JS saiu do HTML porque o Manifest V3 proíbe script inline em páginas de extensão. Nada de `onclick=` nem `<script>` inline.
- A mesma base é o site (GitHub Pages), o painel lateral da extensão do Chrome (`manifest.json` na raiz + `extensao/`) e o painel do navegador de teste, que carrega a mesma extensão. `EXT` em `app.js` diz se está rodando na extensão; a captura automática só existe lá. O comando `qa-scout` grava `qascout.modo = 'navegador'` (todas as abas de site são acompanhadas); sem esse flag, só as abas marcadas com "Acompanhar a aba atual" (lista `abas` em `chrome.storage.session`; abas abertas a partir delas entram junto).
- Extensão: `extensao/background.js` (service worker) decide quais abas acompanhar (todas no navegador de teste, as marcadas na extensão), guarda o flag `capturando` em `chrome.storage.session`, tira prints com `captureVisibleTab` (no máximo 1/s) e grava cada evento numa chave `qascout.ev.*` do `chrome.storage.local`. `extensao/content.js` é injetado nas abas de site e descreve cliques e campos sem ler valores (em container, só o texto próprio do elemento, nunca o `innerText` da área toda; select diz a opção, exceto com `autocomplete` sensível; anexo diz só que houve arquivo). Usa `composedPath()` para shadow DOM (e ouve `change` na shadow root ao focar), roda em iframes do mesmo site (`allFrames`; os de outros sites saem logo no início) e pede `cmd:'quadros'` ao background quando um iframe carrega depois. O título de SPA vem de `tituloAtualizado()` no background, que espera o título mudar após o pushState. Também trata os atalhos `Alt+Shift+M` e `Alt+1` a `Alt+5` no sistema em teste (evento `marca`, sempre com print; com `Alt+número` vem `nota` com o tipo). `extensao/pagina.js` roda no world MAIN desde `document_start` (registrado pelo background quando há acesso aos sites), pega erros de JS e `console.error` e repassa ao content.js por `CustomEvent`. Falhas de rede vêm de `chrome.webRequest` no background. O evento pode trazer `nota` (`bug`/`ris`) para sugerir o tipo. Erros e falhas de rede levam `chave` (no `pagina.js`, números da mensagem viram `#`; até 20 erros diferentes por página, repetições vão como contagem 1 s depois): o painel soma na nota que já tem a mesma chave com `contaRepeticao()`, que mantém "(×N)" no fim do texto. O painel drena as chaves `qascout.ev.*` e cria notas `{type, auto:true, pending:true, origem, passo}`; `passosAte()` monta os passos para reproduzir a partir das notas com origem clique/campo/pagina/marca.
- Acesso aos sites: no `manifest.json` (o da loja) é `optional_host_permissions: ["<all_urls>"]`, pedido por `chrome.permissions.request` no clique de "Acompanhar a aba atual" (antes de qualquer `await`, para não perder o gesto). Não dá para pedir site a site: `captureVisibleTab` exige `<all_urls>` ou `activeTab`. O `pagina.js` não está no manifesto; o background o registra com `chrome.scripting.registerContentScripts` quando o acesso existe (`sincronizaScriptPagina`).
- Comando `qa-scout` (`bin/qa-scout.js`, também `npm run navegador`): `prepararExtensao()` copia a extensão para `~/.qa-scout/perfil-extensao` com `host_permissions` já concedido e a `key` fixa (id `ID_FIXO`); `recuperaSessoesAntigas()` copia o storage do id antigo na primeira execução. Abre um Chromium do Playwright com perfil próprio em `~/.qa-scout/perfil` e essa cópia carregada, grava o modo navegador e abre o painel numa janela popup de 440 px à esquerda. Usa o Chromium do Playwright porque o Chrome estável não carrega mais extensão por linha de comando. `abrir()` é exportada para os testes.
- MCP (`bin/mcp.js`, `qa-scout mcp` ou `npm run mcp`): servidor stdio com `@modelcontextprotocol/sdk` para o Claude conduzir a sessão. `criarFerramentas()` abre o navegador de teste sob demanda (`abrir()`) e expõe `iniciar_sessao`, `navegar`, `ver_pagina` (árvore acessível do Playwright, cortada em `MAX_PAGINA`), `clicar`, `preencher`, `escolher_opcao`, `anotar`, `ver_capturas`, `sugerir_heuristica` (lê `HEUR` do `app.js`) e `encerrar_sessao`. Sessão, notas e encerramento passam pela própria tela do painel (mesmos botões que a pessoa usa), então a extensão grava e o histórico fica igual. Na saída padrão só o protocolo; logs vão para a saída de erro. Testes em `tests/mcp-extensao.spec.js`. Guia para quem usa em `docs/mcp.md`; no app, a aba **MCP** (`viewMcp()`, `MCP_PEDIDOS`) só explica e copia os comandos e pedidos (`data-copiar`), porque o servidor roda no terminal da pessoa.
- Na extensão, "Iniciar sessão" pede o acesso aos sites no mesmo clique e acompanha a aba ativa (`acompanharAbaAtual({auto:true})`). "Salvar em PDF" abre `index.html#imprimir=<id>` numa aba nova, porque o painel lateral não imprime. O PDF usa um documento próprio (`docImpressao()`, `.doc`): só ele aparece em `@media print`, claro, em A4 e com `print-color-adjust: exact` para as cores dos tipos. Duração planejada é livre (1 a 480 min); erros do charter usam `marcaErro()` (`aria-invalid` + mensagem por campo + caixa `#form-err`).
- Notas com `pending:true` não contam nos totais nem entram no Markdown até serem confirmadas ou editadas.
- Dados ficam só no navegador, na chave `qascout.v1`: `localStorage` no site, `chrome.storage.local` (com `unlimitedStorage`) na extensão e no navegador de teste. Sem servidor, sem conta, sem envio de dados. Toda leitura e escrita fica em try/catch; se o storage estiver bloqueado, o app funciona em memória e avisa uma vez. `estadoValido()` confere o que foi lido: se estiver ilegível, vai para `qascout.v1.corrompido` e o app avisa. Quando outra aba salva (evento `storage` no site, `chrome.storage.onChanged` na extensão), `adotarEstado()` carrega o estado novo preservando o que está sendo digitado.
- Backup: `baixarBackup()` gera `{app:'qa-scout', formato:1, sessions}` só com sessões concluídas; `importarBackup()` valida o formato e ignora ids repetidos.
- Markdown (`toMarkdown()`, `bugMarkdown()`): texto digitado passa por `mdInline()`/`mdBloco()`, que escapam HTML, links, `|` e marcadores de bloco no início da linha.
- `bugMarkdown()` monta o bug para o Jira/GitHub (botão "Copiar bug" nas notas de bug); `navegadorAtual()` é gravado em `s.navegador` ao iniciar a sessão.
- Chrome Web Store: `npm run pacote` (`scripts/empacotar.js`) gera `dist/qa-scout-extensao-<versão>.zip` só com manifest, `index.html`, `app.css`, `app.js`, `extensao/` e `icones/`. Arquivo novo que a extensão precise: incluir em `scripts/empacotar.js`, em `ARQUIVOS_EXTENSAO` (`bin/qa-scout.js`), no `files` do `package.json` e no `pages.yml`. Textos da ficha e justificativas das permissões em `docs/chrome-web-store.md`; imagens em `docs/loja/`; política em `privacidade.html` (publicada no Pages). A versão fica no `manifest.json` e no `package.json`: suba as duas juntas.
- Prints são comprimidos para JPEG (lado máximo 1100px, qualidade 0.72) antes de salvar, para não estourar a cota do `localStorage`.
- Visual (desde a 0.6): escuro como padrão (`temaAtual()` cai em `dark`; o claro fica em `:root[data-theme="light"]`), paleta neon (menta `#3DF5A7`, ciano, roxo, rosa, amarelo) e degradê `--grad` nos botões principais. Fontes: Plus Jakarta Sans (tudo) e JetBrains Mono (cronômetro, horários, atalhos). A camada "visual neon" no fim do `app.css` sobrepõe os componentes. Ícone: bússola com agulha inclinada a 40° (aro e agulha `#296F82`, ponta sul `#8AE3D7`, rodela interna `#1B4E5C`, sombra escura sob a agulha) dentro de um disco `#0F2B33`, com cores fixas para funcionar em qualquer fundo (`icones/` e SVG inline). Aba Método em flashcards (`CARTAS_METODO`, `virarCarta()`).
- O app também roda dentro de um artifact do Claude.ai; por isso o botão "Salvar em PDF" só aparece quando `window.self === window.top`.

## Comandos

```bash
npm install
npm start      # http://localhost:4173
npm test       # Playwright: "desktop", "celular" (Pixel 7) e "extensao" (carrega a extensão num Chromium real)
npm run test:regressao  # só a suíte de regressão (testes com a tag @regressao)
npm run pacote # .zip da extensão para a Chrome Web Store
npm run mcp    # servidor MCP (o Claude conduz a sessão exploratória)
```

## Convenções de teste

- Testes e2e em `tests/`, em Playwright com `@playwright/test`.
- Título de teste em português: verbo de ação + objeto + condição. Nunca começar com "validar" ou "verificar". Ex.: "Impedir início sem missão e objetivo de descoberta".
- Agrupar com `test.describe` por área da tela (Histórico, Charter, Sessão em campo, Debriefing).
- Preferir seletores acessíveis (`getByRole`, `getByLabel`); usar `data-*` e ids só quando não houver alternativa.
- `beforeEach` limpa o `localStorage` para cada teste começar das sessões de exemplo.
- Regressão: `tests/regressao.spec.js` cobre as jornadas críticas de ponta a ponta, e testes de outras suítes que protegem fluxo crítico levam `{ tag: '@regressao' }`. A CI (`ci.yml`) roda no pull request só o job "Regressão · fluxos críticos" (`--grep @regressao`), com o nome "Testes · PR #n"; a "Suíte completa" (o resto) roda no push para a main e as duas rodam à mão (workflow_dispatch); `scripts/resumo-testes.js` publica o título de cada teste no resumo da execução. A tag `@regressao` é curta de propósito (cerca de 12 testes): só entra o que, se quebrar, impede o uso (sessão até o relatório, captura, perda de dados, privacidade). Bug corrigido ganha teste, mas sem a tag por padrão; para pôr um teste novo na tag, tire outro ou justifique no PR.
- Toda funcionalidade nova entra com teste. Rodar `npm test` antes de qualquer commit.

## Como trabalhar com a Thamires

- Conversar em português. Chamar de Thamires.
- Ela é QA Sênior: pode usar termos técnicos de teste sem explicar o básico.
- Textos para LinkedIn sempre em duas versões: português e inglês.
- O projeto também vira conteúdo de "construir em público" no Instagram @qa.thami e serve como portfólio na busca de emprego, então qualidade visual e de código importam.
- Ela quer ver o app rodando e bonito: depois de mudanças visuais, conferir em desktop e celular, nos temas claro e escuro.
