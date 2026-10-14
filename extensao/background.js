// Service worker do navegador de teste (aberto pelo comando qa-scout). Acompanha toda aba de site,
// tira os prints e deixa cada evento numa chave própria do storage para o painel transformar em nota.
const INTERVALO_PRINT = 1000;
let ultimoPrint = 0;

async function estado() {
  const { capturando = false } = await chrome.storage.session.get('capturando');
  return { capturando, acompanha: tab => /^(https?|file):/.test(tab.url || '') };
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
  if (msg && msg.cmd === 'capturando') {
    chrome.storage.session.set({ capturando: !!msg.valor }).then(() => responder({ ok: true }));
    return true;
  }
});

async function registra(msg, tab) {
  const { capturando, acompanha } = await estado();
  if (!capturando || !acompanha(tab)) return;
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

// A cada página carregada: injeta de novo e registra a navegação.
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status !== 'complete') return;
  const { capturando, acompanha } = await estado();
  if (!acompanha(tab)) return;
  await injeta(tabId);
  if (capturando) await guardaEvento({ tipo: 'pagina', desc: `Abriu a página “${(tab.title || '').slice(0, 80)}”`, url: tab.url, titulo: tab.title, ts: Date.now() });
});
