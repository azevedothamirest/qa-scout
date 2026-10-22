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

async function injeta(tabId) {
  try { await chrome.scripting.executeScript({ target: { tabId }, files: ['extensao/content.js'] }); return true; }
  catch (e) { return false; }
}

async function guardaEvento(ev) {
  const chave = `qascout.ev.${ev.ts}.${Math.random().toString(36).slice(2, 7)}`;
  await chrome.storage.local.set({ [chave]: ev });
}

chrome.runtime.onMessage.addListener((msg, sender, responder) => {
  if (msg && msg.qaScout && sender.tab) { registra(msg, sender.tab); return; }
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
  // Erro de JavaScript chega sugerido como bug; console.error, como risco. A testadora decide na revisão.
  if (msg.tipo === 'erro') ev.nota = msg.grave ? 'bug' : 'ris';
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
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status !== 'complete') return;
  const { capturando, acompanha } = await estado();
  if (!acompanha(tab)) return;
  await injeta(tabId);
  if (capturando) await guardaEvento({ tipo: 'pagina', desc: `Abriu a página “${(tab.title || '').slice(0, 80)}”`, url: tab.url, titulo: tab.title, ts: Date.now() });
});

chrome.tabs.onRemoved.addListener(async tabId => {
  const { abas } = await estado();
  if (abas.includes(tabId)) await chrome.storage.session.set({ abas: abas.filter(id => id !== tabId) });
});

// Falhas de rede das abas acompanhadas: respostas 4xx/5xx e requisições que nem chegaram a responder.
// 5xx e falha de conexão chegam como bug; 4xx, como risco. Repetições da mesma chamada em 10 s viram uma só.
const IGNORA_REDE = /\/favicon\.ico(\?|$)/;
const recentes = new Map();
function caminho(url) {
  try { const u = new URL(url); return (u.pathname + u.search).slice(0, 90); } catch (e) { return String(url).slice(0, 90); }
}
async function falhaDeRede(det, status, erro) {
  if (det.tabId < 0 || IGNORA_REDE.test(det.url)) return;
  const chave = `${det.method} ${det.url} ${status || erro}`;
  const agora = Date.now();
  if (agora - (recentes.get(chave) || 0) < 10000) return;
  recentes.set(chave, agora);
  if (recentes.size > 200) recentes.clear();
  const { capturando, acompanha } = await estado();
  if (!capturando) return;
  const tab = await chrome.tabs.get(det.tabId).catch(() => null);
  if (!tab || !acompanha(tab)) return;
  const desc = status ? `Requisição com erro: ${det.method} ${caminho(det.url)} → ${status}`
    : `Requisição falhou: ${det.method} ${caminho(det.url)} (${erro.replace(/^net::/, '')})`;
  await guardaEvento({ tipo: 'rede', nota: !status || status >= 500 ? 'bug' : 'ris', desc, url: tab.url, titulo: tab.title, ts: agora });
}
const FILTRO_REDE = { urls: ['http://*/*', 'https://*/*'] };
chrome.webRequest.onCompleted.addListener(d => { if (d.statusCode >= 400) falhaDeRede(d, d.statusCode); }, FILTRO_REDE);
chrome.webRequest.onErrorOccurred.addListener(d => { if (!/ERR_ABORTED|ERR_BLOCKED_BY_CLIENT/.test(d.error)) falhaDeRede(d, 0, d.error); }, FILTRO_REDE);
