// Service worker da extensão. Guarda quais abas estão sendo acompanhadas, tira os prints
// e deixa cada evento numa chave própria do storage para o painel transformar em nota.
const INTERVALO_PRINT = 1000;
let ultimoPrint = 0;

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

async function estado() {
  const { abas = [], capturando = false } = await chrome.storage.session.get(['abas', 'capturando']);
  return { abas, capturando };
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
  const { abas, capturando } = await estado();
  if (!capturando || !abas.includes(tab.id)) return;
  const ev = { tipo: msg.tipo, desc: msg.desc, url: msg.url, titulo: msg.titulo, ts: msg.ts };
  if (msg.tipo === 'clique' && tab.active && Date.now() - ultimoPrint >= INTERVALO_PRINT) {
    ultimoPrint = Date.now();
    try {
      ev.img = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 70 });
      Object.assign(ev, { x: msg.x, y: msg.y, vw: msg.vw, vh: msg.vh });
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
  const { abas, capturando } = await estado();
  if (!abas.includes(tabId)) return;
  await injeta(tabId);
  if (capturando) await guardaEvento({ tipo: 'pagina', desc: `Abriu a página “${(tab.title || '').slice(0, 80)}”`, url: tab.url, titulo: tab.title, ts: Date.now() });
});

chrome.tabs.onRemoved.addListener(async tabId => {
  const { abas } = await estado();
  if (abas.includes(tabId)) await chrome.storage.session.set({ abas: abas.filter(id => id !== tabId) });
});
