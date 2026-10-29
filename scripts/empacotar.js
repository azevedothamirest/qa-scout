#!/usr/bin/env node
// Gera o .zip da extensão para enviar à Chrome Web Store: dist/qa-scout-extensao-<versão>.zip
// Entra a pasta app/ inteira (é a raiz da extensão); testes, docs e o comando qa-scout ficam de fora.
// Zip sem compressão (método "store"), escrito à mão para não depender de pacote extra.
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const APP = path.join(RAIZ, 'app');

function lista(rel) {
  const abs = path.join(APP, rel);
  if (fs.statSync(abs).isDirectory()) return fs.readdirSync(abs).sort().flatMap(n => lista(path.posix.join(rel, n)));
  return [rel];
}

const TABELA = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (const b of buf) c = TABELA[(c ^ b) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function zip(arquivos) {
  const partes = [], central = [];
  let offset = 0;
  for (const nome of arquivos) {
    const dados = fs.readFileSync(path.join(APP, nome));
    const nomeBuf = Buffer.from(nome, 'utf8');
    const crc = crc32(dados);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8); local.writeUInt32LE(0, 10); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(dados.length, 18); local.writeUInt32LE(dados.length, 22); local.writeUInt16LE(nomeBuf.length, 26);
    const cab = Buffer.alloc(46);
    cab.writeUInt32LE(0x02014b50, 0); cab.writeUInt16LE(20, 4); cab.writeUInt16LE(20, 6); cab.writeUInt16LE(0x0800, 8);
    cab.writeUInt32LE(crc, 16); cab.writeUInt32LE(dados.length, 20); cab.writeUInt32LE(dados.length, 24);
    cab.writeUInt16LE(nomeBuf.length, 28); cab.writeUInt32LE(offset, 42);
    partes.push(local, nomeBuf, dados);
    central.push(cab, nomeBuf);
    offset += 30 + nomeBuf.length + dados.length;
  }
  const tamCentral = central.reduce((t, b) => t + b.length, 0);
  const fim = Buffer.alloc(22);
  fim.writeUInt32LE(0x06054b50, 0); fim.writeUInt16LE(arquivos.length, 8); fim.writeUInt16LE(arquivos.length, 10);
  fim.writeUInt32LE(tamCentral, 12); fim.writeUInt32LE(offset, 16);
  return Buffer.concat([...partes, ...central, fim]);
}

const { version } = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
const arquivos = fs.readdirSync(APP).sort().flatMap(lista);
fs.mkdirSync(path.join(RAIZ, 'dist'), { recursive: true });
const destino = path.join(RAIZ, 'dist', `qa-scout-extensao-${version}.zip`);
fs.writeFileSync(destino, zip(arquivos));
console.log(`${path.relative(RAIZ, destino)} (${arquivos.length} arquivos)`);
