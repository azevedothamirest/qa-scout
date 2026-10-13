# Escopo do QA Scout

## Visão

Um app simples para QAs planejarem, executarem e documentarem sessões de teste exploratório, gerando um relatório pronto para compartilhar com o time. Dar visibilidade a um trabalho que costuma ser invisível.

## Público

- QAs manuais e híbridos
- Iniciantes aprendendo teste exploratório
- QAs de crowdtesting (uTest, Test IO)

## MVP (versão 0.1, entregue)

- [x] Charter no modelo de Elisabeth Hendrickson: Explorar ___ com ___ para descobrir ___
- [x] Área, ambiente/versão, quem testa e duração (30, 60 ou 90 min)
- [x] Cronômetro com pausa, barra de progresso e aviso de tempo extra
- [x] Notas por tipo: bug, dúvida, ideia, risco, observação, com o minuto da sessão
- [x] Atalhos: Alt+1 a 5 troca o tipo, Ctrl+Enter salva, prefixos /bug /duvida /ideia /risco /obs
- [x] Prints colados (Ctrl+V) ou anexados
- [x] Carta de heurística durante a sessão e baralho com 18 cartas
- [x] Debriefing: divisão Teste/Bug/Setup (TBS) somando 100%, áreas cobertas, próximas sessões
- [x] Relatório em Markdown (completo ou só bugs) e PDF pelo navegador
- [x] Histórico com busca e duas sessões de exemplo removíveis
- [x] Suíte Playwright (24 testes: desktop e celular), CI e deploy no Pages

## Fora do MVP (próximas versões)

- [ ] Integração com Jira e Azure DevOps para abrir bug direto da nota
- [ ] IA sugerindo cenários a partir do charter e resumindo a sessão
- [ ] Extensão de navegador para capturar console e rede
- [ ] Sessões em dupla ou em time
- [ ] Métricas acumuladas (tempo explorado por área, bugs por sessão)
- [ ] Exportar e importar sessões em JSON (backup, já que os dados ficam no navegador)
- [ ] Editar uma nota já registrada

## Decisões tomadas

- Web app sem servidor e sem conta no início: custo zero e nenhuma preocupação com LGPD na largada.
- Repositório público para hospedar de graça no GitHub Pages (diferente de QA Pulse e QA Sidekick, que são privados).
- Licença MIT.
- Nome: QA Scout.

## Plano de validação

- Usar o app em sessões reais em sites de prática e em crowdtesting.
- Beta com seguidores do @qa.thami (meta: 20 pessoas usando mais de uma vez).
- Sinais de sucesso: relatórios compartilhados de verdade em times e pedidos espontâneos por itens do "fora do MVP".
- Construir em público: cada etapa vira post.
