# Extensão do Chrome

[← Voltar para o README](../README.md)

O QA Scout roda no painel lateral do Chrome, ao lado do sistema em teste:

1. Instale pela **[Chrome Web Store](https://chromewebstore.google.com/detail/qa-scout/goffncpkhonlejcokjgiobomlpiefpin)** e clique no ícone do QA Scout para abrir o painel.
2. Com a página do sistema em teste aberta, comece a sessão. Na primeira vez, o Chrome pede acesso aos sites: o print da aba precisa dele, e nada é pedido na instalação. A aba que estava aberta já entra na captura; para outra, clique em **Acompanhar a aba atual** com ela na frente. Abas abertas a partir de uma acompanhada entram junto.
3. Explore: cliques, campos, páginas, erros e falhas de rede dessas abas viram notas a revisar. As outras abas não são registradas.

Passo a passo completo, com a revisão das notas e o relatório, no [tutorial](tutorial.md).

Por ser uma extensão nova, o Chrome com **proteção reforçada** pode mostrar "Prossiga com cautela" na instalação. É o aviso padrão para desenvolvedores novos na loja e some com o tempo; clique em **Continuar instalação**.

## Testar uma versão não publicada

Abra `chrome://extensions`, ligue o **Modo do desenvolvedor**, clique em **Carregar sem compactação** e escolha a pasta `app/` do projeto. Para testar exatamente o que vai para a loja, rode `npm run pacote` e carregue o `.zip` de `dist/` descompactado. O passo a passo da publicação está em [`chrome-web-store.md`](chrome-web-store.md).
