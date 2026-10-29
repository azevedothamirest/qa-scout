// Service worker da extensão. Guarda quais abas estão sendo acompanhadas, tira os prints
// e deixa cada evento numa chave própria do storage para o painel transformar em nota.
const INTERVALO_PRINT = 1000;
let ultimoPrint = 0;

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

// No modo "navegador de teste" (aberto pelo comando qa-scout), toda aba de site é acompanhada.
async function estado() {
  const { abas = [], capturando = false } = await chrome.storage.session.get(['abas', 'capturando']);
  const { 'qascout.modo': modo } = await chrome.storage.local.get('qascout.modo');
  const todas = modo === 'navegador';
  const acompanha = tab => todas ? /^(https?|file):/.test(tab.url || '') : abas.includes(tab.id);
  return { abas, capturando, todas, acompanha };
}

// O acesso aos sites é opcional no manifesto: a pessoa concede na primeira vez que clica em
// "Acompanhar a aba atual" (o print exige acesso a todos os sites; não dá para pedir site a site).
// Com o acesso concedido, o pagina.js passa a rodar desde o início de cada página para pegar
// erros de JavaScript; sem ele, nada é registrado.
const ACESSO = { origins: ['<all_urls>'] };
const SCRIPT_PAGINA = { id: 'qascout-pagina', matches: ['http://*/*', 'https://*/*', 'file:///*'], js: ['extensao/pagina.js'], runAt: 'document_start', world: 'MAIN', allFrames: true };
async function sincronizaScriptPagina() {
  const tem = await chrome.permissions.contains(ACESSO);
  const ativos = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_PAGINA.id] });
  if (tem && !ativos.length) await chrome.scripting.registerContentScripts([SCRIPT_PAGINA]).catch(() => {});
  if (!tem && ativos.length) await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_PAGINA.id] }).catch(() => {});
}
sincronizaScriptPagina();
chrome.permissions.onAdded.addListener(sincronizaScriptPagina);
chrome.permissions.onRemoved.addListener(sincronizaScriptPagina);

async function injeta(tabId) {
  try {
    // Abas já abertas antes do acesso não receberam o pagina.js: injeta também (ele não roda duas vezes).
    // allFrames: iframes do mesmo site também são capturados (o content.js ignora os de outros sites).
    await chrome.scripting.executeScript({ target: { tabId, allFrames: true }, files: ['extensao/pagina.js'], world: 'MAIN' }).catch(() => {});
    await chrome.scripting.executeScript({ target: { tabId, allFrames: true }, files: ['extensao/content.js'] });
    return true;
  } catch (e) { return false; }
}

async function guardaEvento(ev) {
  const chave = `qascout.ev.${ev.ts}.${Math.random().toString(36).slice(2, 7)}`;
  await chrome.storage.local.set({ [chave]: ev });
}

chrome.runtime.onMessage.addListener((msg, sender, responder) => {
  if (msg && msg.qaScout && sender.tab) { registra(msg, sender.tab); return; }
  if (msg && msg.cmd === 'quadros' && sender.tab) {
    estado().then(({ acompanha }) => { if (acompanha(sender.tab)) injeta(sender.tab.id); });
    return;
  }
  if (msg && msg.cmd === 'acompanhar') {
    (async () => {
      const { abas } = await estado();
      const ok = await injeta(msg.tabId);
      if (ok && !abas.includes(msg.tabId)) abas.push(msg.tabId);
      await chrome.storage.session.set({ abas });
      responder({ ok });
    })();
    return true;
  }
  if (msg && msg.cmd === 'parar') {
    estado().then(({ abas }) => chrome.storage.session.set({ abas: abas.filter(id => id !== msg.tabId) })).then(() => responder({ ok: true }));
    return true;
  }
  if (msg && msg.cmd === 'capturando') {
    chrome.storage.session.set({ capturando: !!msg.valor }).then(() => responder({ ok: true }));
    return true;
  }
});

async function registra(msg, tab) {
  const { capturando, acompanha } = await estado();
  if (!capturando || !acompanha(tab)) return;
  const ev = { tipo: msg.tipo, desc: msg.desc, url: msg.url, titulo: msg.titulo, ts: msg.ts };
  if (msg.chave) Object.assign(ev, { chave: msg.chave, vezes: msg.vezes || 1 });
  // Erro de JavaScript chega sugerido como bug; console.error, como risco. A testadora decide na revisão.
  if (msg.tipo === 'erro') ev.nota = msg.grave ? 'bug' : 'ris';
  if (msg.tipo === 'marca' && msg.nota) ev.nota = msg.nota;
  const marca = msg.tipo === 'marca';
  if (tab.active && (marca || (msg.tipo === 'clique' && Date.now() - ultimoPrint >= INTERVALO_PRINT))) {
    if (!marca) ultimoPrint = Date.now();
    try {
      ev.img = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 70 });
      if (!marca) Object.assign(ev, { x: msg.x, y: msg.y, vw: msg.vw, vh: msg.vh });
    } catch (e) {}
  }
  await guardaEvento(ev);
}

