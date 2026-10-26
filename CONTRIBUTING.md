# Como contribuir com o QA Scout

Obrigada pelo interesse! O QA Scout é um projeto de código aberto feito por uma QA, para QAs. Toda ajuda é bem-vinda: relatar bug, sugerir heurística nova para o baralho, melhorar texto ou mandar código.

## Relatar um bug ou sugerir uma ideia

Use os modelos de issue do repositório:

- **Bug**: de QA para QA, capriche nos passos para reproduzir, no resultado esperado e no obtido.
- **Ideia**: funcionalidade, heurística nova, integração.
- **Feedback**: como foi usar, o que ajudou e o que atrapalhou.

Prefere e-mail? Escreva para **contato.qascout@gmail.com**.

## Rodando o projeto

Precisa do [Node.js](https://nodejs.org) 18 ou mais recente.

```bash
npm install
npx playwright install chromium   # só na primeira vez
npm start                         # versão web em http://localhost:4173
npm test                          # testes e2e (desktop, celular e extensão)
```

Para testar a extensão no seu Chrome: abra `chrome://extensions`, ligue o **Modo do desenvolvedor**, clique em **Carregar sem compactação** e escolha a pasta do projeto. Na primeira vez que clicar em "Acompanhar a aba atual", o Chrome vai pedir acesso aos sites.

Para testar o navegador de teste: `npm run navegador -- https://endereco-do-sistema`.

## Estrutura

```
index.html          estrutura da página (site, painel da extensão e navegador de teste)
app.css             todo o visual: tokens de cor, componentes, impressão do relatório
app.js              a aplicação inteira, em JavaScript puro, sem framework e sem build
privacidade.html    política de privacidade (publicada no GitHub Pages)
manifest.json       manifesto da extensão do Chrome (Manifest V3)
extensao/           captura automática: service worker, script de conteúdo e script da página
icones/             ícones da extensão (16, 32, 48 e 128 px)
bin/qa-scout.js     comando "qa-scout": abre o navegador de teste com a extensão carregada
bin/mcp.js          servidor MCP (qa-scout mcp): o Claude conduz a sessão pelas ferramentas
scripts/            utilitários: empacotar a extensão e montar o resumo dos testes na CI
tests/              testes e2e em Playwright (regressao.spec.js: fluxos críticos) e a loja fictícia usada neles
docs/               tutorial, escopo e roadmap, textos e imagens da Chrome Web Store
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
- **Regressão:** os fluxos críticos ficam em `tests/regressao.spec.js` e nos testes marcados com `{ tag: '@regressao' }`. Rode só eles com `npm run test:regressao`. Corrigiu um bug ou criou um fluxo crítico? O teste entra com a tag.
- Rode `npm test` antes de abrir o pull request. A CI roda em cada pull request: primeiro a regressão, depois o resto da suíte, e lista o título e o resultado de cada teste no resumo da execução no GitHub Actions.

## Pull requests

1. Faça um fork e crie um branch a partir da `main`.
2. Mantenha o PR focado em uma coisa só.
3. Descreva o que mudou e como você testou.

Ao contribuir, você concorda que seu código seja distribuído sob a [licença MIT](LICENSE).
