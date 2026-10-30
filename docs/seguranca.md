# Segurança e compliance

[← Voltar para o README](../README.md)

Este documento é para o time de segurança, compliance ou TI que vai avaliar o QA Scout antes de liberar o uso. Tudo o que está aqui pode ser conferido no código, que é aberto.

## Resumo

| Pergunta | Resposta |
|---|---|
| Tem servidor ou conta? | Não. Não há back-end, login, telemetria, analytics nem anúncios. |
| Envia dados para fora do computador? | Não. A extensão e o site não fazem nenhuma requisição de rede. A política de segurança da extensão bloqueia conexões (`connect-src 'none'`). |
| Onde ficam os dados? | No armazenamento local do navegador: `chrome.storage.local` na extensão, `localStorage` no site. |
| Lê o que a pessoa digita? | Não. Registra só que um campo foi preenchido e o rótulo dele, nunca o valor. |
| Depende de bibliotecas de terceiros? | Não, a extensão não tem dependências: é HTML, CSS e JavaScript próprios. As fontes vão dentro do pacote (licença SIL OFL). |
| Licença | MIT, © 2026 Thamires Azevedo. Uso comercial permitido. |
| Termos de uso | [termos.html](https://azevedothamirest.github.io/qa-scout/termos.html) (também em pt-PT, en e es) |
| Política de privacidade | [privacidade.html](https://azevedothamirest.github.io/qa-scout/privacidade.html) (também em pt-PT, en e es) |
| Reportar vulnerabilidade | [SECURITY.md](../.github/SECURITY.md) |

## Fluxo de dados

```
Página do sistema em teste ──(clique, campo, erro)──▶ content.js ──▶ background.js (service worker)
                                                                        │ print da aba (captureVisibleTab)
                                                                        ▼
                                                    chrome.storage.local (no computador de quem usa)
                                                                        │
                                                                        ▼
                                                         Painel lateral (index.html + app.js)
                                                                        │
                                       só por ação da pessoa: copiar relatório, copiar bug, baixar backup ou PDF
```

Nenhuma etapa usa a rede. Os dados só saem do computador quando a própria pessoa copia ou baixa algo.

## O que é registrado

Só durante uma sessão em andamento e só nas abas acompanhadas:

- **Cliques:** tipo e nome do elemento ("botão Pagar"), com print da aba visível. Em áreas sem interação, só o texto do próprio elemento, nunca o texto da área inteira.
- **Campos:** só o rótulo. O valor nunca é lido. Senha aparece como "campo de senha"; anexo, só como "um arquivo", sem nome.
- **Listas (`select`):** a opção escolhida, exceto em listas com `autocomplete` de cartão, nascimento ou senha.
- **Páginas:** título e endereço, sem usuário e senha e com tokens, códigos e outros valores com cara de segredo trocados por `***` (por exemplo, `?access_token=***`). Parâmetros comuns, como `?cep=` ou `?pagina=`, ficam.
- **Erros:** mensagem de erro de JavaScript e `console.error`; método, caminho (com a mesma máscara de segredos) e código das requisições com falha. Corpo de requisição e resposta não é lido.

Com a sessão pausada ou encerrada, nada é registrado. Iframes de outros sites ficam de fora.

## Permissões da extensão

| Permissão | Para quê |
|---|---|
| `<all_urls>` (opcional) | Não é pedida na instalação. O Chrome pergunta no primeiro uso, porque o print da aba (`captureVisibleTab`) exige esse acesso e o sistema em teste pode estar em qualquer endereço. A captura só roda nas abas acompanhadas. Pode ser revogada em `chrome://extensions`. |
| `tabs`, `scripting` | Saber qual aba foi marcada, tirar o print dela e registrar cliques e campos. |
| `webRequest` | Perceber respostas com erro (4xx, 5xx) e falhas de conexão. Só leitura: nada é bloqueado ou alterado. |
| `storage`, `unlimitedStorage` | Guardar sessões e prints no computador. |
| `sidePanel` | Abrir o painel lateral. |

## Política de segurança de conteúdo (CSP)

Definida no `manifest.json` (páginas da extensão) e repetida no `index.html`:

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;
font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'
```

- Sem script inline, `eval` ou script remoto (exigência do Manifest V3, reforçada aqui).
- `connect-src 'none'`: o painel não consegue abrir conexão com nenhum servidor, nem se quisesse.
- `'unsafe-inline'` vale só para estilo (atributos `style` da interface), não para script.

Um teste automatizado (`tests/regressao.spec.js`, "Requisições externas") falha se o app fizer qualquer requisição para fora do site, e o teste do pacote confere a CSP do manifesto.

## Modo com o Claude (MCP)

É opcional, separado da extensão da loja e roda no computador da pessoa (`qa-scout mcp`, Node.js). Nesse modo, o Claude lê o texto e os campos das páginas visitadas, então esse conteúdo vai para a Anthropic sob os termos dela. Para ambientes corporativos, a recomendação é liberar só a extensão e avaliar o MCP à parte, com dados de teste.

## Liberar ou instalar pela política do Chrome

ID da extensão na Chrome Web Store: `goffncpkhonlejcokjgiobomlpiefpin`.

- **Liberar** numa lista de extensões permitidas: `ExtensionInstallAllowlist` com o ID acima.
- **Instalar em todas as máquinas:** `ExtensionInstallForcelist` com `goffncpkhonlejcokjgiobomlpiefpin;https://clients2.google.com/service/update2/crx`.
- **Restringir os sites** em que a extensão pode atuar: `ExtensionSettings` com `runtime_allowed_hosts` (por exemplo, só os domínios de homologação) e `runtime_blocked_hosts` (por exemplo, produção).

No Google Admin console, o caminho é Dispositivos → Chrome → Apps e extensões. No Windows, as mesmas políticas existem via GPO ou Intune.

## Conferir a versão publicada

Cada versão está no [CHANGELOG](../CHANGELOG.md). O comando `npm run pacote` gera o mesmo `.zip` enviado à loja e imprime o SHA-256 dele, para comparar com o arquivo publicado na release do GitHub.

## Contato

Dúvidas de segurança ou compliance: contato.qascout@gmail.com.
