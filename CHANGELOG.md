# Notas de atualização

O que mudou em cada versão do QA Scout. As três mais recentes estão completas; as anteriores, resumidas no fim.

| Versão | Data | Destaque |
|---|---|---|
| [1.1.1](#111--correções-do-onboarding-e-da-captura) | 13/11/2026 | Correções do onboarding e da captura |
| [1.1.0](#110--onboarding-interativo) | 03/11/2026 | Onboarding interativo |
| [1.0.3](#103--formulário-captura-e-mcp-mais-claros) | 30/10/2026 | Formulário, captura e MCP mais claros |
| [1.0.2](#102--tokens-fora-das-notas) | 30/10/2026 | Tokens fora das notas |
| [1.0.1](#101--correções-de-segurança) | 30/10/2026 | Correções de segurança |

---

## 1.1.1 · Correções do onboarding e da captura
_13/11/2026_

Resultado da rodada de QA exploratório de 13/11 ([#76](https://github.com/azevedothamirest/qa-scout/issues/76)).

**🐞 Correções**
- **Sessão:** abrir a apresentação com uma sessão em andamento e clicar em "Começar minha primeira sessão" criava uma segunda sessão e escondia a primeira, com as notas. Agora o fim da apresentação leva de volta à sessão, e o app nunca deixa duas sessões em andamento. ([#68](https://github.com/azevedothamirest/qa-scout/issues/68))
- **MCP:** escolher uma opção numa lista e preencher data, hora, número ou deslizante voltam a virar nota nas sessões conduzidas pelo Claude. Desde a 1.0.1 essas ações não eram registradas. ([#69](https://github.com/azevedothamirest/qa-scout/issues/69))
- **Captura:** digitar uma data não gera mais várias notas iguais ("Preencheu o campo de data"); o mesmo campo repetido em seguida vira uma nota só.
- **Apresentação:**
  - o foco volta para onde estava ao fechar, e o Tab fica dentro dela ([#71](https://github.com/azevedothamirest/qa-scout/issues/71));
  - no teclado, só Alt+1 juntos viram bug, e "Copiar bug" copia o exemplo ([#72](https://github.com/azevedothamirest/qa-scout/issues/72)).
- **Política de privacidade:** data alinhada nos quatro idiomas. ([#75](https://github.com/azevedothamirest/qa-scout/issues/75))

**✨ Mudanças**
- **Nota sem tipo escolhido agora é observação**, não bug. `/bug` e `Alt+1` continuam marcando bug. ([#74](https://github.com/azevedothamirest/qa-scout/issues/74))
- **Navegador de teste:** quem abre pelo comando `qa-scout` vê a apresentação na primeira vez. ([#73](https://github.com/azevedothamirest/qa-scout/issues/73))

---

## 1.1.0 · Onboarding interativo
_03/11/2026_

**✨ Novidades**
- **Apresentação na primeira visita:** em vez de ler sobre o QA Scout, você usa. Numa mini-loja de exemplo, o clique vira nota, o erro do cupom é capturado, o `Alt+1` (ou um toque nas teclas) transforma a nota em bug e o "Copiar bug" monta o ticket pronto pro Jira. No fim, um clique começa a primeira sessão.
- Dá para pular a qualquer momento (botão **Pular** ou `Esc`) e rever pelo link **Ver apresentação** no rodapé.
- Nos quatro idiomas, no site, na extensão e no navegador de teste, respeitando quem prefere menos animação.

---

## 1.0.3 · Formulário, captura e MCP mais claros
_30/10/2026_

**🐞 Correções**
- **Charter:** o resumo de erro lista só os campos que falharam, incluindo a duração ("Confira os campos marcados: Explorar, Duração planejada."), sem depender de cor. O "!" das mensagens não é mais lido pelo leitor de tela. ([#46](https://github.com/azevedothamirest/qa-scout/issues/46))
- **Charter:** os erros continuam marcados ao trocar de aba e voltar, junto com o rascunho. ([#47](https://github.com/azevedothamirest/qa-scout/issues/47))
- **Navegação:** durante a sessão a aba se chama **Sessão ativa**, no lugar de "Em campo". ([#51](https://github.com/azevedothamirest/qa-scout/issues/51))
- **Relatório:** sessão encerrada em segundos mostra 1 min, não "0 de 5 min". ([#52](https://github.com/azevedothamirest/qa-scout/issues/52))
- **Avisos:** quando o aviso some, ele sai também da região de status e não fica preso em outras telas. ([#55](https://github.com/azevedothamirest/qa-scout/issues/55))
- **Captura:** falha de rede `ERR_CACHE_MISS` (preload e cache, como as fontes) não vira mais bug no diário: o recurso carrega normalmente depois. ([#50](https://github.com/azevedothamirest/qa-scout/issues/50))
- **MCP:** `preencher` acha o campo pelo rótulo exato e só aceita elementos editáveis. "Nota" não cai mais no grupo "Tipo da nota", e campo inexistente devolve uma explicação com o resumo da tela em vez de erro do Playwright. ([#57](https://github.com/azevedothamirest/qa-scout/issues/57))

---

## 1.0.2 · Tokens fora das notas
_30/10/2026_

**🔒 Segurança**
- **URLs sem segredos:** antes de virar nota, relatório ou bug copiado, o endereço perde usuário e senha, e tokens, códigos de redefinição, JWTs e outros valores com cara de segredo viram `***`, na query, no caminho e no fragmento (`#access_token=`). Parâmetros comuns, como `?cep=01001000`, continuam para ajudar a reproduzir. ([GHSA-cfw4-mm55-5g5v](https://github.com/azevedothamirest/qa-scout/security/advisories/GHSA-cfw4-mm55-5g5v))
- Notas gravadas antes desta versão não são alteradas: revise as antigas antes de compartilhar.

---

## 1.0.1 · Correções de segurança
_30/10/2026_

> [!IMPORTANT]
> Atualize assim que possível. Esta versão corrige quatro vulnerabilidades de gravidade média, publicadas nos [avisos de segurança do repositório](https://github.com/azevedothamirest/qa-scout/security/advisories).

**🔒 Segurança**
- **Backup:** um backup importado não injeta mais HTML no painel. Cada campo é conferido, prints só entram como imagem e tipo de nota desconhecido vira observação em vez de deixar a tela em branco. ([GHSA-6hxg-hmpc-459h](https://github.com/azevedothamirest/qa-scout/security/advisories/GHSA-6hxg-hmpc-459h))
- **Captura:** ignora cliques, campos e atalhos criados por script da própria página, limita os erros repassados a 20 por página e descarta rajadas acima de 60 eventos por segundo numa aba. ([GHSA-vh88-r3m4-957w](https://github.com/azevedothamirest/qa-scout/security/advisories/GHSA-vh88-r3m4-957w))
- **MCP:** `navegar` e `iniciar_sessao` só aceitam endereços `http` e `https`, e a aba volta para uma página em branco se um clique levar a `file://` ou `chrome-extension://`. ([GHSA-59wp-chfh-4c5f](https://github.com/azevedothamirest/qa-scout/security/advisories/GHSA-59wp-chfh-4c5f))
- **Servidor local (`npm start`):** não serve mais arquivos de fora das pastas do projeto pelo caminho com `\` do Windows e só escuta em `127.0.0.1`. ([GHSA-v693-3724-qmx9](https://github.com/azevedothamirest/qa-scout/security/advisories/GHSA-v693-3724-qmx9))

---

## Versões anteriores (resumo)

| Versão | Data | O que trouxe |
|---|---|---|
| 1.0.0 · Versão estável | 30/10/2026 | Primeira versão estável: sessões completas, captura automática, bug pronto para o ticket, navegador de teste e MCP, quatro idiomas e nenhuma requisição de rede. |
| 0.9.1 · Pronto para o compliance | 30/10/2026 | Fontes no próprio pacote, CSP sem rede, termos de uso, material de segurança e SHA-256 do pacote. |
| 0.9.0 · Quatro idiomas | 27/10/2026 | Interface, captura, relatórios e ficha da loja em pt-BR, pt-PT, inglês e espanhol, com globo no cabeçalho e primeira visita no idioma do navegador. |
| 0.8.2 · Aba MCP mais caprichada | 26/10/2026 | Exemplos de pedido destacados e ferramentas agrupadas em Sessão, Navegar e Registrar. |
| 0.8.1 · Páginas na ordem certa | 26/10/2026 | "Abriu a página" não troca mais o título ao navegar rápido (#31). |
| 0.8.0 · Explorar com o Claude | 27/10/2026 | Servidor MCP para o Claude conduzir a sessão e aba MCP no app. |
| 0.7.0 · Cobertura da captura | 25/10/2026 | Captura em SPA, shadow DOM, iframes do mesmo site, anexos, listas e botões de ícone (#13 a #19). |
| 0.6.3 · Erros repetidos e Markdown | 25/10/2026 | Erros repetidos somam com "(×N)" e o Markdown do relatório escapa HTML (#11, #12, #22). |
| 0.6.2 · Dados e privacidade | 24/10/2026 | Layout com texto longo, duas abas sem perder notas, dados corrompidos guardados e suíte de regressão na CI (#10, #20, #21, #23). |
