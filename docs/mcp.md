# Explorar com o Claude (MCP)

O QA Scout tem um servidor [MCP](https://modelcontextprotocol.io) para o Claude conduzir uma sessão de teste exploratório com você. Você passa a missão, como faria num charter, e o Claude:

1. abre o navegador de teste do QA Scout, com o painel à esquerda e o sistema à direita;
2. inicia a sessão com o charter e o tempo planejado;
3. lê a tela, clica, preenche e navega seguindo a missão;
4. consulta o que a captura pegou (erros de JavaScript, `console.error`, falhas de rede);
5. anota bugs, dúvidas, ideias, riscos e observações com o passo a passo;
6. encerra, preenche o debriefing e devolve o relatório em Markdown.

A captura grava tudo como faria com uma pessoa, e a sessão fica no histórico do QA Scout, com as notas automáticas **a revisar**.

## Onde roda

**No terminal do seu computador**, no [Claude Code](https://claude.com/claude-code) ou no Claude Desktop. O servidor abre um navegador local, então não funciona no Claude pelo navegador (claude.ai), no celular nem dentro da extensão do Chrome. A extensão e o site só explicam como usar, na aba **MCP**.

Requisitos:

- [Node.js](https://nodejs.org) 18 ou mais recente;
- Claude Code ou Claude Desktop;
- na primeira sessão, o Chromium de teste é baixado sozinho (um ou dois minutos). Para adiantar: `npx playwright install chromium`.

## Instalar

**Claude Code** (no terminal, uma vez só):

```bash
claude mcp add qa-scout -- npx -y github:azevedothamirest/qa-scout mcp
claude mcp list   # o qa-scout deve aparecer como conectado
```

Com o projeto clonado, abre mais rápido apontando para ele:

```bash
claude mcp add qa-scout -- node /caminho/do/qa-scout/bin/qa-scout.js mcp
```

**Claude Desktop:** em Configurações → Desenvolvedor → Editar configuração, adicione e reinicie o app:

```json
{
  "mcpServers": {
    "qa-scout": { "command": "npx", "args": ["-y", "github:azevedothamirest/qa-scout", "mcp"] }
  }
}
```

## Como pedir

Peça como você escreveria um charter: **o que explorar, com quais recursos, para descobrir o quê e por quanto tempo**, e o endereço do sistema em teste.

> Use o QA Scout para uma sessão exploratória de 20 minutos em https://homolog.minhaloja.com: explorar o checkout, com cupons e Pix, para descobrir cobranças erradas. Anote o que encontrar e me mostre o relatório.

> Com o QA Scout, explore o cadastro de https://homolog.meusistema.com por 15 minutos procurando erros de validação, mensagens confusas e falhas de rede. Use dados de teste e consulte as capturas depois de cada envio.

> Abra uma sessão do QA Scout em https://homolog.meusistema.com, sorteie uma heurística do baralho e explore a busca por 10 minutos seguindo ela.

Dicas:

- **Missão estreita rende mais.** "O checkout com cupom" explora melhor que "o site todo".
- **Diga os dados de teste** (usuários, cartões de teste, CEPs) e o que **não** pode ser feito ("não finalize compras", "não exclua registros").
- **Login:** passe a conta de teste no pedido. O perfil do navegador de teste guarda o login entre sessões (`~/.qa-scout/perfil`), então você também pode entrar uma vez à mão.
- **Durante a sessão** dá para acompanhar ao vivo no navegador e no painel, e mandar mensagens para o Claude mudar de rumo.
- **No fim**, revise no painel as notas automáticas e as do Claude: confirme, edite ou exclua. O "Copiar bug" funciona como sempre.

## Ferramentas

| Ferramenta | O que faz |
|---|---|
| `iniciar_sessao` | Abre o navegador (se preciso) e inicia a sessão com o charter, o tempo e, opcionalmente, o endereço. |
| `navegar` | Abre um endereço na aba do sistema em teste. |
| `ver_pagina` | Devolve o resumo acessível da tela (papéis e nomes dos elementos). |
| `clicar` | Clica por papel + nome (ex.: `button` "Pagar com Pix"), por nome ou por texto. Se não encontrar, explica e mostra a tela. |
| `preencher` | Preenche um campo pelo rótulo ou placeholder; `enviar` aperta Enter. |
| `escolher_opcao` | Escolhe uma opção numa lista. |
| `anotar` | Registra uma nota: `bug`, `duvida`, `ideia`, `risco` ou `observacao`. |
| `ver_capturas` | Mostra os erros de JavaScript, console e rede capturados e as últimas notas. |
| `sugerir_heuristica` | Sorteia uma carta do baralho de heurísticas. |
| `encerrar_sessao` | Encerra, preenche o debriefing e devolve o relatório em Markdown. |

## Privacidade e cuidados

- A sessão, as notas e os prints continuam **só no seu computador**, como no resto do QA Scout.
- Para explorar, o Claude **lê a tela**: o texto e os campos das páginas visitadas (inclusive valores já preenchidos) vão para o Claude, como em qualquer conversa com ele. Por isso, **use só ambientes e dados de teste**, nunca produção nem dados reais de clientes.
- O Claude é um par de exploração. O julgamento do que importa e a revisão das notas continuam com você.
- Cada passo lê a tela, então sessões longas gastam mais tokens. Sessões de 10 a 30 minutos funcionam bem.

## Problemas comuns

| Sintoma | O que fazer |
|---|---|
| `qa-scout` não aparece conectado no `claude mcp list` | Confira o Node (`node -v`, 18+) e rode o comando de instalação de novo. |
| A primeira sessão demora ou dá erro ao abrir o navegador | Rode `npx playwright install chromium` e peça de novo. |
| "Não encontrei o elemento" | O Claude vai reler a tela e tentar de novo; se a página carrega devagar, peça para ele esperar e usar `ver_pagina`. |
| O navegador fechou no meio | A próxima ferramenta abre de novo; a sessão em andamento continua no painel. |

## Para quem desenvolve

O servidor fica em `bin/mcp.js` (`qa-scout mcp` ou `npm run mcp`). `criarFerramentas()` expõe as ferramentas como funções comuns sobre o navegador de teste (`abrir()` de `bin/qa-scout.js`); sessão, notas e encerramento passam pelos mesmos botões do painel que a pessoa usa. Os testes ficam em `tests/mcp-extensao.spec.js`, inclusive um que conversa com o servidor por um cliente MCP via stdio.
