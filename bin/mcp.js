// Servidor MCP do QA Scout: deixa o Claude (Claude Code, Claude Desktop) fazer uma sessão de teste
// exploratório no navegador de teste. O Claude dirige o navegador por estas ferramentas e a extensão
// grava tudo como faria com uma pessoa: cliques, campos (sem o valor), páginas, erros e prints.
// No fim, a sessão fica no histórico do QA Scout e o relatório volta em Markdown.
//
// Uso: qa-scout mcp [--perfil <pasta>] [--headless]
// O protocolo usa a saída padrão; mensagens para pessoas vão para a saída de erro.
const fs = require('fs');
const path = require('path');
const { abrir } = require('./qa-scout');

const MAX_PAGINA = 12000; // caracteres do resumo da tela devolvidos por vez (o que mais pesa em tokens)

// Baralho de heurísticas do próprio app (HEUR em app.js), lido do arquivo para não duplicar.
function heuristicas() {
  const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const m = js.match(/const HEUR = (\[[\s\S]*?\n\]);/);
  return m ? Function(`"use strict"; return ${m[1]}`)() : [];
}

const TIPOS = { bug: 'bug', duvida: 'duv', ideia: 'ide', risco: 'ris', observacao: 'obs' };

// As ferramentas são funções comuns sobre um navegador aberto sob demanda; o servidor MCP só as
// expõe. Assim os testes chamam as mesmas funções sem passar pelo protocolo.
function criarFerramentas({ perfil, headless = false } = {}) {
  let aberto = null;

  async function navegador() {
    if (aberto && !aberto.context.pages().includes(aberto.painel)) aberto = null;
    if (!aberto) {
      aberto = await abrir({ perfil, headless });
      // Abas novas (target=_blank, popups) viram a aba em teste.
      aberto.context.on('page', p => { if (p !== aberto.painel) aberto.site = p; });
    }
    return aberto;
  }
  async function site() {
    const a = await navegador();
    if (a.site.isClosed()) a.site = a.context.pages().filter(p => p !== a.painel).pop() || await a.context.newPage();
    await a.site.bringToFront(); // o print da extensão é da aba visível
    return a.site;
  }
  async function estadoApp() {
    const { painel } = await navegador();
    const r = await painel.evaluate(() => chrome.storage.local.get('qascout.v1'));
    return r['qascout.v1'] || { sessions: [] };
  }
  async function sessaoAtiva() {
    const st = await estadoApp();
    return st.sessions.find(s => s.id === st.activeId && s.status !== 'done') || null;
  }
  async function irParaPainel(aba) {
    const { painel } = await navegador();
    await painel.bringToFront();
    await painel.getByRole('button', { name: aba, exact: true }).click();
    return painel;
  }
  // Elemento por papel + nome acessível (como o resumo da tela mostra) ou, na falta, por texto.
  function localizar(pagina, { papel, nome, texto }) {
    if (papel) return pagina.getByRole(papel, nome ? { name: nome } : {}).first();
    if (nome) return pagina.getByLabel(nome).or(pagina.getByRole('button', { name: nome })).or(pagina.getByRole('link', { name: nome })).first();
    return pagina.getByText(texto, { exact: false }).first();
  }
  async function resumoDaTela(pagina) {
    const arvore = await pagina.locator('body').ariaSnapshot().catch(e => `(não foi possível ler a tela: ${e.message})`);
    const corte = arvore.length > MAX_PAGINA ? arvore.slice(0, MAX_PAGINA) + '\n… (tela cortada; role a página ou navegue para ver o resto)' : arvore;
    return `Página: ${await pagina.title()}\nEndereço: ${pagina.url()}\n\n${corte}`;
  }

  return {
    async iniciar_sessao({ explorar, com = '', descobrir, minutos = 30, url, area, ambiente }) {
      if (await sessaoAtiva()) return 'Já existe uma sessão em andamento. Encerre com encerrar_sessao antes de começar outra.';
      const painel = await irParaPainel('Sessões');
      await painel.getByRole('button', { name: 'Começar nova sessão' }).click();
      if (area) await painel.locator('#c-area').fill(area);
      if (ambiente) await painel.locator('#c-amb').fill(ambiente);
      await painel.locator('#c-exp').fill(explorar);
      await painel.locator('#c-com').fill(com);
      await painel.locator('#c-des').fill(descobrir);
      await painel.locator('#c-dur').fill(String(minutos));
      await painel.getByRole('button', { name: 'Iniciar sessão' }).click();
      await painel.locator('#note-in').waitFor();
      let texto = `Sessão iniciada: Explorar ${explorar}${com ? ` com ${com}` : ''} para descobrir ${descobrir} (${minutos} min). A captura automática está ligada.`;
      if (url) { const p = await site(); await p.goto(url); texto += `\n\n${await resumoDaTela(p)}`; }
      return texto;
    },

    async navegar({ url }) {
      const p = await site();
      await p.goto(url);
      return resumoDaTela(p);
    },

    async ver_pagina() {
      return resumoDaTela(await site());
    },

    async clicar(alvo) {
      const p = await site();
      await localizar(p, alvo).click({ timeout: 5000 });
      await p.waitForLoadState('domcontentloaded').catch(() => {});
      await p.waitForTimeout(400);
      return resumoDaTela(await site());
    },

    async preencher({ campo, valor, enviar = false }) {
      const p = await site();
      const el = p.getByLabel(campo).or(p.getByPlaceholder(campo)).or(p.getByRole('textbox', { name: campo })).first();
      await el.fill(valor, { timeout: 5000 });
      if (enviar) await el.press('Enter'); else await el.blur();
      await p.waitForTimeout(300);
      return resumoDaTela(await site());
    },

    async escolher_opcao({ campo, opcao }) {
      const p = await site();
      await p.getByLabel(campo).first().selectOption({ label: opcao }, { timeout: 5000 });
      return resumoDaTela(p);
    },

    async anotar({ tipo, texto }) {
      if (!await sessaoAtiva()) return 'Nenhuma sessão em andamento. Use iniciar_sessao primeiro.';
      const painel = await irParaPainel('Em campo');
      await painel.locator(`[data-type="${TIPOS[tipo]}"]`).click();
      await painel.locator('#note-in').fill(texto);
      await painel.locator('#note-in').press('Control+Enter');
      await site();
      return `Nota de ${tipo} registrada.`;
    },

    async ver_capturas() {
      const s = await sessaoAtiva();
      if (!s) return 'Nenhuma sessão em andamento.';
      const fmt = n => `- [${n.type}${n.pending ? ', a revisar' : ''}] ${n.text.split('\n')[0]}`;
      const erros = s.notes.filter(n => n.origem === 'erro' || n.origem === 'rede');
      const recentes = s.notes.slice(-15);
      return [
        `Notas na sessão: ${s.notes.length} (${s.notes.filter(n => n.auto).length} automáticas).`,
        `\nErros de JavaScript, console e rede capturados (${erros.length}):`,
        erros.length ? erros.map(fmt).join('\n') : '- nenhum até agora',
        `\nÚltimas notas:`,
        recentes.map(fmt).join('\n') || '- nenhuma',
      ].join('\n');
    },

    async sugerir_heuristica({ categoria } = {}) {
      const cartas = heuristicas().filter(c => !categoria || c.cat.toLowerCase().includes(categoria.toLowerCase()));
      if (!cartas.length) return 'Nenhuma heurística nessa categoria.';
      const c = cartas[Math.floor(Math.random() * cartas.length)];
      return `${c.t} (${c.cat}): ${c.p}`;
    },

    async encerrar_sessao({ cobertura, proximos } = {}) {
      if (!await sessaoAtiva()) return 'Nenhuma sessão em andamento.';
      const painel = await irParaPainel('Em campo');
      await painel.getByRole('button', { name: 'Encerrar' }).click();
      await painel.getByRole('button', { name: 'Sim, encerrar' }).click();
      const md = painel.locator('#md-out');
      await md.waitFor();
      if (cobertura) await painel.locator('#db-cov').fill(cobertura);
      if (proximos) await painel.locator('#db-next').fill(proximos);
      await painel.locator('#db-cov').blur();
      return `Sessão encerrada. As notas automáticas ficam "a revisar" no painel até a testadora confirmar.\n\n${await md.inputValue()}`;
    },

    async fechar() { if (aberto) await aberto.context.close().catch(() => {}); aberto = null; },
  };
}

