// Roda no contexto da própria página (world MAIN), desde o início do carregamento, para enxergar
// erros de JavaScript e chamadas a console.error. Só repassa um resumo para o content.js por evento
// do DOM; até ele ficar pronto, os erros ficam numa fila curta.
(() => {
  if (window.__qaScoutPagina) return;
  window.__qaScoutPagina = true;

  // Até MAX erros diferentes por página. O mesmo erro repetido (números ignorados, para juntar
  // "item 1", "item 2"...) não vira nota nova: a contagem vai junto, de uma vez, 1 s depois da rajada.
  const MAX = 20;
  const fila = [];
  let pronto = false;
  const vistos = new Map(); // chave -> { msg, tipo, extra }
  let timer = 0;

  const texto = v => {
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    if (typeof v === 'string') return v;
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  };

  function despacha(det) {
    if (pronto) document.dispatchEvent(new CustomEvent('qascout:erro', { detail: JSON.stringify(det) }));
    else fila.push(det);
  }

  function enviaRepeticoes() {
    timer = 0;
    vistos.forEach((v, chave) => {
      if (v.extra) { despacha({ tipo: v.tipo, msg: v.msg, chave, vezes: v.extra, repete: true }); v.extra = 0; }
    });
  }

  function avisa(tipo, msg) {
    msg = String(msg || '').replace(/\s+/g, ' ').trim().slice(0, 160);
    if (!msg) return;
    const chave = tipo + ':' + msg.replace(/\d+/g, '#');
    const visto = vistos.get(chave);
    if (visto) { visto.extra++; if (!timer) timer = setTimeout(enviaRepeticoes, 1000); return; }
    if (vistos.size >= MAX) return;
    vistos.set(chave, { tipo, msg, extra: 0 });
    despacha({ tipo, msg, chave, vezes: 1 });
  }

  document.addEventListener('qascout:pronto', () => {
    pronto = true;
    fila.splice(0).forEach(det => document.dispatchEvent(new CustomEvent('qascout:erro', { detail: JSON.stringify(det) })));
  });

  window.addEventListener('error', e => { if (e.error || e.message) avisa('js', e.error ? texto(e.error) : e.message); });
  window.addEventListener('unhandledrejection', e => avisa('js', `Promise rejeitada: ${texto(e.reason)}`));

  const original = console.error;
  console.error = function (...args) {
    try { avisa('console', args.map(texto).join(' ')); } catch (e) {}
    return original.apply(this, args);
  };
})();
