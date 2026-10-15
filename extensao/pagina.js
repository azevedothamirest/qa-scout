// Roda no contexto da própria página (world MAIN), desde o início do carregamento, para enxergar
// erros de JavaScript e chamadas a console.error. Só repassa um resumo para o content.js por evento
// do DOM; até ele ficar pronto, os erros ficam numa fila curta.
(() => {
  if (window.__qaScoutPagina) return;
  window.__qaScoutPagina = true;

  const MAX = 20;
  const fila = [];
  let pronto = false, enviados = 0;
  const vistos = new Set();

  const texto = v => {
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    if (typeof v === 'string') return v;
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  };

  function avisa(tipo, msg) {
    msg = String(msg || '').replace(/\s+/g, ' ').trim().slice(0, 160);
    const chave = tipo + msg;
    if (!msg || vistos.has(chave) || enviados >= MAX) return;
    vistos.add(chave); enviados++;
    const det = { tipo, msg };
    if (pronto) document.dispatchEvent(new CustomEvent('qascout:erro', { detail: JSON.stringify(det) }));
    else fila.push(det);
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
