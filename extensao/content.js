// Roda nas abas de site do navegador de teste. Descreve o que foi clicado ou preenchido,
// sem nunca ler o valor digitado nos campos.
(() => {
  if (window.__qaScout) return;
  window.__qaScout = true;

  const limpa = s => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 80);

  function rotuloDoCampo(el) {
    if (el.labels && el.labels[0]) return limpa(el.labels[0].innerText);
    const ref = el.getAttribute('aria-labelledby');
    if (ref) { const r = document.getElementById(ref.split(' ')[0]); if (r) return limpa(r.innerText); }
    return limpa(el.getAttribute('aria-label') || el.placeholder || el.name || el.id);
  }

  function nomeDe(el) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return rotuloDoCampo(el);
    return limpa(el.getAttribute('aria-label') || el.innerText || el.getAttribute('title') || el.getAttribute('alt') || el.querySelector?.('img[alt]')?.alt);
  }

  function papelDe(el) {
    const role = el.getAttribute('role');
    if (role) return { button: 'botão', link: 'link', tab: 'aba', checkbox: 'caixa de seleção', menuitem: 'item de menu', option: 'opção', switch: 'chave' }[role] || role;
    const t = el.tagName;
    if (t === 'A') return 'link';
    if (t === 'BUTTON' || (t === 'INPUT' && /^(button|submit|reset)$/.test(el.type))) return 'botão';
    if (t === 'INPUT' && el.type === 'checkbox') return 'caixa de seleção';
    if (t === 'INPUT' && el.type === 'radio') return 'opção';
    if (/^(INPUT|TEXTAREA)$/.test(t)) return 'campo';
    if (t === 'SELECT') return 'lista';
    if (t === 'IMG') return 'imagem';
    return '';
  }

  const ALVO = 'a,button,input,textarea,select,label,summary,[role],[onclick],[tabindex],img';

  function envia(ev) {
    try { chrome.runtime.sendMessage({ qaScout: true, ...ev, url: location.href, titulo: document.title, ts: Date.now() }); } catch (e) {}
  }

  document.addEventListener('click', e => {
    const el = (e.target.closest && e.target.closest(ALVO)) || e.target;
    if (!el || el.nodeType !== 1) return;
    const papel = papelDe(el), nome = nomeDe(el);
    const desc = papel ? `Clicou ${papel === 'campo' || papel === 'link' || papel === 'botão' ? 'no' : 'em'} ${papel}${nome ? ` “${nome}”` : ''}`
      : `Clicou em “${nome || el.tagName.toLowerCase()}”`;
    envia({ tipo: 'clique', desc, x: e.clientX, y: e.clientY, vw: innerWidth, vh: innerHeight });
  }, true);

  document.addEventListener('change', e => {
    const el = e.target;
    if (!/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
    if (/^(button|submit|reset|checkbox|radio|file|hidden)$/.test(el.type)) return;
    const nome = rotuloDoCampo(el);
    const desc = el.type === 'password' ? 'Preencheu um campo de senha'
      : el.tagName === 'SELECT' ? `Escolheu uma opção em “${nome || 'lista'}”`
      : `Preencheu o campo${nome ? ` “${nome}”` : ''}`;
    envia({ tipo: 'campo', desc });
  }, true);
})();
