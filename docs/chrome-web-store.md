# Publicação na Chrome Web Store

Página da extensão: https://chromewebstore.google.com/detail/qa-scout/goffncpkhonlejcokjgiobomlpiefpin

Tudo o que o painel de desenvolvedor da Chrome Web Store pede, pronto para copiar e colar.

## Passo a passo

1. Crie a conta de desenvolvedor em https://chrome.google.com/webstore/devconsole (taxa única de US$ 5). Em **Configurações**: nome do editor "Thamires Azevedo", e-mail de contato `contato.qascout@gmail.com` (público, confirmado pelo link do Google) e declaração **não negociante** enquanto a extensão for grátis.
2. Gere o pacote:
   ```bash
   npm run pacote   # gera dist/qa-scout-extensao-<versão>.zip
   ```
3. No painel, clique em **Novo item** e envie o `.zip`.
4. Preencha as abas com os textos abaixo e envie as imagens de `docs/loja/`.
5. Envie para revisão. Desde a 0.6 o acesso aos sites é opcional (pedido no primeiro uso), o que reduz o aviso de "Permissões amplas do host"; mesmo assim a revisão pode levar alguns dias.

Para cada nova versão: suba o `version` no `app/manifest.json` e no `package.json`, registre a versão no `CHANGELOG.md`, rode `npm run pacote` e envie o novo `.zip` em **Pacote → Enviar novo pacote**.

## Ficha da loja

**Nome:** QA Scout

**Resumo (até 132 caracteres):**
> Teste exploratório com missão: cliques, prints, erros de console e rede viram notas, e a sessão vira relatório pronto pro time.

**Categoria:** Ferramentas de desenvolvedor

**Idioma:** Português (Brasil)

**Descrição:**

> Explore com missão. Volte com evidência.
>
> O QA Scout é um companheiro de teste exploratório baseado em sessões (SBTM). Você escreve o charter, liga o cronômetro e explora o sistema. Enquanto isso, ele registra tudo no painel lateral do Chrome:
>
> • A captura começa junto com a sessão: cliques, campos preenchidos e páginas abertas viram observações com print, com o ponto clicado marcado.
> • Erros de JavaScript, console.error e falhas de rede (4xx, 5xx e conexão) viram notas sugeridas como bug ou risco.
> • Alt+1 a Alt+5 marcam um bug, dúvida, ideia, risco ou observação com print, sem sair do sistema em teste (Alt+Shift+M marca o momento).
> • Você revisa cada nota automática: confirma, edita ou exclui. Só as revisadas entram no relatório.
>
> Na hora de abrir o ticket:
> • "Incluir passos para reproduzir" monta os passos a partir do que você fez antes da nota.
> • "Copiar bug" gera o texto pronto para o Jira ou GitHub: título, ambiente, navegador, página, passos, resultado obtido e esperado, e os erros do mesmo minuto.
>
> E mais:
> • Charter no modelo de Elisabeth Hendrickson e duração da sessão do jeito que fizer sentido.
> • Notas por tipo (bug, dúvida, ideia, risco, observação) com atalhos de teclado.
> • Baralho com 18 heurísticas para quando você travar.
> • Debriefing com divisão de tempo TBS e relatório em Markdown ou PDF.
> • Backup das sessões em arquivo e relatório em PDF.
> • Aba Método em flashcards: SBTM, charter, PROOF e métricas TBS explicados de forma rápida.
> • Aba MCP: como deixar o Claude conduzir a sessão exploratória com você, pelo Claude Code ou Claude Desktop no seu computador.
> • Português do Brasil, português de Portugal, inglês e espanhol, no globo do cabeçalho.
> • Tema escuro e claro.
>
> Privacidade: não há servidor, conta nem envio de dados. Tudo fica no seu computador. O valor digitado nos campos nunca é lido, e nada é registrado fora de uma sessão em andamento ou fora das abas que você escolher acompanhar.
>
> Feito por uma QA, para QAs. Código aberto.

## Ficha da loja em outros idiomas

O nome e a descrição curta da extensão já vêm traduzidos de `_locales/` (o Chrome mostra conforme o idioma do navegador). A ficha da loja é preenchida à parte: no painel, em **Ficha da loja**, escolha o idioma no seletor do topo, clique em **Adicionar idioma** e cole os textos abaixo. Imagens podem ser as mesmas.

