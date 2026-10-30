# Notas de atualização

O que mudou em cada versão do QA Scout. As três mais recentes estão completas; as anteriores, resumidas no fim.

| Versão | Data | Destaque |
|---|---|---|
| [1.0.3](#103--captura-sem-ruído-e-mcp-mais-preciso) | 30/10/2026 | Captura sem ruído e MCP mais preciso |
| [1.0.2](#102--tokens-fora-das-notas) | 30/10/2026 | Tokens fora das notas |
| [1.0.1](#101--correções-de-segurança) | 30/10/2026 | Correções de segurança |

---

## 1.0.3 · Captura sem ruído e MCP mais preciso
_30/10/2026_

**🐞 Correções**
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
| 1.0.0 · Versão estável | 30/10/2026 | Primeira versão estável: sessões, captura automática com print, bug pronto para o ticket, navegador de teste, MCP e quatro idiomas. |
| 0.9.1 · Pronto para o compliance | 30/10/2026 | Nenhuma requisição de rede (fontes no pacote e CSP com `connect-src 'none'`), termos de uso, material de segurança e canal para reportar vulnerabilidades. |
| 0.9.0 · Quatro idiomas | 27/10/2026 | Interface, captura, relatórios e ficha da loja em pt-BR, pt-PT, inglês e espanhol, com globo no cabeçalho e primeira visita no idioma do navegador. |
| 0.8.2 · Aba MCP mais caprichada | 26/10/2026 | Exemplos de pedido destacados e ferramentas agrupadas em Sessão, Navegar e Registrar. |
| 0.8.1 · Páginas na ordem certa | 26/10/2026 | "Abriu a página" não troca mais o título ao navegar rápido (#31). |
| 0.8.0 · Explorar com o Claude | 27/10/2026 | Servidor MCP para o Claude conduzir a sessão e aba MCP no app. |
| 0.7.0 · Cobertura da captura | 25/10/2026 | Captura em SPA, shadow DOM, iframes do mesmo site, anexos, listas e botões de ícone (#13 a #19). |
| 0.6.3 · Erros repetidos e Markdown | 25/10/2026 | Erros repetidos somam com "(×N)" e o Markdown do relatório escapa HTML (#11, #12, #22). |
| 0.6.2 · Dados e privacidade | 24/10/2026 | Layout com texto longo, duas abas sem perder notas, dados corrompidos guardados e suíte de regressão na CI (#10, #20, #21, #23). |
