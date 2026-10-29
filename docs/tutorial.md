# Tutorial do QA Scout

O QA Scout é um companheiro de **teste exploratório baseado em sessões** (SBTM). Você define uma missão, explora com o cronômetro ligado e ele registra o que você faz: cliques, campos preenchidos, páginas abertas e erros de console e rede viram notas com print. No fim, você revisa e sai com um relatório pronto para colar no Jira, no GitHub ou no Slack.

Este tutorial leva uns 10 minutos. Ao final, você terá feito uma sessão completa.

> O QA Scout está em **beta aberto**. Se algo não funcionar como descrito aqui, isso já é um feedback valioso: veja [como dar feedback](#7-dê-seu-feedback).

---

## Sumário

1. [Escolha como usar](#1-escolha-como-usar)
2. [Instale a extensão](#2-instale-a-extensão)
3. [Escreva o charter](#3-escreva-o-charter)
4. [Explore](#4-explore)
5. [Revise as notas automáticas](#5-revise-as-notas-automáticas)
6. [Encerre e gere o relatório](#6-encerre-e-gere-o-relatório)
7. [Dê seu feedback](#7-dê-seu-feedback)
8. [Problemas comuns](#problemas-comuns)
9. [Perguntas frequentes](#perguntas-frequentes)

---

## 1. Escolha como usar

| Jeito | Para quem | Captura automática |
|---|---|---|
| **Extensão do Chrome** (recomendado) · [instalar](https://chromewebstore.google.com/detail/qa-scout/goffncpkhonlejcokjgiobomlpiefpin) | O dia a dia, no painel lateral do seu Chrome | Sim, na aba do sistema em teste e nas que você marcar |
| **Navegador de teste** · [guia](navegador.md) | Quem tem Node e prefere um navegador separado, sem mexer no Chrome | Sim, em todas as abas desse navegador |
| **Com o Claude (MCP)** · [guia](mcp.md) | Quem usa o Claude Code ou o Claude Desktop e quer um par de exploração | Sim, o Claude conduz o navegador de teste |
| **Versão web** · [abrir](https://azevedothamirest.github.io/qa-scout/) | Quem só quer experimentar, ou não pode instalar nada | Não. As notas e os prints são manuais |

Este tutorial segue a **extensão**. As seções 3, 5 e 6 valem para todos os jeitos, e a 4 vale também para o navegador de teste.

**Idioma:** o QA Scout fala português do Brasil, português de Portugal, inglês e espanhol. Na primeira vez ele segue o idioma do navegador; para trocar, clique no globo do cabeçalho. A escolha fica salva, e as notas automáticas passam a ser escritas no mesmo idioma.

## 2. Instale a extensão

1. Abra a página do QA Scout na **[Chrome Web Store](https://chromewebstore.google.com/detail/qa-scout/goffncpkhonlejcokjgiobomlpiefpin)** e clique em **Usar no Chrome**.
   Se o Chrome mostrar "Prossiga com cautela", é o aviso padrão para desenvolvedores novos na loja: clique em **Continuar instalação**.
2. Fixe o ícone da bússola na barra do Chrome (o ícone de quebra-cabeça → alfinete) para achar fácil.
3. Abra o sistema que você vai testar e clique no ícone do QA Scout. O painel abre na lateral, ao lado da página.

Nada é pedido na instalação. O acesso aos sites é pedido só na primeira vez que você inicia uma sessão (veja a seção 3).

<details>
<summary>Prefere o navegador de teste?</summary>

Com o [Node.js](https://nodejs.org) 18 ou mais recente instalado:

```bash
npx github:azevedothamirest/qa-scout https://endereco-do-sistema-em-teste
```

Na primeira vez, o `npx` pergunta se pode instalar o pacote (responda `y`) e o QA Scout baixa um Chromium próprio (uns 150 MB). Abrem duas janelas: o painel à esquerda e o sistema em teste à direita. Esse navegador é separado do seu Chrome e guarda os logins em `~/.qa-scout/perfil`. Nele, **todas as abas são acompanhadas**. Mais detalhes no [guia do navegador de teste](navegador.md).

</details>

## 3. Escreva o charter

No painel, clique em **Começar nova sessão**. O charter segue o modelo de Elisabeth Hendrickson:

> **Explorar** *o que você vai testar* **com** *quais recursos, dados ou técnicas* **para descobrir** *que tipo de problema*

Exemplo:

> Explorar **o pagamento com Pix no checkout** com **QR Code expirado, botão voltar e cupom** para descobrir **pedidos pagos que ficam pendentes ou cobranças em dobro**.

Preencha também a área, o ambiente e a duração em minutos (o tempo que fizer sentido para a missão) e clique em **Iniciar sessão**.

Na primeira sessão, o Chrome pergunta se o QA Scout pode acessar os sites: aceite, porque é o que permite tirar o print e registrar os cliques. O acesso só é usado nas abas acompanhadas e com a sessão rodando. A partir daí, o cronômetro conta e a **captura automática já começa na aba que estava aberta**. Quer acompanhar outra aba? Vá até ela e clique em **Acompanhar a aba atual** no painel. Abas abertas a partir de uma aba acompanhada entram sozinhas.

**Sem ideia do que explorar?** Abra a aba **Heurísticas** e clique em **Puxar outra carta** (ou aperte a barra de espaço). Cada carta traz uma heurística e um desafio do tipo *"Faz isso agora"*. O botão **Começar sessão com esta carta** já preenche o campo "com" do charter. Para relembrar SBTM, charter, PROOF e TBS, a aba **Método** tem tudo em flashcards.

## 4. Explore

Vá para a página do sistema em teste e explore normalmente. Enquanto a sessão estiver rodando, o QA Scout registra sozinho:

| O que acontece | O que vira nota |
|---|---|
| Você clica num botão, link ou item | `Clicou no botão “Pagar com Pix”`, com print e um círculo no ponto clicado |
| Você preenche um campo | `Preencheu o campo “CPF”` (o valor digitado **nunca** é lido) |
| Você escolhe uma opção numa lista | `Escolheu “RJ” em “Estado”` (listas de cartão, nascimento ou senha dizem só que houve escolha) |
| Você anexa um arquivo | `Anexou um arquivo em “Comprovante”` (sem o nome do arquivo) |
| Uma página abre (inclusive em SPA) | `Abriu a página “Checkout”` |
| Acontece um erro de JavaScript | `Erro de JavaScript: TypeError: ...`, sugerido como **bug** |
| A página chama `console.error` | `Erro no console: ...`, sugerido como **risco** |
| Uma requisição volta 4xx | `Requisição com erro: GET /api/frete → 404`, sugerida como **risco** |
| Uma requisição volta 5xx ou nem conecta | `Requisição com erro: POST /api/pix → 500` ou `Requisição falhou: ...`, sugerida como **bug** |
| Você aperta `Alt+Shift+M` no sistema em teste | `Marcou este momento`, com print da tela |
| Você aperta `Alt+1` a `Alt+5` no sistema em teste | `Bug marcado neste momento` (ou dúvida, ideia, risco, observação), com print |

Detalhes que vale saber:

- Sai **no máximo um print por segundo**. Cliques muito rápidos geram nota, mas nem todos têm print.
- Em campos de senha, a nota diz apenas "Preencheu um campo de senha".
- Componentes com shadow DOM e iframes do mesmo site também são registrados. Iframes de outros sites (anúncios, chats) ficam de fora.
- Com a sessão **pausada**, nada é registrado. Use a pausa para responder uma mensagem ou almoçar.
- **Erros repetidos não viram enxurrada:** o mesmo erro, ou a mesma requisição com falha, soma na nota que já existe, com um contador no fim, como `(×5)`.

Quer anotar algo que só você percebeu? Escreva no campo de nota do painel e escolha o tipo:

| Tipo | Atalho | Prefixo |
|---|---|---|
| Bug | `Alt+1` | `/bug` |
| Dúvida | `Alt+2` | `/duvida` |
| Ideia | `Alt+3` | `/ideia` |
| Risco | `Alt+4` | `/risco` |
| Observação | `Alt+5` | `/obs` |

`Ctrl+Enter` salva a nota. `Ctrl+V` cola um print que você tirou por conta própria. Os prefixos também funcionam em inglês e espanhol (`/question`, `/pregunta`, `/risk`, `/riesgo`...).

## 5. Revise as notas automáticas

As notas automáticas chegam com a etiqueta **auto · a revisar**. Elas **não entram no relatório** até você decidir o que fazer com cada uma:

- **Confirmar**: era isso mesmo, fica como observação (ou como bug e risco, nos erros).
- **Editar**: corrige o texto ou troca o tipo. Por exemplo, o clique em "Pagar com Pix" que não respondeu vira um **Bug** com a sua descrição. Clique em **Incluir passos para reproduzir** e o QA Scout acrescenta a lista com as ações registradas até ali (até 8 passos), que vai junto para o relatório.
- **Excluir**: era ruído.

Dica: use o filtro **a revisar** no diário da sessão para ver só as pendentes. Dá para revisar durante a sessão ou tudo de uma vez no final.

## 6. Encerre e gere o relatório

Clique em **Encerrar** e confirme. Você vai para o relatório da sessão:

1. Se ainda houver notas pendentes, elas aparecem num bloco **para revisar** no topo. Confirme ou exclua por ali mesmo.
2. Faça o **debriefing**: ajuste a divisão do tempo entre Teste, Bug e Setup (TBS), as áreas cobertas e o que ficou para as próximas sessões.
3. Clique em **Copiar Markdown** e cole no Jira, no GitHub, no Notion ou no Slack. **Copiar só os bugs** gera uma lista curta para abrir os tickets. **Salvar em PDF** abre o relatório num documento pronto para imprimir ou anexar.

Para abrir um ticket, use **Copiar bug** em qualquer nota de bug (no diário ou no relatório). Sai um texto pronto para o Jira ou GitHub com título, ambiente, navegador, página, passos para reproduzir, resultado obtido, um espaço para o resultado esperado e os erros de console e rede registrados no mesmo minuto.

A sessão fica salva no histórico, com busca por área, charter ou texto das notas.

**Faça backup de vez em quando.** No histórico, **Baixar backup** gera um arquivo `.json` com todas as sessões concluídas. Em outro computador, ou depois de limpar o navegador, **Importar backup** traz tudo de volta; sessões que já existem são ignoradas.

## 7. Dê seu feedback

O QA Scout está em beta e o que você achar ajuda a decidir os próximos passos.

- **[Contar como foi usar](https://github.com/azevedothamirest/qa-scout/issues/new?template=feedback.yml)**: o que ajudou, o que atrapalhou, o que faltou.
- **[Reportar um bug](https://github.com/azevedothamirest/qa-scout/issues/new?template=bug.yml)**: de QA para QA, capriche nos passos para reproduzir 😉
- **[Sugerir uma ideia](https://github.com/azevedothamirest/qa-scout/issues/new?template=ideia.yml)**: funcionalidade, heurística nova para o baralho, integração.

Você precisa de uma conta no GitHub para abrir uma issue. Sem conta, mande para **contato.qascout@gmail.com**. O link **Dar feedback** também está no rodapé do app.

---

## Problemas comuns

**Cliquei no sistema e nenhuma nota apareceu.**
Confira se a sessão está rodando (não pausada) e se a aba aparece no card **Captura automática** do painel. Se não aparecer, clique em **Acompanhar a aba atual** com ela na frente. Páginas internas do navegador, como `chrome://` e a própria Chrome Web Store, não podem ser acompanhadas.

**Recusei o acesso aos sites.**
Clique de novo em **Acompanhar a aba atual**: o Chrome pergunta outra vez. Também dá para liberar em `chrome://extensions` → QA Scout → **Detalhes** → **Acesso ao site**.

**O print saiu de outra tela.**
O print é da aba que está na frente no momento do clique. Se isso acontecer com frequência, [abra um bug](https://github.com/azevedothamirest/qa-scout/issues/new?template=bug.yml) contando o que você estava fazendo.

**Fechei o painel sem querer.**
Clique de novo no ícone do QA Scout. A sessão em andamento continua de onde parou. No navegador de teste, rode o comando de novo.

**No navegador de teste: `npx` não é encontrado ou o download do Chromium falha.**
Instale o Node pelo [nodejs.org](https://nodejs.org) e abra um terminal novo. Se o download falhar (proxy ou firewall da empresa), rode `npx playwright install chromium` e tente de novo, ou use a extensão.

## Perguntas frequentes

**Meus dados vão para algum servidor?**
Não. O QA Scout não tem servidor nem conta. Sessões, notas e prints ficam só no seu computador: no armazenamento da extensão, no perfil do navegador de teste ou no `localStorage` da versão web. Veja a [política de privacidade](https://azevedothamirest.github.io/qa-scout/privacidade.html).

**Ele grava o que eu digito?**
Não. O QA Scout registra *que* você preencheu um campo e qual é o rótulo dele, nunca o valor. Os prints, porém, mostram o que está na tela no momento do clique: evite explorar com dados reais de clientes.

**E no modo com o Claude (MCP)?**
A sessão e os prints continuam no seu computador, mas o Claude lê o texto das páginas que visita para conseguir explorar. Use só ambientes e dados de teste. Detalhes no [guia do MCP](mcp.md).

**Posso usar no trabalho?**
O código é aberto ([licença MIT](../LICENSE)) e você pode ler tudo o que ele faz. Se sua empresa tem regras sobre ferramentas que capturam a tela, confira antes.

**Como apago tudo?**
Na extensão, desinstale ou limpe os dados dela em `chrome://extensions`. No navegador de teste, apague a pasta `~/.qa-scout/perfil`. Na versão web, limpe os dados do site no navegador.