### Português (Portugal)

**Resumo:**
> Teste exploratório com missão: cliques, capturas, erros de consola e de rede viram notas, e a sessão vira relatório para a equipa.

**Descrição:**

> Explore com missão. Volte com evidência.
>
> O QA Scout é um companheiro de teste exploratório baseado em sessões (SBTM). Escreve o charter, liga o cronómetro e explora o sistema. Entretanto, ele regista tudo no painel lateral do Chrome:
>
> • A captura começa com a sessão: cliques, campos preenchidos e páginas abertas passam a observações com captura de ecrã, com o ponto clicado marcado.
> • Erros de JavaScript, console.error e falhas de rede (4xx, 5xx e ligação) passam a notas sugeridas como bug ou risco.
> • Alt+1 a Alt+5 marcam um bug, dúvida, ideia, risco ou observação com captura, sem sair do sistema em teste (Alt+Shift+M marca o momento).
> • Revê cada nota automática: confirma, edita ou elimina. Só as revistas entram no relatório.
>
> Na hora de abrir o ticket:
> • "Incluir passos para reproduzir" monta os passos a partir do que fez antes da nota.
> • "Copiar bug" gera o texto pronto para o Jira ou GitHub: título, ambiente, navegador, página, passos, resultado obtido e esperado, e os erros do mesmo minuto.
>
> E mais:
> • Charter no modelo de Elisabeth Hendrickson e duração da sessão à sua medida.
> • Notas por tipo com atalhos de teclado, baralho com 18 heurísticas, debriefing com divisão de tempo TBS e relatório em Markdown ou PDF.
> • Separador MCP: como deixar o Claude conduzir a sessão exploratória consigo.
> • Português do Brasil, português de Portugal, inglês e espanhol. Tema escuro e claro.
>
> Privacidade: não há servidor, conta nem envio de dados. Tudo fica no seu computador. O valor escrito nos campos nunca é lido, e nada é registado fora de uma sessão em curso ou dos separadores que escolher acompanhar.
>
> Feito por uma QA, para QAs. Código aberto.

### English

**Summary:**
> Exploratory testing with a mission: clicks, screenshots, console and network errors become notes, and the session becomes a report.

**Description:**

> Explore with a mission. Come back with evidence.
>
> QA Scout is a companion for session-based exploratory testing (SBTM). You write the charter, start the timer and explore the system. Meanwhile, it records everything in Chrome's side panel:
>
> • Capture starts with the session: clicks, filled fields and opened pages become observations with a screenshot, with the clicked point marked.
> • JavaScript errors, console.error and network failures (4xx, 5xx and connection) become notes suggested as bug or risk.
> • Alt+1 to Alt+5 mark a bug, question, idea, risk or observation with a screenshot without leaving the system under test (Alt+Shift+M marks the moment).
> • You review each automatic note: confirm, edit or delete. Only reviewed notes go into the report.
>
> When it is time to open the ticket:
> • "Include steps to reproduce" builds the steps from what you did before the note.
> • "Copy bug" produces text ready for Jira or GitHub: title, environment, browser, page, steps, actual and expected result, and the errors from the same minute.
>
> And more:
> • Charter in Elisabeth Hendrickson's model and a session length that fits your work.
> • Typed notes with keyboard shortcuts, a deck of 18 heuristics, debriefing with TBS time split and a Markdown or PDF report.
> • MCP tab: how to let Claude run the exploratory session with you.
> • Brazilian Portuguese, European Portuguese, English and Spanish. Dark and light theme.
>
> Privacy: no server, no account, no data sent. Everything stays on your computer. Values typed into fields are never read, and nothing is recorded outside a session in progress or outside the tabs you choose to follow.
>
> Made by a QA, for QAs. Open source.

### Español

**Resumen:**
> Pruebas exploratorias con misión: clics, capturas, errores de consola y de red se vuelven notas, y la sesión, un informe.

**Descripción:**

