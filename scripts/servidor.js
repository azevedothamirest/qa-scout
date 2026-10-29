#!/usr/bin/env node
// Servidor local (npm start e testes) no mesmo formato do GitHub Pages: o app de app/ e as páginas de
// site/ na raiz; tests/fixtures/ para as páginas de teste. Sem cache, para ver cada mudança na hora.
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const PORTA = +process.env.PORT || 4173;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };

function caminho(url) {
  const rel = decodeURIComponent(url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  if (rel.split('/').includes('..')) return null;
  if (rel.startsWith('tests/fixtures/')) return path.join(RAIZ, rel);
  for (const pasta of ['app', 'site']) {
    const abs = path.join(RAIZ, pasta, rel);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  }
  return null;
}

http.createServer((req, res) => {
  const abs = caminho(req.url);
  if (!abs || !fs.existsSync(abs)) { res.writeHead(404); res.end('não encontrado'); return; }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(abs)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(abs).pipe(res);
}).listen(PORTA, () => console.log(`QA Scout em http://localhost:${PORTA}`));
