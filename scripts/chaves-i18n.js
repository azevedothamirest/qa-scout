#!/usr/bin/env node
// Lista todos os textos que o app passa por t(): as chamadas t('...') literais do app.js e os textos
// dos dados fixos (heurísticas, cartas do Método, exemplos, pedidos do MCP) que passam por t() ao desenhar.
// Usado pelo teste que confere se cada idioma tem tradução para tudo, e para gerar a lista a traduzir.
const fs = require('fs');
const path = require('path');

function chaves() {
  const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const out = new Set();
  // t('...') com aspas simples; aceita \' dentro.
  for (const m of js.matchAll(/(?<![\w.])t\('((?:[^'\\]|\\.)*)'/g)) out.add(m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
  const bloco = nome => {
    // Bloco numa linha só (const X = {...};) ou em várias, fechando no início de uma linha.
    const m = js.match(new RegExp(`const ${nome} = ([\\[{][^\\n]*[\\]}]);\\n`)) || js.match(new RegExp(`const ${nome} = ([\\[{][\\s\\S]*?\\n[\\]}]);`));
    return m ? Function(`return ${m[1]}`)() : null;
  };
  const add = v => { if (typeof v === 'string' && v.trim()) out.add(v); };
  bloco('HEUR').forEach(h => { add(h.cat); add(h.t); add(h.p); });
  Object.values(bloco('DESAFIO')).forEach(add);
  bloco('CARTAS_METODO').forEach(c => { ['etapa', 'titulo', 'pergunta', 'autor', 'h', 'verso'].forEach(k => add(c[k])); (c.nota || []).forEach(add); });
  bloco('EXEMPLOS_CHARTER').forEach(e => Object.values(e).forEach(add));
  bloco('MCP_PEDIDOS').forEach(p => { add(p.t); add(p.txt); p.tags.forEach(add); });
  bloco('MCP_FERRAMENTAS').forEach(([g, fs]) => { add(g); fs.forEach(([, d]) => add(d)); });
  Object.values(bloco('TYPES')).forEach(x => add(x.label));
  Object.values(bloco('PLURAL')).forEach(add);
  Object.values(bloco('REGISTRADO')).forEach(add);
  Object.values(bloco('SALVO')).forEach(add);
  ['Todas', 'Teste', 'Bug', 'Setup', 'o comando de instalação', 'o comando de conferência'].forEach(add);
  // Textos do index.html marcados com data-i18n.
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  for (const m of html.matchAll(/data-i18n(?:-[a-z]+)?="([^"]+)"/g)) add(m[1]);
  return [...out].sort();
}

module.exports = { chaves };
if (require.main === module) console.log(JSON.stringify(chaves(), null, 1));
