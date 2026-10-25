// Roda só nas abas marcadas pela testadora. Descreve o que foi clicado ou preenchido,
// sem nunca ler o valor digitado nos campos.
(() => {
  if (window.__qaScout) return;
  window.__qaScout = true;

  // Em iframe, só captura se for do mesmo site da aba (anúncios e widgets de terceiros ficam de fora).
  const emQuadro = window !== window.top;
  if (emQuadro) {
    const topo = location.ancestorOrigins && location.ancestorOrigins[location.ancestorOrigins.length - 1];
    if (topo && topo !== location.origin) return;
  }

  // Corta em até 80 caracteres sem partir palavra.
  const limpa = s => {
    s = String(s || '').replace(/\s+/g, ' ').trim();
    if (s.length <= 80) return s;
    const corte = s.slice(0, 80), espaco = corte.lastIndexOf(' ');
    return (espaco > 40 ? corte.slice(0, espaco) : corte).replace(/[\s,.;:–-]+$/, '') + '…';
  };

  // Tipos de campo que não têm rótulo próprio na nota: o tipo vira a descrição.
  const TIPO_CAMPO = { date: 'de data', 'datetime-local': 'de data e hora', time: 'de hora', month: 'de mês', week: 'de semana', range: 'deslizante', color: 'de cor', number: 'numérico', email: 'de e-mail', tel: 'de telefone', url: 'de endereço', search: 'de busca' };

  function rotuloDoCampo(el) {
    if (el.labels && el.labels[0]) return limpa(el.labels[0].innerText);
    const ref = el.getAttribute('aria-labelledby');
    const raiz = el.getRootNode && el.getRootNode().getElementById ? el.getRootNode() : document;
    if (ref) { const r = raiz.getElementById(ref.split(' ')[0]); if (r) return limpa(r.innerText); }
    return limpa(el.getAttribute('aria-label') || el.placeholder || el.title || el.name || el.id);
  }

  // Texto só dos nós de texto diretos do elemento, sem descer nos filhos.
  const textoProprio = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ');

  // Em container (área sem interação, ou com texto longo), o innerText traria a página inteira
  // para a nota; aí só vale o texto próprio do elemento.
  function nomeDe(el, interativo) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return rotuloDoCampo(el);
    // Botão só com ícone: o nome vem do aria-label/title do próprio SVG ou do <title> dentro dele.
    const svg = el.querySelector?.('svg');
    const rotulo = el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('alt')
      || (svg && (svg.getAttribute('aria-label') || svg.querySelector('title')?.textContent));
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

  // No shadow DOM o evento chega ao document com o alvo trocado pelo host; o elemento real
  // é o primeiro do composedPath().
  const alvoReal = e => (e.composedPath && e.composedPath()[0]) || e.target;

  document.addEventListener('click', e => {
    const t = alvoReal(e);
    if (!t || t.nodeType !== 1) return;
    const alvo = t.closest && t.closest(ALVO);
    const el = alvo || t;
    const papel = papelDe(el), nome = nomeDe(el, !!alvo);
    const desc = papel ? `Clicou ${papel === 'campo' || papel === 'link' || papel === 'botão' ? 'no' : 'em'} ${papel}${nome ? ` “${nome}”` : ''}`
      : `Clicou em “${nome || el.tagName.toLowerCase()}”`;
    // Dentro de iframe as coordenadas não batem com o print da aba: vai sem a marca do clique.
    envia(emQuadro ? { tipo: 'clique', desc } : { tipo: 'clique', desc, x: e.clientX, y: e.clientY, vw: innerWidth, vh: innerHeight });
  }, true);

  // Select com dados pessoais (cartão, nascimento...) não mostra a opção escolhida.
  const SENSIVEL = /^(cc-|bday|sex|transaction|one-time-code|new-password|current-password)/;

  function aoMudar(e) {
    const el = alvoReal(e);
    if (!el || !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
    if (/^(button|submit|reset|checkbox|radio|hidden)$/.test(el.type)) return;
    const nome = rotuloDoCampo(el);
    let desc;
    if (el.type === 'password') desc = 'Preencheu um campo de senha';
    else if (el.type === 'file') desc = `Anexou ${el.files && el.files.length > 1 ? `${el.files.length} arquivos` : 'um arquivo'}${nome ? ` em “${nome}”` : ''}`;
    else if (el.tagName === 'SELECT') {
      const opcao = SENSIVEL.test(el.autocomplete || '') ? '' : limpa([...el.selectedOptions].map(o => o.label || o.text).join(', '));
      desc = opcao ? `Escolheu “${opcao}” em “${nome || 'lista'}”` : `Escolheu uma opção em “${nome || 'lista'}”`;
    } else {
      const tipo = TIPO_CAMPO[el.type];
      desc = nome ? `Preencheu o campo${tipo ? ` ${tipo}` : ''} “${nome}”` : `Preencheu um campo ${tipo || (el.tagName === 'TEXTAREA' ? 'de texto longo' : 'de texto')}`;
    }
    envia({ tipo: 'campo', desc });
  }
  document.addEventListener('change', aoMudar, true);

  // O "change" não atravessa o shadow DOM: ao focar um campo dentro de um shadow root,
  // passa a ouvir o change direto naquela raiz.
  const raizesOuvidas = new WeakSet();
  document.addEventListener('focusin', e => {
    const raiz = alvoReal(e).getRootNode && alvoReal(e).getRootNode();
    if (raiz && raiz !== document && raiz.host && !raizesOuvidas.has(raiz)) {
      raizesOuvidas.add(raiz);
      raiz.addEventListener('change', aoMudar, true);
    }
  }, true);

  // Iframes que carregam depois: pede ao background para injetar o script neles também.
  if (!emQuadro) {
    const pedeQuadros = () => { try { chrome.runtime.sendMessage({ cmd: 'quadros' }); } catch (e) {} };
    const vigia = n => { if (n.tagName === 'IFRAME') n.addEventListener('load', pedeQuadros); };
    document.querySelectorAll('iframe').forEach(vigia);
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { vigia(n); n.querySelectorAll?.('iframe').forEach(vigia); } })))
      .observe(document.documentElement, { childList: true, subtree: true });
  }

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