// Abas abertas a partir de uma aba acompanhada entram junto.
chrome.tabs.onCreated.addListener(async tab => {
  const { abas } = await estado();
  if (tab.openerTabId && abas.includes(tab.openerTabId) && !abas.includes(tab.id)) {
    abas.push(tab.id);
    await chrome.storage.session.set({ abas });
  }
});

// A cada página carregada numa aba acompanhada: injeta de novo e registra a navegação.
// Em SPA (history.pushState) o "complete" chega antes de a página trocar o título: se a URL mudou
// e o título ainda é o da página anterior, espera até 1,5 s pelo título novo.
const ultimaPagina = new Map(); // tabId -> { url, titulo }
async function tituloAtualizado(tabId, tab) {
  const antes = ultimaPagina.get(tabId);
  if (!antes || antes.url === tab.url || antes.titulo !== tab.title) return tab;
  for (let i = 0; i < 6; i++) {
    await new Promise(r => setTimeout(r, 250));
    const t = await chrome.tabs.get(tabId).catch(() => null);
    // Se a aba já foi para outra URL, o título novo é de outra página (#31): fica o que havia.
    if (!t || t.url !== tab.url) return tab;
    if (t.title !== antes.titulo) return t;
  }
  return tab;
}
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status !== 'complete') return;
  const { capturando, acompanha } = await estado();
  if (!acompanha(tab)) return;
  await injeta(tabId);
  tab = await tituloAtualizado(tabId, tab);
  ultimaPagina.set(tabId, { url: tab.url, titulo: tab.title });
  if (capturando) await guardaEvento({ tipo: 'pagina', desc: `${(await frases()).pagina} “${(tab.title || '').slice(0, 80)}”`, url: tab.url, titulo: tab.title, ts: Date.now() });
});

chrome.tabs.onRemoved.addListener(async tabId => {
  ultimaPagina.delete(tabId);
  const { abas } = await estado();
  if (abas.includes(tabId)) await chrome.storage.session.set({ abas: abas.filter(id => id !== tabId) });
});

// Falhas de rede das abas acompanhadas: respostas 4xx/5xx e requisições que nem chegaram a responder.
// 5xx e falha de conexão chegam como bug; 4xx, como risco. A mesma chamada falhando de novo leva a
// mesma chave, e o painel soma na nota que já existe ("×N") em vez de criar outra.
const IGNORA_REDE = /\/favicon\.ico(\?|$)/;
function caminho(url) {
  try { const u = new URL(url); return (u.pathname + u.search).slice(0, 90); } catch (e) { return String(url).slice(0, 90); }
}
// Frases das notas no idioma escolhido no painel (qascout.idioma).
const FRASES = {
  'pt-BR': { pagina: 'Abriu a página', erro: 'Requisição com erro', falhou: 'Requisição falhou' },
  'pt-PT': { pagina: 'Abriu a página', erro: 'Pedido com erro', falhou: 'Pedido falhou' },
  en: { pagina: 'Opened the page', erro: 'Request error', falhou: 'Request failed' },
  es: { pagina: 'Abrió la página', erro: 'Solicitud con error', falhou: 'Solicitud fallida' },
};
async function frases() {
  const { 'qascout.idioma': id } = await chrome.storage.local.get('qascout.idioma');
  return FRASES[id] || FRASES['pt-BR'];
}
async function falhaDeRede(det, status, erro) {
  if (det.tabId < 0 || IGNORA_REDE.test(det.url)) return;
  const chave = `rede:${det.method} ${caminho(det.url)} ${status || erro}`;
  const agora = Date.now();
  const { capturando, acompanha } = await estado();
  if (!capturando) return;
  const tab = await chrome.tabs.get(det.tabId).catch(() => null);
  if (!tab || !acompanha(tab)) return;
  const F = await frases();
  const desc = status ? `${F.erro}: ${det.method} ${caminho(det.url)} → ${status}`
    : `${F.falhou}: ${det.method} ${caminho(det.url)} (${erro.replace(/^net::/, '')})`;
  await guardaEvento({ tipo: 'rede', nota: !status || status >= 500 ? 'bug' : 'ris', desc, chave, vezes: 1, url: tab.url, titulo: tab.title, ts: agora });
}
const FILTRO_REDE = { urls: ['http://*/*', 'https://*/*'] };
chrome.webRequest.onCompleted.addListener(d => { if (d.statusCode >= 400) falhaDeRede(d, d.statusCode); }, FILTRO_REDE);
chrome.webRequest.onErrorOccurred.addListener(d => { if (!/ERR_ABORTED|ERR_BLOCKED_BY_CLIENT/.test(d.error)) falhaDeRede(d, 0, d.error); }, FILTRO_REDE);
