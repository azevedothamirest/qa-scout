# Notas de atualização

O que mudou em cada versão do QA Scout. As três mais recentes estão completas; as anteriores, resumidas no fim.

| Versão | Data | Destaque |
|---|---|---|
| [1.2.3](#123--pdf-sem-o-pular-para-o-conteúdo) | 27/11/2026 | PDF sem o "Pular para o conteúdo" |
| [1.2.2](#122--apoio-opcional-e-fim-do-beta) | 16/11/2026 | Apoio opcional e fim do beta |
| [1.2.1](#121--acessibilidade-e-navegação) | 15/11/2026 | Acessibilidade e navegação |
| [1.2.0](#120--captura-com-o-painel-fechado) | 15/11/2026 | Captura com o painel fechado |
| [1.1.1](#111--correções-do-onboarding-e-da-captura) | 13/11/2026 | Correções do onboarding e da captura |
| [1.1.0](#110--onboarding-interativo) | 03/11/2026 | Onboarding interativo |
| [1.0.3](#103--formulário-captura-e-mcp-mais-claros) | 30/10/2026 | Formulário, captura e MCP mais claros |
| [1.0.2](#102--tokens-fora-das-notas) | 30/10/2026 | Tokens fora das notas |
| [1.0.1](#101--correções-de-segurança) | 30/10/2026 | Correções de segurança |

---

## 1.2.3 · PDF sem o "Pular para o conteúdo"
_27/11/2026_

**🐞 Correções**
- **PDF do relatório:** o link "Pular para o conteúdo" aparecia por cima do texto no PDF gerado pela extensão. Agora ele, o aviso de status e a região de anúncios ficam fora da impressão.

---

## 1.2.2 · Apoio opcional e fim do beta
_16/11/2026_

**✨ Mudanças**
- **Apoio opcional no Ko-fi:** a extensão ganhou uma abinha ☕ discreta no canto, que abre ao passar o mouse e aparece aberta por alguns segundos uma vez por dia. Ela só abre a página do Ko-fi numa aba nova: nada é carregado nem enviado. Todas as funções continuam gratuitas.
- **Fim do beta:** sai o selo "beta" e o aviso de beta aberto.
- **Site institucional:** os destaques do topo ficam centralizados, o baralho mostra 2 cartas e convida a instalar a extensão, o rodapé fica enxuto, sai o bloco "Travou no meio da exploração?" e entra o card do café.
- **Privacidade:** a política ganhou a seção "Apoio opcional (Ko-fi)".

---

## 1.2.1 · Acessibilidade e navegação
_15/11/2026_

Fecha o que ficou aberto da rodada de QA de UX/UI de 30/10 ([#63](https://github.com/azevedothamirest/qa-scout/issues/63)).

**✨ Novidades**
- **Cada tela tem endereço próprio** (`#/heuristicas`, `#/relatorio/<id>`...). O Voltar do navegador volta para a tela anterior, dá para abrir uma seção direto ou numa aba nova, e o menu virou links. ([#48](https://github.com/azevedothamirest/qa-scout/issues/48))
- **Trocar o idioma mantém a tela atual**, sem repetir a abertura e sem perder o charter que estava sendo digitado. ([#59](https://github.com/azevedothamirest/qa-scout/issues/59))

- **Sessão esquecida aberta para sozinha:** quando o tempo planejado acaba, a sessão é pausada e a captura para, mesmo com o painel fechado ou o app fechado. "Retomar" vale como prorrogação; "Encerrar" leva ao relatório.

**♿ Acessibilidade**
- **Notas:** "Editar", "Excluir", "Confirmar" e "Copiar bug" dizem a qual nota pertencem, e "Continuar" na confirmação de encerrar virou "Voltar à sessão". ([#54](https://github.com/azevedothamirest/qa-scout/issues/54))
- **Nomes:**
  - o card de sessão tem nome curto ("Abrir sessão …, exemplo");
  - o selo "exemplo" ficou separado do título;
  - o atalho "Espaço" saiu do nome do botão de puxar carta;
  - "Importar backup" não se repete mais. ([#49](https://github.com/azevedothamirest/qa-scout/issues/49))
- **Títulos:** um h1 por tela e nenhum salto de nível. ([#53](https://github.com/azevedothamirest/qa-scout/issues/53))
- **Navegação e debriefing:**
  - entrou o link "Pular para o conteúdo";
  - os sliders de Teste, Bug e Setup anunciam a % e a nova divisão;
  - os links do rodapé têm pelo menos 24 px. ([#60](https://github.com/azevedothamirest/qa-scout/issues/60))

**✨ Mudanças**
- **MCP:** "veja o guia de instalação" agora leva ao guia do Claude Desktop, e a dica do Chromium diz quanto tempo leva. ([#58](https://github.com/azevedothamirest/qa-scout/issues/58))
- **Markdown:** `*`, `_` e `~` digitados na nota são escapados, então o relatório mostra o que está na nota. ([#56](https://github.com/azevedothamirest/qa-scout/issues/56))
- **Home:** os números contam só as suas sessões, sem as de exemplo. ([#61](https://github.com/azevedothamirest/qa-scout/issues/61))

---

## 1.2.0 · Captura com o painel fechado
_15/11/2026_

**✨ Novidades**
- **Aviso flutuante com o painel fechado:** a captura sempre continuou com o painel lateral fechado, mas nada mostrava isso. Agora as abas acompanhadas exibem, no canto da página, "QA Scout registrando", quantos registros novos entraram, o último deles e um botão "Abrir painel". O aviso some antes de cada print e o clique nele não vira nota. ([#82](https://github.com/azevedothamirest/qa-scout/issues/82))

**🐞 Correções**
- **Painel lateral:**
  - um título de aba longo não estica mais o card da captura por cima do diário nem cria rolagem lateral;
  - no painel estreito, as abas do cabeçalho quebram em duas linhas em vez de ficarem cortadas;
  - a tela de abertura aparece só na primeira vez, e não toda vez que o painel reabre. ([#81](https://github.com/azevedothamirest/qa-scout/issues/81))

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
