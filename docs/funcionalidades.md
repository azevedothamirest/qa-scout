# Funcionalidades do QA Scout

[← Voltar para o README](../README.md)

## Sessão

- **Charter no modelo de Elisabeth Hendrickson:** *Explorar ___ com ___ para descobrir ___*, mais área, ambiente e duração livre, em minutos.
- **Cronômetro com pausa**, barra de progresso e aviso de tempo extra.
- **Notas por tipo:** bug, dúvida, ideia, risco e observação, cada uma com o minuto exato da sessão.
  - `Alt+1` a `Alt+5` troca o tipo, `Ctrl+Enter` salva.
  - Prefixos de comando: `/bug`, `/duvida`, `/ideia`, `/risco`, `/obs`.
  - Prints colados com `Ctrl+V` ou anexados, comprimidos automaticamente.
- **Heurísticas:** 18 cartas com tours inspirados em James Whittaker e casos do dia a dia brasileiro (CPF com máscara, acentos, valores em reais, fuso).

## Captura automática

Na [extensão do Chrome](extensao.md) e no [navegador de teste](navegador.md):

- **Cliques, campos preenchidos e páginas abertas** viram observações com print. Você confirma, edita (texto e tipo) ou exclui cada uma; só as revisadas entram no relatório.
- **Erros de console e de rede** viram notas a revisar: erro de JavaScript e falha de conexão ou 5xx chegam como bug; `console.error` e 4xx, como risco.
- **Passos para reproduzir** num clique: ao editar uma nota, o QA Scout monta a lista com os cliques, campos e páginas que vieram antes dela.
- **`Alt+Shift+M`** no sistema em teste marca o momento com print, sem sair da tela. **`Alt+1` a `Alt+5`** fazem o mesmo já com o tipo.
- **Ligada ao iniciar a sessão** na extensão: a aba do sistema em teste já começa acompanhada; outras abas entram com **Acompanhar a aba atual**.

## Relatório e debriefing

- **Debriefing:** divisão do tempo em Teste, Bug e Setup (TBS), áreas cobertas e próximas sessões.
- **Relatório** em Markdown para colar no Jira, GitHub, Notion ou Slack, **Copiar só os bugs** para abrir os tickets, e exportação em PDF pelo navegador.
- **Copiar bug** pronto para o Jira ou GitHub: título, ambiente, navegador, página, passos para reproduzir, resultado obtido e esperado, e os erros de console e rede do mesmo minuto.

## Histórico e dados

- **Histórico com busca** por área, charter ou conteúdo das notas.
- **Backup das sessões** em JSON: baixe e importe pelo histórico (sessões repetidas são ignoradas).
- **Tema claro e escuro**, com botão para alternar.
