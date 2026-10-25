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

// O navegador de teste é separado e existe só para testar: carrega uma cópia da extensão em que o
// acesso a todos os sites já vem concedido (na Chrome Web Store ele é opcional e pedido no primeiro uso).
const ARQUIVOS_EXTENSAO = ['index.html', 'app.css', 'app.js', 'extensao', 'icones'];
// Chave pública fixa: sem ela, o id da extensão (e com ele o lugar onde as sessões ficam guardadas)
// mudava junto com a pasta em que o npx instala o pacote. Só a chave pública; a privada não é usada.
const CHAVE = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0r1RT9W6ROqrLashHW7SfAuLCm5GQe/kJsbj5cRX94V0wFtU7bwiPAf2ocW/JMW4ExCcrnvLsawtxJuXXDRHJDNeGwusrtRRdsMfTvBc+GatHErudRVTKsBmyorM7OnmIrrSWzQmZV0EHonfUsGb81ZgctZQhZ6kElEkwoQp0IgWlJ0mTwikovg+BXS6jA457wfi6S31hAHe9StHnRAQABluRtqJW2n/F77228fuZJz97f8db43Vs3vjFzD0GHRS6yS9zFhhz+EA+9l4ZnQ8VCr0pIkSF32h+fqO2JK1rmKVhmgKEGW1KLM2XllkUJ6gBuYVMD4AWdqRQdfi7e4XNQIDAQAB';
const ID_FIXO = 'kmnlnoaakacblihodeehdlbbfcmjaaam';
function prepararExtensao(destino = path.join(os.homedir(), '.qa-scout', 'extensao')) {
  fs.rmSync(destino, { recursive: true, force: true });
  fs.mkdirSync(destino, { recursive: true });
  for (const item of ARQUIVOS_EXTENSAO) fs.cpSync(path.join(RAIZ, item), path.join(destino, item), { recursive: true });
  const manifesto = JSON.parse(fs.readFileSync(path.join(RAIZ, 'manifest.json'), 'utf8'));
  manifesto.key = CHAVE;
  manifesto.host_permissions = ['<all_urls>'];
  delete manifesto.optional_host_permissions;
  fs.writeFileSync(path.join(destino, 'manifest.json'), JSON.stringify(manifesto, null, 2));
  return destino;
}

// Até a 0.5, o id mudava com a pasta do npx (por exemplo, ao trocar o comando para "#main") e as
// sessões ficavam guardadas sob o id antigo. Na primeira vez com o id fixo, copia os dados da
// extensão usada por último para o novo id.
function recuperaSessoesAntigas(perfil) {
  const base = path.join(perfil, 'Default', 'Local Extension Settings');
  const destino = path.join(base, ID_FIXO);
  if (!fs.existsSync(base) || fs.existsSync(destino)) return;
  const antigas = fs.readdirSync(base)
    .filter(n => /^[a-p]{32}$/.test(n))
    .map(n => ({ n, t: fs.statSync(path.join(base, n)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  if (antigas.length) fs.cpSync(path.join(base, antigas[0].n), destino, { recursive: true });
}

async function abrir({ url, perfil = PERFIL_PADRAO, headless = false } = {}) {
  garanteNavegador();
  fs.mkdirSync(perfil, { recursive: true });
  const extensao = prepararExtensao(path.join(perfil, '..', path.basename(perfil) + '-extensao'));
  recuperaSessoesAntigas(perfil);
  const context = await chromium.launchPersistentContext(perfil, {
    channel: 'chromium',
    headless,
    viewport: null,
    args: [`--disable-extensions-except=${extensao}`, `--load-extension=${extensao}`],
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

module.exports = { abrir, prepararExtensao, recuperaSessoesAntigas, ID_FIXO, PERFIL_PADRAO };

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
