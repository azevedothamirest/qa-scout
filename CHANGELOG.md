# Notas de atualização

## 1.0.1 · Correções de segurança

**Segurança**
- Backup importado não injeta mais HTML no painel: cada campo é conferido, prints só entram como imagem e tipo de nota desconhecido vira observação em vez de deixar a tela em branco (GHSA-6hxg-hmpc-459h).
- A captura ignora cliques, campos e atalhos criados por script da própria página, limita os erros repassados a 20 por página e descarta rajadas acima de 60 eventos por segundo numa aba (GHSA-vh88-r3m4-957w).
- MCP: `navegar` e `iniciar_sessao` só aceitam endereços http e https, e a aba volta para uma página em branco se um clique levar a `file://` ou `chrome-extension://` (GHSA-59wp-chfh-4c5f).
- Servidor local (`npm start`): não serve mais arquivos de fora das pastas do projeto pelo caminho com `\` do Windows e só escuta em `127.0.0.1` (GHSA-v693-3724-qmx9).

## 1.0.0 · Versão estável

A primeira versão estável do QA Scout reúne tudo o que veio até aqui:
- Sessões com charter, cronômetro, notas por tipo, baralho de heurísticas e debriefing com TBS.
- Captura automática na extensão do Chrome: cliques, campos, páginas e erros de console e rede viram notas com print.
- Passos para reproduzir, bug pronto para o Jira ou GitHub e relatório em Markdown ou PDF.
- Navegador de teste com um comando e servidor MCP para explorar com o Claude.
- Quatro idiomas: português do Brasil, português de Portugal, inglês e espanhol.
- Nenhuma requisição de rede, termos de uso e material de segurança para homologação em empresas.

## 0.9.1 · Pronto para o compliance

**Segurança**
- Fontes dentro do próprio pacote: o painel não busca mais nada no Google Fonts e não faz nenhuma requisição de rede.
- Política de segurança de conteúdo (CSP) na extensão e no site, com `connect-src 'none'`: o app não consegue falar com nenhum servidor.
- Teste automatizado que falha se o app fizer requisição para fora do site.

**Documentos**
- Termos de uso nos quatro idiomas, com link no rodapé do app.
- [Segurança e compliance](docs/seguranca.md): material para o time de segurança avaliar, com fluxo de dados, permissões, CSP e como liberar a extensão pela política do Chrome.
- `SECURITY.md` com o canal para reportar vulnerabilidades.
- `npm run pacote` mostra o SHA-256 do zip, para conferir a versão publicada.

## 0.9.0 · Quatro idiomas

**Novidades**
- **Português do Brasil, português de Portugal, inglês e espanhol** em toda a interface: charter, sessão, notas, debriefing, relatório em Markdown e PDF, bug copiado, heurísticas, Método e MCP.
- **Globo no cabeçalho** com o código do idioma (PT-BR, PT-PT, EN, ES) e os nomes de cada idioma na própria língua. Ao trocar, a tela recarrega com a abertura já no idioma novo, e a escolha fica salva até você trocar de novo.
- **Primeira visita segue o navegador:** português de Portugal só para Portugal, outro português vai para o do Brasil, e idiomas sem tradução abrem em inglês.
- **Captura automática no idioma escolhido:** "Clicked the button…", "Hizo clic en el botón…", "Pedido com erro…". No português de Portugal, separador, palavra-passe, ficheiro e consola.
- Nome e descrição da extensão nos quatro idiomas na Chrome Web Store, README e política de privacidade traduzidos.

**Correções**
- Marcar com `Alt+2`, `Alt+3` ou `Alt+5` dizia "Dúvida marcado"; agora concorda no feminino.
- Comandos de nota aceitos em qualquer idioma: `/question`, `/pregunta`, `/risk`, `/riesgo`, `/idea`, `/note`.

## 0.8.2 · Aba MCP mais caprichada
- Exemplos de pedido com cor, etiquetas de tempo e foco e o pedido em destaque.
- Ferramentas agrupadas em Sessão, Navegar e Registrar; cuidados com ícones; botão para o guia completo.

## 0.8.1 · Páginas na ordem certa
- Ao navegar rápido entre páginas com o mesmo título, a nota "Abriu a página" podia ganhar o título da página seguinte, sumindo uma e duplicando a outra (#31).

## 0.8.0 · Explorar com o Claude

**Novidades**
- **Servidor MCP** (`qa-scout mcp`): o Claude conduz a sessão exploratória no navegador de teste. Ele lê a tela, clica, preenche, consulta os erros capturados, anota bugs, dúvidas, ideias e riscos e devolve o relatório. A sessão fica no histórico do QA Scout para você revisar. Roda no terminal, no Claude Code ou no Claude Desktop. Guia em [docs/mcp.md](docs/mcp.md).
- **Aba MCP** no site e na extensão: explica o que é, como instalar e como pedir, com os comandos e exemplos de pedido prontos para copiar.

**Melhorias**
- Menu com cinco abas ajustado para caber no celular.
- Primeira execução do MCP não mistura o aviso de download do navegador com o protocolo.
- Clique em elemento que não existe responde na hora e mostra a tela, para o Claude corrigir o passo.
- Política de privacidade explica o que vai para o Claude no modo MCP (texto das páginas visitadas) e o que continua só no seu computador (sessão, notas e prints).

**Na Chrome Web Store**
- A extensão ganha só a aba MCP (informativa). As permissões não mudam.

## 0.7.0 · Cobertura da captura
- SPA, shadow DOM, iframes do mesmo site, anexos, campos sem rótulo, opção escolhida em listas, botões de ícone e corte de texto na palavra (#13 a #19).

## 0.6.3 · Erros repetidos e Markdown
- Erros e falhas de rede repetidos somam na mesma nota com contador "(×N)" (#11, #12).
- Markdown do relatório escapa HTML e marcadores; nota com várias linhas fica num item só (#22).
- Correção de perda de nota na extensão causada pelo eco do próprio salvamento.

## 0.6.2 · Dados e privacidade
- Texto longo sem espaços não quebra mais o layout (#20); duas abas não perdem notas (#21); dados corrompidos são guardados com aviso (#23); clique em área sem interação não copia o texto da página (#10).
- Suíte de regressão e CI com uma execução por pull request.
