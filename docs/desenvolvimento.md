# Desenvolvimento

[← Voltar para o README](../README.md)

## Rodando o projeto

Precisa do [Node.js](https://nodejs.org) 18 ou mais recente.

```bash
npm install
npx playwright install chromium   # só na primeira vez
npm start                         # versão web em http://localhost:4173
npm test                          # testes e2e (desktop, celular e extensão)
```

Para testar a extensão no seu Chrome: abra `chrome://extensions`, ligue o **Modo do desenvolvedor**, clique em **Carregar sem compactação** e escolha a pasta `app/` do projeto. Na primeira vez que clicar em "Acompanhar a aba atual", o Chrome vai pedir acesso aos sites.

Para testar o navegador de teste: `npm run navegador -- https://endereco-do-sistema`.

## Estrutura

```
app/                 a extensão inteira (é a raiz do zip da Chrome Web Store) e o site
  manifest.json      manifesto da extensão (Manifest V3)
  index.html         estrutura da página (site, painel da extensão e navegador de teste)
  app.css            todo o visual: tokens de cor, componentes, impressão do relatório
  app.js             a aplicação inteira, em JavaScript puro, sem framework e sem build
  i18n.js, i18n/     idiomas: troca de idioma e dicionários (pt-PT, en, es)
  _locales/          nome e descrição da extensão em cada idioma
  extensao/          captura automática: service worker, script de conteúdo e script da página
  icones/            ícones da extensão (16, 32, 48 e 128 px)
  fontes/            Plus Jakarta Sans e JetBrains Mono (woff2, licença SIL OFL): nada vem do Google Fonts
site/                política de privacidade e termos de uso, um arquivo por idioma (publicados no GitHub Pages)
bin/qa-scout.js      comando "qa-scout": abre o navegador de teste com a extensão carregada
bin/mcp.js           servidor MCP (qa-scout mcp): o Claude conduz a sessão pelas ferramentas
scripts/             utilitários: servidor local, empacotar a extensão, chaves de tradução, resumo dos testes na CI
tests/               testes e2e em Playwright (regressao.spec.js: fluxos críticos) e as páginas de teste em fixtures/
docs/                guias, tutorial, escopo e roadmap, material da Chrome Web Store; docs/readme/ tem o README em outros idiomas
```

Não há etapa de build: o que está no repositório é o que roda.

## Regras do código

- **Sem script inline** no HTML (o Manifest V3 proíbe em páginas de extensão). Nada de `onclick=` nem `<script>` com código.
- **Nada sai do navegador.** Sem servidor, sem conta, sem envio de dados. Toda leitura e escrita de armazenamento fica em `try/catch`.
- **O valor digitado nos campos nunca é lido.** A captura descreve só o rótulo do campo.
- Textos da interface em **português do Brasil**.
- Mudou algo visual? Confira em **desktop e celular**, nos temas **escuro e claro**.

## Testes

- Toda funcionalidade nova entra com teste em `tests/`, usando Playwright.
- Título do teste em português, no formato **verbo de ação + objeto + condição**. Nunca comece com "validar" ou "verificar". Exemplo: *"Impedir início sem missão e objetivo de descoberta"*.
- Agrupe com `test.describe` pela área da tela (Histórico, Charter, Sessão em campo, Debriefing...).
- Prefira seletores acessíveis (`getByRole`, `getByLabel`); use ids e `data-*` só quando não houver alternativa.
- **Regressão:** os fluxos críticos são os testes marcados com `{ tag: '@regressao' }`. Rode só eles com `npm run test:regressao`. A tag é curta de propósito: só entra o que, se quebrar, impede o uso do QA Scout. Corrigiu um bug? Escreva o teste, mas sem a tag; ele roda na suíte completa.
- Rode `npm test` antes de subir. No pull request a CI roda só a regressão; a suíte completa roda à mão (workflow_dispatch). O resumo da execução no GitHub Actions lista o título e o resultado de cada teste.

