#!/usr/bin/env node
// Gera os PDFs da apresentação do produto (docs/apresentacao/*.html → *.pdf), um por idioma.
// Material de divulgação: não entra no pacote da extensão.
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const PASTA = path.join(__dirname, '..', 'docs', 'apresentacao');

(async () => {
  const navegador = await chromium.launch({ args: ['--allow-file-access-from-files'], ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  const pagina = await navegador.newPage();
  for (const html of fs.readdirSync(PASTA).filter(n => n.endsWith('.html'))) {
    await pagina.goto('file://' + path.join(PASTA, html));
    await pagina.evaluate(() => document.fonts.ready);
    const pdf = path.join(PASTA, html.replace('apresentacao', 'qa-scout-apresentacao').replace(/\.html$/, '.pdf'));
    await pagina.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log(path.relative(process.cwd(), pdf));
  }
  await navegador.close();
})();
