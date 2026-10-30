#!/usr/bin/env node
// Servidor local (npm start e testes) no mesmo formato do GitHub Pages: o app de app/ e as páginas de
// site/ na raiz; tests/fixtures/ para as páginas de teste. Sem cache, para ver cada mudança na hora.
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const PORTA = +process.env.PORT || 4173;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };

// O arquivo só sai se, depois de resolvido, continuar dentro da pasta servida. Conferir ".." no texto
// não basta: no Windows "\" também separa pastas (GHSA-v693-3724-qmx9).
function dentro(pasta, rel) {
  const base = path.join(RAIZ, pasta);
  const abs = path.resolve(base, rel);
  return abs.startsWith(base + path.sep) && fs.existsSync(abs) && fs.statSync(abs).isFile() ? abs : null;
}
function caminho(url) {
  let rel;
  try { rel = decodeURIComponent(url.split('?')[0]).replace(/^\/+/, '') || 'index.html'; } catch (e) { return null; }
  if (rel.includes('\0')) return null;
  if (rel.startsWith('tests/fixtures/')) return dentro('tests/fixtures', rel.slice('tests/fixtures/'.length));
  return dentro('app', rel) || dentro('site', rel);
}

http.createServer((req, res) => {
  const abs = caminho(req.url);
  if (!abs) { res.writeHead(404); res.end('não encontrado'); return; }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(abs)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(abs).pipe(res);
}).listen(PORTA, '127.0.0.1', () => console.log(`QA Scout em http://localhost:${PORTA}`));
