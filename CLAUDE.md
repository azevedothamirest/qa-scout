# QA Scout

Companheiro de teste exploratório baseado em sessões (SBTM), criado por Thamires Azevedo (QA Sênior). Projeto público, faz parte do portfólio dela (azevedothamirest.github.io), ao lado de QA Pulse e QA Sidekick.

- Site: https://azevedothamirest.github.io/qa-scout/ (GitHub Pages, publicado pelo workflow `pages.yml` a cada push na `main`)
- Escopo do produto, decisões e roadmap: `docs/escopo.md`
- Ideias de outros produtos para QA: `docs/ideias-produtos.md`

## Como o projeto está montado

- O app é `index.html` (HTML + CSS) + `app.js` (JS puro), sem framework e sem build. O JS saiu do HTML porque o Manifest V3 proíbe script inline em páginas de extensão. Nada de `onclick=` nem `<script>` inline.
- A mesma base é o site (GitHub Pages) e o painel lateral da extensão do Chrome (`manifest.json` na raiz). `EXT` em `app.js` diz se está rodando na extensão; a captura automática só existe lá.
- Extensão: `extensao/background.js` (service worker) guarda as abas acompanhadas e o flag `capturando` em `chrome.storage.session`, tira prints com `captureVisibleTab` (no máximo 1/s) e grava cada evento numa chave `qascout.ev.*` do `chrome.storage.local`. `extensao/content.js` só é injetado nas abas marcadas e descreve cliques e campos sem ler valores. O painel drena as chaves `qascout.ev.*` e cria notas `{type:'obs', auto:true, pending:true}`.
- Notas com `pending:true` não contam nos totais nem entram no Markdown até serem confirmadas ou editadas.
- Dados ficam só no navegador, na chave `qascout.v1`: `localStorage` no site, `chrome.storage.local` (com `unlimitedStorage`) na extensão. Sem servidor, sem conta, sem envio de dados. Toda leitura e escrita fica em try/catch; se o storage estiver bloqueado, o app funciona em memória e avisa uma vez.
- Prints são comprimidos para JPEG (lado máximo 1100px, qualidade 0.72) antes de salvar, para não estourar a cota do `localStorage`.
- Fontes: Bricolage Grotesque (títulos), Instrument Sans (texto), IBM Plex Mono (cronômetro, dados, rótulos). Paleta verde-pinho com âmbar, tema claro e escuro por tokens CSS em `:root`. Identidade de caderno de campo e curvas de nível.
- O app também roda dentro de um artifact do Claude.ai; por isso o botão "Salvar em PDF" só aparece quando `window.self === window.top`.

## Comandos

```bash
npm install
npm start      # http://localhost:4173
npm test       # Playwright: "desktop", "celular" (Pixel 7) e "extensao" (carrega a extensão num Chromium real)
```

## Convenções de teste

- Testes e2e em `tests/`, em Playwright com `@playwright/test`.
- Título de teste em português: verbo de ação + objeto + condição. Nunca começar com "validar" ou "verificar". Ex.: "Impedir início sem missão e objetivo de descoberta".
- Agrupar com `test.describe` por área da tela (Histórico, Charter, Sessão em campo, Debriefing).
- Preferir seletores acessíveis (`getByRole`, `getByLabel`); usar `data-*` e ids só quando não houver alternativa.
- `beforeEach` limpa o `localStorage` para cada teste começar das sessões de exemplo.
- Toda funcionalidade nova entra com teste. Rodar `npm test` antes de qualquer commit.

## Como trabalhar com a Thamires

- Conversar em português. Chamar de Thamires.
- Ela é QA Sênior: pode usar termos técnicos de teste sem explicar o básico.
- Textos para LinkedIn sempre em duas versões: português e inglês.
- O projeto também vira conteúdo de "construir em público" no Instagram @qa.thami e serve como portfólio na busca de emprego, então qualidade visual e de código importam.
- Ela quer ver o app rodando e bonito: depois de mudanças visuais, conferir em desktop e celular, nos temas claro e escuro.
