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
  test('Gerar zip só com os arquivos da extensão e a versão do package.json', () => {
    const { version } = JSON.parse(fs.readFileSync(path.join(RAIZ, 'package.json'), 'utf8'));
    const manifesto = JSON.parse(fs.readFileSync(path.join(RAIZ, 'manifest.json'), 'utf8'));
    expect(manifesto.version).toBe(version);

    execFileSync(process.execPath, [path.join(RAIZ, 'bin', 'empacotar.js')], { cwd: RAIZ });
    const nomes = nomesDoZip(fs.readFileSync(path.join(RAIZ, 'dist', `qa-scout-extensao-${version}.zip`)));

    expect(nomes).toEqual(expect.arrayContaining(['manifest.json', 'index.html', 'app.js', 'extensao/background.js', 'extensao/content.js', 'extensao/pagina.js']));
    for (const icone of Object.values(manifesto.icons)) expect(nomes).toContain(icone);
    expect(nomes.filter(n => /^(tests|docs|bin|node_modules)\//.test(n) || n === 'package.json')).toEqual([]);
  });
});