const DESCRICOES = {
  iniciar_sessao: 'Abre o navegador de teste do QA Scout (se preciso) e inicia uma sessão de teste exploratório com o charter "Explorar <explorar> com <com> para descobrir <descobrir>". Opcionalmente já navega para a url do sistema em teste. Comece sempre por aqui.',
  navegar: 'Abre um endereço na aba do sistema em teste e devolve o resumo acessível da tela.',
  ver_pagina: 'Devolve o resumo acessível da tela atual (papéis e nomes dos elementos, no formato do Playwright). Use os papéis e nomes dele em clicar.',
  clicar: 'Clica num elemento do sistema em teste. Prefira papel + nome, como aparecem no resumo da tela (ex.: papel "button", nome "Pagar com Pix"); ou só nome; ou texto. Devolve a tela depois do clique.',
  preencher: 'Preenche um campo pelo rótulo ou placeholder. Use dados de teste, nunca dados reais. enviar=true aperta Enter.',
  escolher_opcao: 'Escolhe uma opção numa lista (select) pelo rótulo do campo e o texto da opção.',
  anotar: 'Registra uma nota na sessão: bug (comportamento errado), duvida (algo a confirmar com o time), ideia (melhoria), risco (pode dar problema), observacao (fato relevante). Descreva o que viu e onde, de forma que outra pessoa reproduza.',
  ver_capturas: 'Mostra o que a captura automática registrou: erros de JavaScript, console.error e falhas de rede, além das últimas notas. Consulte depois de ações importantes.',
  sugerir_heuristica: 'Sorteia uma heurística do baralho do QA Scout (tours, dados, interface, fluxo...) para variar a exploração quando travar.',
  encerrar_sessao: 'Encerra a sessão, preenche o debriefing (áreas cobertas e próximos passos) e devolve o relatório em Markdown.',
};