> Explora con una misión. Vuelve con evidencia.
>
> QA Scout es un compañero para pruebas exploratorias basadas en sesiones (SBTM). Escribes el charter, pones en marcha el cronómetro y exploras el sistema. Mientras tanto, lo registra todo en el panel lateral de Chrome:
>
> • La captura empieza con la sesión: clics, campos rellenados y páginas abiertas se vuelven observaciones con captura de pantalla, con el punto pulsado marcado.
> • Errores de JavaScript, console.error y fallos de red (4xx, 5xx y conexión) se vuelven notas sugeridas como bug o riesgo.
> • Alt+1 a Alt+5 marcan un bug, duda, idea, riesgo u observación con captura, sin salir del sistema bajo prueba (Alt+Shift+M marca el momento).
> • Revisas cada nota automática: confirmas, editas o eliminas. Solo las revisadas entran en el informe.
>
> A la hora de abrir el ticket:
> • "Incluir pasos para reproducir" arma los pasos a partir de lo que hiciste antes de la nota.
> • "Copiar bug" genera el texto listo para Jira o GitHub: título, entorno, navegador, página, pasos, resultado obtenido y esperado, y los errores del mismo minuto.
>
> Y además:
> • Charter en el modelo de Elisabeth Hendrickson y duración de la sesión a tu medida.
> • Notas por tipo con atajos de teclado, baraja de 18 heurísticas, debriefing con reparto del tiempo TBS e informe en Markdown o PDF.
> • Pestaña MCP: cómo dejar que Claude conduzca la sesión exploratoria contigo.
> • Portugués de Brasil, portugués de Portugal, inglés y español. Tema oscuro y claro.
>
> Privacidad: sin servidor, sin cuenta, sin envío de datos. Todo queda en tu ordenador. El valor escrito en los campos nunca se lee, y no se registra nada fuera de una sesión en curso ni fuera de las pestañas que elijas seguir.
>
> Hecho por una QA, para QAs. Código abierto.

## Imagens (`docs/loja/`)

| Campo da loja | Arquivo |
|---|---|
| Ícone (128×128) | `icones/icone-128.png` (já vai dentro do pacote) |
| Capturas de tela (1280×800) | `captura-1-sessao.png`, `captura-2-relatorio.png`, `captura-3-heuristicas.png` |
| Bloco promocional pequeno (440×280) | `bloco-promocional-440x280.png` |

## Privacidade (aba "Práticas de privacidade")

**Finalidade única:**
> Registrar sessões de teste exploratório: anotações, cliques, prints e erros das abas que a pessoa escolhe acompanhar, para gerar o relatório da sessão.

**Justificativa das permissões:**

| Permissão | Justificativa |
|---|---|
| `sidePanel` | O app abre no painel lateral do Chrome, ao lado do sistema em teste. |
| `storage` | Guardar sessões, notas e configurações no computador da pessoa. |
| `unlimitedStorage` | Os prints das sessões ultrapassam o limite padrão de armazenamento local. |
| `tabs` | Saber qual aba a pessoa marcou para acompanhar, mostrar o título dela no painel e tirar o print da aba visível (`captureVisibleTab`). |
| `scripting` | Injetar, só nas abas acompanhadas, o script que descreve cliques e campos preenchidos (sem ler valores). |
| `webRequest` | Perceber respostas com erro (4xx/5xx) e falhas de conexão nas abas acompanhadas e registrá-las como notas. Só leitura; nada é bloqueado ou alterado. |
| Acesso aos hosts (`<all_urls>`, **opcional**) | Não é pedido na instalação: o Chrome pergunta na primeira vez que a pessoa clica em "Acompanhar a aba atual". O sistema em teste pode estar em qualquer endereço (produção, homologação, localhost) e o `captureVisibleTab` exige `<all_urls>` ou `activeTab`; o `activeTab` não serve porque a captura acompanha a sessão inteira, não um único clique no ícone. Com o acesso concedido, a extensão registra um script (`extensao/pagina.js`) que roda desde o início de cada página para perceber erros de JavaScript, mas só repassa algo quando a aba está sendo acompanhada. |

**Código remoto:** Não. Todo o JavaScript está no pacote. (As fontes do Google Fonts são só CSS e arquivos de fonte.)

**Dados coletados:** marque **nenhum**. A extensão não envia dados para fora do navegador. Se o formulário pedir, informe que conteúdo do site (prints e títulos de página) é processado **localmente** e nunca transmitido.

**Declarações:** marque as três (não vende dados, não usa para fins não relacionados, não usa para crédito).

**URL da política de privacidade:**
> https://azevedothamirest.github.io/qa-scout/privacidade.html
