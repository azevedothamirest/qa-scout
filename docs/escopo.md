# Escopo do QA Scout

## Visão

Um app simples para QAs planejarem, executarem e documentarem sessões de teste exploratório, gerando um relatório pronto para compartilhar com o time. Dar visibilidade a um trabalho que costuma ser invisível.

## Público

- QAs manuais e híbridos
- Iniciantes aprendendo teste exploratório
- QAs de crowdtesting (uTest, Test IO)

## MVP (versão 0.1, entregue)

- [x] Charter no modelo de Elisabeth Hendrickson: Explorar ___ com ___ para descobrir ___
- [x] Área, ambiente/versão, quem testa e duração (30, 60 ou 90 min; livre em minutos desde a 0.6)
- [x] Cronômetro com pausa, barra de progresso e aviso de tempo extra
- [x] Notas por tipo: bug, dúvida, ideia, risco, observação, com o minuto da sessão
- [x] Atalhos: Alt+1 a 5 troca o tipo, Ctrl+Enter salva, prefixos /bug /duvida /ideia /risco /obs
- [x] Prints colados (Ctrl+V) ou anexados
- [x] Carta de heurística durante a sessão e baralho com 18 cartas
- [x] Debriefing: divisão Teste/Bug/Setup (TBS) somando 100%, áreas cobertas, próximas sessões
- [x] Relatório em Markdown (completo ou só bugs) e PDF pelo navegador
- [x] Histórico com busca e duas sessões de exemplo removíveis
- [x] Suíte Playwright, CI e deploy no Pages

## Versão 0.2 (beta aberto)

- [x] Navegador de teste com um comando (`npx github:azevedothamirest/qa-scout <url>`), perfil próprio que guarda logins
- [x] Captura automática: cliques, campos preenchidos (sem ler o valor) e páginas abertas viram observações com print do ponto clicado
- [x] Revisão das notas automáticas: confirmar, editar (texto e tipo) ou excluir; só as revisadas entram no relatório
- [x] Editar e excluir qualquer nota já registrada
- [x] Tema claro e escuro com botão para alternar
- [x] Tutorial (`docs/tutorial.md`) e modelos de issue para feedback, bug e ideia
- [x] Erros de JavaScript, console e rede viram notas a revisar
- [x] Passos para reproduzir montados a partir das ações registradas
- [x] Atalho Alt+Shift+M para marcar o momento com print
- [x] Suíte com 51 testes

## Versão 0.4

- [x] Backup das sessões em JSON (baixar e importar pelo histórico, ignorando repetidas)
- [x] Copiar bug no formato de ticket: ambiente, navegador, página, passos, obtido x esperado e erros do mesmo minuto
- [x] Suíte com 60 testes

## Versão 0.5 (Chrome Web Store)

- [x] Extensão do Chrome de volta, com painel lateral e "Acompanhar a aba atual", somando as novidades da 0.3 e 0.4
- [x] Ícones, pacote para a loja (`npm run pacote`), política de privacidade e textos da ficha (`docs/chrome-web-store.md`)
- [x] Publicada na Chrome Web Store: https://chromewebstore.google.com/detail/qa-scout/goffncpkhonlejcokjgiobomlpiefpin

## Versão 0.6

- [x] Acesso aos sites opcional: pedido no primeiro "Acompanhar a aba atual", não na instalação (o print exige acesso a todos os sites, então não dá para pedir site a site)
- [x] Navegador de teste com id fixo da extensão e recuperação das sessões guardadas sob o id antigo (até a 0.5, trocar o comando para `#main` escondia as sessões)
- [ ] Domínio próprio para o site em três perfis: desktop, celular e navegador de teste

## Fora do MVP (próximas versões)

- [ ] Integração com Jira e Azure DevOps para abrir bug direto da nota
- [ ] IA sugerindo cenários a partir do charter e resumindo a sessão
- [ ] Sessões em dupla ou em time
- [ ] Métricas acumuladas (tempo explorado por área, bugs por sessão)

## Versão 0.6.1

- [x] PDF do relatório com layout próprio de documento
- [x] CSS em arquivo próprio (`app.css`), código sem uso removido, guia de contribuição

## Versão 0.6.2 · dados e privacidade

- [x] Texto longo sem espaços não quebra mais o layout (#20)
- [x] Duas abas abertas não perdem notas: o app adota o que a outra aba salvou (#21)
- [x] Dados corrompidos viram cópia em `qascout.v1.corrompido` com aviso, em vez de sumir (#23)
- [x] Clique em área sem interação não copia o texto da página para a nota (#10)
- [x] Suíte de regressão (`@regressao`) e CI com um job por pull request

## Versão 0.6.3 · erros repetidos e Markdown

- [x] Erro de JS ou falha de rede que se repete soma na mesma nota ("×N") em vez de criar outra ou sumir (#11, #12)
- [x] Markdown do relatório e do "Copiar bug" escapa HTML e marcadores de bloco, e nota com várias linhas fica num item só (#22)

## Versão 0.7.0 · cobertura da captura

- [x] SPA: "Abriu a página" espera o título novo depois do pushState (#15)
- [x] Shadow DOM: clique e campo descritos pelo elemento real (`composedPath`) (#13)
- [x] Iframes do mesmo site capturados; os de outros sites (anúncios) ficam de fora (#14)
- [x] Anexo de arquivo (sem o nome), campos de data/deslizante/sem rótulo descritos pelo tipo (#16)
- [x] Select diz a opção escolhida, exceto em listas de dados sensíveis (#17)
- [x] Botão só com ícone usa o `<title>`/aria-label do SVG (#18)
- [x] Texto longo cortado na última palavra inteira, com "…" (#19)

## MCP · o Claude explora com você

- [x] Servidor MCP (`qa-scout mcp`) com ferramentas para iniciar a sessão, navegar, ler a tela, clicar, preencher, anotar, ver capturas, sortear heurística e encerrar
- [x] Aba MCP no app e na extensão (0.8.0) e guia em `docs/mcp.md`
- [ ] Ponte para o Claude in Chrome (extensão da loja, com confirmação no painel)
- [ ] Publicar na Edge Add-ons
- [ ] Firefox

## Decisões tomadas

- Web app sem servidor e sem conta no início: custo zero e nenhuma preocupação com LGPD na largada.
- Repositório público para hospedar de graça no GitHub Pages (diferente de QA Pulse e QA Sidekick, que são privados).
- Licença MIT.
- Captura automática só no navegador de teste (Chromium do Playwright com extensão interna). A extensão do Chrome avulsa foi retirada em outubro de 2026 para simplificar instalação e suporte no beta.
- A extensão voltou na 0.5 para ser publicada na Chrome Web Store, que é onde QAs procuram ferramentas. O navegador de teste continua como opção. Monetização futura: grátis o que roda no computador; pago só o que exigir servidor (sincronização, integração direta com Jira/Azure, IA, times).
- Nome: QA Scout.

## Plano de validação

- Usar o app em sessões reais em sites de prática e em crowdtesting.
- Beta com seguidores do @qa.thami (meta: 20 pessoas usando mais de uma vez).
- Sinais de sucesso: relatórios compartilhados de verdade em times e pedidos espontâneos por itens do "fora do MVP".
- Construir em público: cada etapa vira post.
