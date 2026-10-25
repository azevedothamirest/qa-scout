// Roda só nas abas marcadas pela testadora. Descreve o que foi clicado ou preenchido,
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

  // Texto só dos nós de texto diretos do elemento, sem descer nos filhos.
  const textoProprio = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ');

  // Em container (área sem interação, ou com texto longo), o innerText traria a página inteira
  // para a nota; aí só vale o texto próprio do elemento.
  function nomeDe(el, interativo) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return rotuloDoCampo(el);
    const rotulo = el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('alt');
    if (rotulo) return limpa(rotulo);
    const texto = String(el.innerText || '').replace(/\s+/g, ' ').trim();
    const container = !interativo || (texto.length > 80 && !/^(A|BUTTON|SUMMARY|LABEL)$/.test(el.tagName));
    return limpa((container ? textoProprio(el) : texto) || el.querySelector?.('img[alt]')?.alt);
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
    const alvo = e.target.closest && e.target.closest(ALVO);
    const el = alvo || e.target;
    if (!el || el.nodeType !== 1) return;
    const papel = papelDe(el), nome = nomeDe(el, !!alvo);
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

  // Alt+1 a Alt+5 no sistema em teste: marca o momento já com o tipo (bug, dúvida, ideia, risco,
  // observação), com print, sem precisar voltar ao painel.
  const TIPOS = { Digit1: ['bug', 'Bug'], Digit2: ['duv', 'Dúvida'], Digit3: ['ide', 'Ideia'], Digit4: ['ris', 'Risco'], Digit5: ['obs', 'Observação'] };
  document.addEventListener('keydown', e => {
    const tipo = TIPOS[e.code];
    if (tipo && e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      envia({ tipo: 'marca', nota: tipo[0], desc: `${tipo[1]} marcado neste momento` });
    }
  }, true);

  // Atalho para marcar o momento sem sair do sistema em teste: vira nota com print da tela.
  document.addEventListener('keydown', e => {
    if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyM') {
      e.preventDefault();
      envia({ tipo: 'marca', desc: 'Marcou este momento' });
    }
  }, true);

  // Erros de JavaScript e console.error, repassados pelo pagina.js (que roda no contexto da página).
  document.addEventListener('qascout:erro', e => {
    let det; try { det = JSON.parse(e.detail); } catch (err) { return; }
    const desc = det.tipo === 'js' ? `Erro de JavaScript: ${det.msg}` : `Erro no console: ${det.msg}`;
    envia({ tipo: 'erro', grave: det.tipo === 'js', desc, chave: det.chave, vezes: det.vezes, repete: det.repete });
  });
  document.dispatchEvent(new CustomEvent('qascout:pronto'));
})();
