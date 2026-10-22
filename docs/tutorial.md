# Tutorial do QA Scout

O QA Scout é um companheiro de **teste exploratório baseado em sessões** (SBTM). Você define uma missão, explora com o cronômetro ligado e ele registra o que você faz: cliques, campos preenchidos e páginas abertas viram observações com print. No fim, você revisa e sai com um relatório pronto para colar no Jira, no GitHub ou no Slack.

Este tutorial leva uns 10 minutos. Ao final, você terá feito uma sessão completa.

> O QA Scout está em **beta aberto**. Se algo não funcionar como descrito aqui, isso já é um feedback valioso: veja [como dar feedback](#7-dê-seu-feedback).

---

## Sumário

1. [Escolha como usar](#1-escolha-como-usar)
2. [Instale e abra o navegador de teste](#2-instale-e-abra-o-navegador-de-teste)
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
| **Navegador de teste** (recomendado) | Quem tem Node instalado e quer o registro automático | Sim, em todas as abas desse navegador |
| **Extensão do Chrome** | Quem prefere usar o próprio Chrome, sem terminal | Sim, só nas abas que você marcar com **Acompanhar a aba atual** |
| **Versão web** · [azevedothamirest.github.io/qa-scout](https://azevedothamirest.github.io/qa-scout/) | Quem só quer experimentar, ou não pode instalar nada | Não. As notas e os prints são manuais |

Este tutorial segue o **navegador de teste**. As seções 3 e 6 valem para todos os jeitos; a 4 e a 5 (captura automática) valem para o navegador de teste e para a extensão. Na extensão, a diferença é que você abre o QA Scout pelo ícone na barra do Chrome e, depois de iniciar a sessão, clica em **Acompanhar a aba atual** na página do sistema em teste.

## 2. Instale e abra o navegador de teste

**Pré-requisito:** [Node.js](https://nodejs.org) 18 ou mais recente. Para conferir, rode no terminal:

```bash
node --version
```

Depois, rode o comando abaixo, trocando o endereço pelo do sistema que você vai testar:

```bash
npx github:azevedothamirest/qa-scout https://endereco-do-sistema-em-teste
```

Na primeira vez:

- o `npx` pergunta se pode instalar o pacote: responda `y`;
- o QA Scout baixa um Chromium próprio (uns 150 MB). Isso só acontece uma vez.

Abrem duas janelas:

- **à esquerda**, o painel do QA Scout;
- **à direita**, o navegador de teste, já no endereço que você passou.

Esse navegador é separado do seu Chrome do dia a dia. Faça login no sistema em teste normalmente: o perfil fica salvo em `~/.qa-scout/perfil`, então na próxima vez você já estará logado.

<details>
<summary>Prefere clonar o projeto?</summary>

```bash
git clone https://github.com/azevedothamirest/qa-scout
cd qa-scout
npm install
npm run navegador -- https://endereco-do-sistema-em-teste
```

</details>

## 3. Escreva o charter

No painel, clique em **Começar nova sessão**. O charter segue o modelo de Elisabeth Hendrickson:

> **Explorar** *o que você vai testar* **com** *quais recursos, dados ou técnicas* **para descobrir** *que tipo de problema*

Exemplo:

> Explorar **o pagamento com Pix no checkout** com **QR Code expirado, botão voltar e cupom** para descobrir **pedidos pagos que ficam pendentes ou cobranças em dobro**.

Preencha também a área, o ambiente e a duração (30, 60 ou 90 minutos) e clique em **Iniciar sessão**. O cronômetro começa a contar.

**Sem ideia do que explorar?** Abra a aba **Heurísticas** e clique em **Puxar outra carta** (ou aperte a barra de espaço). Cada carta traz uma heurística e um desafio do tipo *"Faz isso agora"*. O botão **Começar sessão com esta carta** já preenche o campo "com" do charter.

## 4. Explore

Vá para a janela do sistema em teste e explore normalmente. Enquanto a sessão estiver rodando, o QA Scout registra sozinho:

| O que você faz | O que vira nota |
|---|---|
| Clica num botão, link ou item | `Clicou no botão “Pagar com Pix”`, com print e um círculo no ponto clicado |
| Preenche um campo | `Preencheu o campo “CPF”` (o valor digitado **nunca** é lido) |
| Abre uma página | `Abriu a página “Checkout”` |

| Acontece um erro de JavaScript | `Erro de JavaScript: TypeError: ...`, sugerido como **bug** |
| A página chama `console.error` | `Erro no console: ...`, sugerido como **risco** |
| Uma requisição volta 4xx | `Requisição com erro: GET /api/frete → 404`, sugerida como **risco** |
| Uma requisição volta 5xx ou nem conecta | `Requisição com erro: POST /api/pix → 500`, sugerida como **bug** |
| Aperta `Alt+Shift+M` no sistema em teste | `Marcou este momento`, com print da tela |

Detalhes que vale saber:

- Sai **no máximo um print por segundo**. Cliques muito rápidos geram nota, mas nem todos têm print.
- Em campos de senha, a nota diz apenas "Preencheu um campo de senha".
- Com a sessão **pausada**, nada é registrado. Use a pausa para responder uma mensagem ou almoçar.
- Abas novas abertas nesse navegador também são acompanhadas.
- Erros repetidos não viram uma enxurrada de notas: o mesmo erro aparece uma vez por página (até 20 por página), e a mesma requisição com falha, uma vez a cada 10 segundos.

Quer anotar algo que só você percebeu? Escreva no campo de nota do painel e escolha o tipo:

| Tipo | Atalho | Prefixo |
|---|---|---|
| Bug | `Alt+1` | `/bug` |
| Dúvida | `Alt+2` | `/duvida` |
| Ideia | `Alt+3` | `/ideia` |
| Risco | `Alt+4` | `/risco` |
| Observação | `Alt+5` | `/obs` |

`Ctrl+Enter` salva a nota. `Ctrl+V` cola um print que você tirou por conta própria.

## 5. Revise as notas automáticas

As notas automáticas chegam com a etiqueta **auto · a revisar** e um fundo amarelado. Elas **não entram no relatório** até você decidir o que fazer com cada uma:

- **Confirmar**: era isso mesmo, fica como observação.
- **Editar**: corrige o texto ou troca o tipo. Por exemplo, o clique em "Pagar com Pix" que não respondeu vira um **Bug** com a sua descrição. Clique em **Incluir passos para reproduzir** e o QA Scout acrescenta a lista com as ações registradas até ali (até 8 passos), que vai junto para o relatório.
- **Excluir**: era ruído.

Dica: use o filtro **a revisar** no diário da sessão para ver só as pendentes. Dá para revisar durante a sessão ou tudo de uma vez no final.

## 6. Encerre e gere o relatório

Clique em **Encerrar** e confirme. Você vai para o relatório da sessão:

1. Se ainda houver notas pendentes, elas aparecem num bloco **para revisar** no topo. Confirme ou exclua por ali mesmo.
2. Faça o **debriefing**: ajuste a divisão do tempo entre Teste, Bug e Setup (TBS), as áreas cobertas e o que ficou para as próximas sessões.
3. Clique em **Copiar Markdown** e cole no Jira, no GitHub, no Notion ou no Slack. **Copiar só os bugs** gera uma lista curta para abrir os tickets.

Para abrir um ticket, use **Copiar bug** em qualquer nota de bug (no diário ou no relatório). Sai um texto pronto para o Jira ou GitHub com título, ambiente, navegador, página, passos para reproduzir, resultado obtido, um espaço para o resultado esperado e os erros de console e rede registrados no mesmo minuto.

A sessão fica salva no histórico, com busca por área, charter ou texto das notas.

**Faça backup de vez em quando.** No histórico, **Baixar backup** gera um arquivo `.json` com todas as sessões concluídas. Em outro computador, ou depois de limpar o navegador, **Importar backup** traz tudo de volta; sessões que já existem são ignoradas.

## 7. Dê seu feedback

O QA Scout está em beta e o que você achar ajuda a decidir os próximos passos.

- **[Contar como foi usar](https://github.com/azevedothamirest/qa-scout/issues/new?template=feedback.yml)**: o que ajudou, o que atrapalhou, o que faltou.
- **[Reportar um bug](https://github.com/azevedothamirest/qa-scout/issues/new?template=bug.yml)**: de QA para QA, capriche nos passos para reproduzir 😉
- **[Sugerir uma ideia](https://github.com/azevedothamirest/qa-scout/issues/new?template=ideia.yml)**: funcionalidade, heurística nova para o baralho, integração.

Você precisa de uma conta no GitHub para abrir uma issue. O link **Dar feedback** também está no rodapé do app.

---

## Problemas comuns

**`npx` diz que o comando não foi encontrado.**
O Node não está instalado ou não está no PATH. Instale pelo [nodejs.org](https://nodejs.org) e abra um terminal novo.

**O download do Chromium falhou.**
Pode ser proxy ou firewall da empresa. Rode `npx playwright install chromium` e tente de novo. Se não der, use a extensão do Chrome ou a versão web.

**Cliquei no sistema e nenhuma nota apareceu.**
Confira se a sessão está rodando (não pausada) e se o card do painel mostra "Captura automática · navegador de teste". Páginas internas do navegador, como `chrome://`, não são acompanhadas. Cliques dentro de iframes de outros domínios também não.

**O print saiu de outra tela.**
O print é da aba que está na frente no momento do clique. Se isso acontecer com frequência, [abra um bug](https://github.com/azevedothamirest/qa-scout/issues/new?template=bug.yml) contando o que você estava fazendo.

**Fechei o painel sem querer.**
Feche o navegador de teste e rode o comando de novo. A sessão em andamento continua de onde parou.

## Perguntas frequentes

**Meus dados vão para algum servidor?**
Não. O QA Scout não tem servidor nem conta. Sessões, notas e prints ficam só no seu computador: no perfil do navegador de teste, no armazenamento da extensão ou no `localStorage` da versão web. Veja a [política de privacidade](https://azevedothamirest.github.io/qa-scout/privacidade.html).

**Ele grava o que eu digito?**
Não. O QA Scout registra *que* você preencheu um campo e qual é o rótulo dele, nunca o valor. Os prints, porém, mostram o que está na tela no momento do clique: evite explorar com dados reais de clientes.

**Posso usar no trabalho?**
O código é aberto ([licença MIT](../LICENSE)) e você pode ler tudo o que ele faz. Se sua empresa tem regras sobre ferramentas que capturam a tela, confira antes.

**Como guardo uma cópia das minhas sessões?**
No histórico, clique em **Baixar backup**. Para restaurar, use **Importar backup** com o arquivo `.json`.

**Como apago tudo?**
No navegador de teste, apague a pasta `~/.qa-scout/perfil`. Na versão web, limpe os dados do site no navegador.
