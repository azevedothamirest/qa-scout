// @ts-check
// Pacote da Chrome Web Store (npm run pacote). O nome contém "extensao" para rodar só no projeto "extensao".
const { test, expect } = require('@playwright/test');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');

// Lê os nomes do diretório central do zip.
function nomesDoZip(buf) {
  const nomes = [];
  for (let i = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06])), n = buf.readUInt16LE(i + 10), p = buf.readUInt32LE(i + 16); n--; ) {
    const tam = buf.readUInt16LE(p + 28), extra = buf.readUInt16LE(p + 30), coment = buf.readUInt16LE(p + 32);
    nomes.push(buf.toString('utf8', p + 46, p + 46 + tam));
    p += 46 + tam + extra + coment;
  }
  return nomes;
}

test.describe('Pacote da Chrome Web Store', () => {
  test('Gerar zip só com os arquivos da extensão e a versão do package.json', { tag: '@regressao' }, () => {
    const { version } = JSON.parse(fs.readFileSync(path.join(RAIZ, 'package.json'), 'utf8'));
    const manifesto = JSON.parse(fs.readFileSync(path.join(RAIZ, 'manifest.json'), 'utf8'));
    expect(manifesto.version).toBe(version);

    execFileSync(process.execPath, [path.join(RAIZ, 'scripts', 'empacotar.js')], { cwd: RAIZ });
    const nomes = nomesDoZip(fs.readFileSync(path.join(RAIZ, 'dist', `qa-scout-extensao-${version}.zip`)));

    expect(nomes).toEqual(expect.arrayContaining(['manifest.json', 'index.html', 'app.css', 'app.js', 'extensao/background.js', 'extensao/content.js', 'extensao/pagina.js', 'i18n.js', 'i18n/en.js', 'i18n/es.js', 'i18n/pt-PT.js', '_locales/pt_BR/messages.json', '_locales/en/messages.json']));
    for (const icone of Object.values(manifesto.icons)) expect(nomes).toContain(icone);
    // Na loja, o acesso aos sites é opcional (pedido no primeiro uso) e o id vem da própria loja.
    expect(manifesto.host_permissions).toBeUndefined();
    expect(manifesto.content_scripts).toBeUndefined();
    expect(manifesto.optional_host_permissions).toEqual(['<all_urls>']);
    expect(manifesto.key).toBeUndefined();
    expect(nomes.filter(n => /^(tests|docs|bin|scripts|node_modules)\//.test(n) || n === 'package.json')).toEqual([]);
  });
});