const INSTRUCOES = `Você está fazendo teste exploratório baseado em sessões (SBTM) com o QA Scout.
1. Comece com iniciar_sessao, usando o charter que a pessoa pediu.
2. Explore seguindo a missão: leia a tela (ver_pagina), interaja (clicar, preencher, escolher_opcao), varie caminhos, dados e ordem. Use sugerir_heuristica quando travar.
3. Depois de ações importantes, olhe ver_capturas para erros de console e rede.
4. Anote com anotar sempre que encontrar algo: bug, dúvida, ideia, risco ou observação, com o passo a passo.
5. Respeite o tempo planejado e termine com encerrar_sessao, contando o que foi coberto e o que fica para a próxima sessão.
Use só dados de teste. Não explore produção nem faça ações irreversíveis (pagamentos reais, exclusões) sem a pessoa pedir.`;

async function main(argv = process.argv.slice(2)) {
  const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
  const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
  const { z } = require('zod');

  const i = argv.indexOf('--perfil');
  const perfil = i >= 0 ? path.resolve(argv[i + 1]) : undefined;
  const f = criarFerramentas({ perfil, headless: argv.includes('--headless') });

  const versao = require('../package.json').version;
  const servidor = new McpServer({ name: 'qa-scout', version: versao }, { instructions: INSTRUCOES });
  const alvo = {
    papel: z.string().optional().describe('Papel acessível: button, link, textbox, checkbox, tab, menuitem...'),
    nome: z.string().optional().describe('Nome acessível do elemento'),
    texto: z.string().optional().describe('Texto visível, quando não houver papel/nome'),
  };
  const esquemas = {
    iniciar_sessao: {
      explorar: z.string().describe('O que explorar (área, funcionalidade)'),
      com: z.string().optional().describe('Com quais recursos, dados ou heurísticas'),
      descobrir: z.string().describe('O que se quer descobrir (riscos, tipos de problema)'),
      minutos: z.number().int().min(1).max(480).optional().describe('Duração planejada (padrão 30)'),
      url: z.string().optional().describe('Endereço do sistema em teste'),
      area: z.string().optional().describe('Nome curto da sessão'),
      ambiente: z.string().optional().describe('Ex.: homologação, versão 2.3'),
    },
    navegar: { url: z.string() },
    ver_pagina: {},
    clicar: alvo,
    preencher: { campo: z.string().describe('Rótulo ou placeholder do campo'), valor: z.string(), enviar: z.boolean().optional() },
    escolher_opcao: { campo: z.string(), opcao: z.string() },
    anotar: { tipo: z.enum(Object.keys(TIPOS)), texto: z.string() },
    ver_capturas: {},
    sugerir_heuristica: { categoria: z.string().optional() },
    encerrar_sessao: { cobertura: z.string().optional().describe('Áreas cobertas'), proximos: z.string().optional().describe('Fora do escopo e próximas sessões') },
  };
  for (const [nome, inputSchema] of Object.entries(esquemas)) {
    servidor.registerTool(nome, { description: DESCRICOES[nome], inputSchema }, async args => {
      try { return { content: [{ type: 'text', text: await f[nome](args || {}) }] }; }
      catch (e) { return { isError: true, content: [{ type: 'text', text: `Não deu certo: ${e.message.split('\n')[0]}` }] }; }
    });
  }
  const sair = () => f.fechar().finally(() => process.exit(0));
  process.on('SIGINT', sair); process.on('SIGTERM', sair); process.stdin.on('close', sair);
  await servidor.connect(new StdioServerTransport());
  console.error('QA Scout MCP pronto.');
}

module.exports = { criarFerramentas, heuristicas, main, INSTRUCOES };

if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
