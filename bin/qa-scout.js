#!/usr/bin/env node
// Abre um navegador de teste com o QA Scout já carregado.
// Tudo o que for clicado nas abas desse navegador vira observação com print durante a sessão.
// Uso: npx qa-scout [url-do-sistema-em-teste] [--perfil pasta]
const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const PERFIL_PADRAO = path.join(os.homedir(), '.qa-scout', 'perfil');

function garanteNavegador() {
  if (fs.existsSync(chromium.executablePath())) return;
  console.log('Baixando o navegador de teste (só na primeira vez)...');
  const r = spawnSync('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit', shell: true, cwd: RAIZ });
  if (r.status !== 0) throw new Error('Não foi possível baixar o Chromium. Rode "npx playwright install chromium" e tente de novo.');
}

async function abrir({ url, perfil = PERFIL_PADRAO, headless = false } = {}) {
  garanteNavegador();
  fs.mkdirSync(perfil, { recursive: true });
  const context = await chromium.launchPersistentContext(perfil, {
    channel: 'chromium',
    headless,
    viewport: null,
    args: [`--disable-extensions-except=${RAIZ}`, `--load-extension=${RAIZ}`],
  });
  let [sw] = context.serviceWorkers();
  if (!sw) sw = await context.waitForEvent('serviceworker');
  const id = new URL(sw.url()).host;

  // Liga o modo em que todas as abas são acompanhadas e abre o painel numa janela estreita ao lado.
  // Logo depois de subir, o service worker às vezes ainda não está pronto para avaliar código
  // (sem chrome.storage ou até sem setTimeout): tenta de novo por até 5 s.
  for (let tentativa = 1; ; tentativa++) {
    try { await sw.evaluate(() => chrome.storage.local.set({ 'qascout.modo': 'navegador' })); break; }
    catch (e) { if (tentativa >= 50) throw e; await new Promise(r => setTimeout(r, 100)); }
  }
  const painelAberto = context.waitForEvent('page', p => p.url().startsWith(`chrome-extension://${id}/`));
  await sw.evaluate(() => chrome.windows.create({ url: chrome.runtime.getURL('index.html'), type: 'popup', width: 440, height: 900, left: 0, top: 0 }));
  const painel = await painelAberto;

  // Painel à esquerda e o resto da tela para o sistema em teste.
  if (!headless) {
    const [w, h] = await painel.evaluate(() => [screen.availWidth, screen.availHeight]);
    await sw.evaluate(async ([w, h]) => {
      for (const win of await chrome.windows.getAll()) {
        if (win.type === 'popup') await chrome.windows.update(win.id, { left: 0, top: 0, width: 440, height: h });
        else await chrome.windows.update(win.id, { state: 'normal', left: 440, top: 0, width: w - 440, height: h });
      }
    }, [w, h]);
  }

  const [primeira] = context.pages().filter(p => p !== painel);
  const site = primeira || await context.newPage();
  if (url) await site.goto(url).catch(() => {});
  return { context, painel, site, id };
}

module.exports = { abrir, PERFIL_PADRAO };

if (require.main === module) {
  const args = process.argv.slice(2);
  const i = args.indexOf('--perfil');
  const perfil = i >= 0 ? path.resolve(args.splice(i, 2)[1]) : undefined;
  const url = args.find(a => !a.startsWith('--'));
  abrir({ url, perfil })
    .then(({ context }) => {
      console.log('QA Scout aberto. Comece uma sessão no painel e explore à vontade.');
      console.log('Feche o navegador para encerrar.');
      context.on('close', () => process.exit(0));
    })
    .catch(e => { console.error(e.message); process.exit(1); });
}
