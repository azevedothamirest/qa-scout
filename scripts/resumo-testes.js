#!/usr/bin/env node
// Lê o relatório JSON do Playwright e escreve o resumo da execução em Markdown:
// uma tabela com o título de cada teste, o projeto (desktop, celular, extensao) e o resultado.
// Na CI, o resultado vai para $GITHUB_STEP_SUMMARY e aparece na página da execução.
const fs = require('fs');

const [arquivo = 'resultados.json', titulo = 'Testes'] = process.argv.slice(2);
if (!fs.existsSync(arquivo)) { console.error(`Relatório não encontrado: ${arquivo}`); process.exit(0); }
const relatorio = JSON.parse(fs.readFileSync(arquivo, 'utf8'));

const ICONE = { expected: '✅', unexpected: '❌', flaky: '⚠️', skipped: '⏭️' };
const linhas = [];
// O primeiro nível é o arquivo; os seguintes são os test.describe (a área da tela).
function percorre(suite, area, raiz) {
  const nome = raiz ? area : [area, suite.title].filter(Boolean).join(' › ');
  for (const spec of suite.specs || []) {
    for (const t of spec.tests) {
      const dur = t.results.reduce((a, r) => a + r.duration, 0);
      linhas.push({ area: nome || '—', titulo: spec.title, projeto: t.projectName, status: t.status, dur });
    }
  }
  for (const s of suite.suites || []) percorre(s, nome, false);
}
relatorio.suites.forEach((s) => percorre(s, '', true));

const conta = (st) => linhas.filter((l) => l.status === st).length;
const esc = (s) => String(s).replace(/\|/g, '\\|');
const md = [
  `## ${titulo}`,
  '',
  `**${conta('expected')} passaram** · ${conta('unexpected')} falharam · ${conta('flaky')} instáveis · ${conta('skipped')} pulados · ${linhas.length} no total`,
  '',
  '| | Área | Teste | Projeto | Tempo |',
  '|---|---|---|---|---|',
  ...linhas.map((l) => `| ${ICONE[l.status] || l.status} | ${esc(l.area)} | ${esc(l.titulo)} | ${l.projeto} | ${(l.dur / 1000).toFixed(1)}s |`),
  '',
].join('\n');

if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n');
else console.log(md);
