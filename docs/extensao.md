# Extensão do Chrome

[← Voltar para o README](../README.md)

O QA Scout roda no painel lateral do Chrome, ao lado do sistema em teste:

1. Instale pela **[Chrome Web Store](https://chromewebstore.google.com/detail/qa-scout/goffncpkhonlejcokjgiobomlpiefpin)** e clique no ícone do QA Scout para abrir o painel.
2. Comece a sessão e, na página do sistema em teste, clique em **Acompanhar a aba atual**. Na primeira vez, o Chrome pede acesso aos sites: o print da aba precisa dele, e nada é pedido na instalação. Abas abertas a partir dela entram junto.
3. Explore: cliques, campos, páginas, erros e falhas de rede dessas abas viram notas a revisar. As outras abas não são registradas.

Por ser uma extensão nova, o Chrome com **proteção reforçada** pode mostrar "Prossiga com cautela" na instalação. É o aviso padrão para desenvolvedores novos na loja e some com o tempo; clique em **Continuar instalação**.

## Testar uma versão não publicada

Rode `npm run pacote`, descompacte o `.zip` de `dist/`, abra `chrome://extensions`, ligue o **Modo do desenvolvedor** e clique em **Carregar sem compactação**. O passo a passo da publicação está em [`chrome-web-store.md`](chrome-web-store.md).
