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

Para cada nova versão: suba o `version` no `manifest.json` e no `package.json`, rode `npm run pacote` e envie o novo `.zip` em **Pacote → Enviar novo pacote**.

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
> • Cliques, campos preenchidos e páginas abertas viram observações com print, com o ponto clicado marcado.
> • Erros de JavaScript, console.error e falhas de rede (4xx, 5xx e conexão) viram notas sugeridas como bug ou risco.
> • Alt+Shift+M marca o momento com print, sem sair do sistema em teste.
> • Você revisa cada nota automática: confirma, edita ou exclui. Só as revisadas entram no relatório.
>
> Na hora de abrir o ticket:
> • "Incluir passos para reproduzir" monta os passos a partir do que você fez antes da nota.
> • "Copiar bug" gera o texto pronto para o Jira ou GitHub: título, ambiente, navegador, página, passos, resultado obtido e esperado, e os erros do mesmo minuto.
>
> E mais:
> • Charter no modelo de Elisabeth Hendrickson e sessões de 30, 60 ou 90 minutos.
> • Notas por tipo (bug, dúvida, ideia, risco, observação) com atalhos de teclado.
> • Baralho com 18 heurísticas para quando você travar.
> • Debriefing com divisão de tempo TBS e relatório em Markdown ou PDF.
> • Backup das sessões em arquivo.
> • Tema claro e escuro.
>
> Privacidade: não há servidor, conta nem envio de dados. Tudo fica no seu computador. O valor digitado nos campos nunca é lido, e nada é registrado fora de uma sessão em andamento ou fora das abas que você escolher acompanhar.
>
> Feito por uma QA, para QAs. Código aberto.

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
