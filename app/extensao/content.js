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

  // Frases das notas no idioma escolhido no painel (qascout.idioma). Papéis e tipos de campo usam
  // chaves internas; cada idioma monta a frase do seu jeito.
  const q = n => n ? ` “${n}”` : '';
  const FRASES = {
    'pt-BR': {
      papel: { botao: 'botão', link: 'link', aba: 'aba', caixa: 'caixa de seleção', menu: 'item de menu', opcao: 'opção', chave: 'chave', campo: 'campo', lista: 'lista', imagem: 'imagem' },
      tipo: { date: 'de data', 'datetime-local': 'de data e hora', time: 'de hora', month: 'de mês', week: 'de semana', range: 'deslizante', color: 'de cor', number: 'numérico', email: 'de e-mail', tel: 'de telefone', url: 'de endereço', search: 'de busca', texto: 'de texto', longo: 'de texto longo' },
      clique: (k, p, n) => `Clicou ${/^(botao|link|campo)$/.test(k) ? 'no' : 'em'} ${p}${q(n)}`,
      cliqueSem: n => `Clicou em “${n}”`,
      senha: 'Preencheu um campo de senha',
      anexo: (qtd, n) => `Anexou ${qtd > 1 ? `${qtd} arquivos` : 'um arquivo'}${n ? ` em “${n}”` : ''}`,
      escolheu: (o, n) => o ? `Escolheu “${o}” em “${n || 'lista'}”` : `Escolheu uma opção em “${n || 'lista'}”`,
      campo: (tp, n) => n ? `Preencheu o campo${tp ? ` ${tp}` : ''} “${n}”` : `Preencheu um campo ${tp}`,
      marcas: { bug: 'Bug marcado neste momento', duv: 'Dúvida marcada neste momento', ide: 'Ideia marcada neste momento', ris: 'Risco marcado neste momento', obs: 'Observação marcada neste momento' },
      marcou: 'Marcou este momento', js: 'Erro de JavaScript', console: 'Erro no console',
    },
    'pt-PT': {
      papel: { botao: 'botão', link: 'link', aba: 'separador', caixa: 'caixa de verificação', menu: 'item de menu', opcao: 'opção', chave: 'interruptor', campo: 'campo', lista: 'lista', imagem: 'imagem' },
      tipo: { date: 'de data', 'datetime-local': 'de data e hora', time: 'de hora', month: 'de mês', week: 'de semana', range: 'deslizante', color: 'de cor', number: 'numérico', email: 'de e-mail', tel: 'de telefone', url: 'de endereço', search: 'de pesquisa', texto: 'de texto', longo: 'de texto longo' },
      clique: (k, p, n) => `Clicou ${/^(botao|link|campo|separador|interruptor)$/.test(k) ? 'no' : 'em'} ${p}${q(n)}`,
      cliqueSem: n => `Clicou em “${n}”`,
      senha: 'Preencheu um campo de palavra-passe',
      anexo: (qtd, n) => `Anexou ${qtd > 1 ? `${qtd} ficheiros` : 'um ficheiro'}${n ? ` em “${n}”` : ''}`,
      escolheu: (o, n) => o ? `Escolheu “${o}” em “${n || 'lista'}”` : `Escolheu uma opção em “${n || 'lista'}”`,
      campo: (tp, n) => n ? `Preencheu o campo${tp ? ` ${tp}` : ''} “${n}”` : `Preencheu um campo ${tp}`,
      marcas: { bug: 'Bug marcado neste momento', duv: 'Dúvida marcada neste momento', ide: 'Ideia marcada neste momento', ris: 'Risco marcado neste momento', obs: 'Observação marcada neste momento' },
      marcou: 'Marcou este momento', js: 'Erro de JavaScript', console: 'Erro na consola',
    },
    en: {
      papel: { botao: 'button', link: 'link', aba: 'tab', caixa: 'checkbox', menu: 'menu item', opcao: 'option', chave: 'switch', campo: 'field', lista: 'list', imagem: 'image' },
      tipo: { date: 'date', 'datetime-local': 'date and time', time: 'time', month: 'month', week: 'week', range: 'slider', color: 'color', number: 'number', email: 'email', tel: 'phone', url: 'URL', search: 'search', texto: 'text', longo: 'long text' },
      clique: (k, p, n) => `Clicked the ${p}${q(n)}`,
      cliqueSem: n => `Clicked “${n}”`,
      senha: 'Filled in a password field',
      anexo: (qtd, n) => `Attached ${qtd > 1 ? `${qtd} files` : 'a file'}${n ? ` to “${n}”` : ''}`,
      escolheu: (o, n) => o ? `Chose “${o}” in “${n || 'list'}”` : `Chose an option in “${n || 'list'}”`,
      campo: (tp, n) => n ? `Filled in the${tp ? ` ${tp}` : ''} field “${n}”` : `Filled in a ${tp} field`,
      marcas: { bug: 'Bug marked at this moment', duv: 'Question marked at this moment', ide: 'Idea marked at this moment', ris: 'Risk marked at this moment', obs: 'Observation marked at this moment' },
      marcou: 'Marked this moment', js: 'JavaScript error', console: 'Console error',
    },
    es: {
      papel: { botao: 'botón', link: 'enlace', aba: 'pestaña', caixa: 'casilla', menu: 'elemento de menú', opcao: 'opción', chave: 'interruptor', campo: 'campo', lista: 'lista', imagem: 'imagen' },
      tipo: { date: 'de fecha', 'datetime-local': 'de fecha y hora', time: 'de hora', month: 'de mes', week: 'de semana', range: 'deslizante', color: 'de color', number: 'numérico', email: 'de correo', tel: 'de teléfono', url: 'de dirección', search: 'de búsqueda', texto: 'de texto', longo: 'de texto largo' },
      clique: (k, p, n) => `Hizo clic en ${/^(aba|caixa|opcao|lista|imagem)$/.test(k) ? 'la' : 'el'} ${p}${q(n)}`,
      cliqueSem: n => `Hizo clic en “${n}”`,
      senha: 'Rellenó un campo de contraseña',
      anexo: (qtd, n) => `Adjuntó ${qtd > 1 ? `${qtd} archivos` : 'un archivo'}${n ? ` en “${n}”` : ''}`,
      escolheu: (o, n) => o ? `Eligió “${o}” en “${n || 'lista'}”` : `Eligió una opción en “${n || 'lista'}”`,
      campo: (tp, n) => n ? `Rellenó el campo${tp ? ` ${tp}` : ''} “${n}”` : `Rellenó un campo ${tp}`,
      marcas: { bug: 'Bug marcado en este momento', duv: 'Duda marcada en este momento', ide: 'Idea marcada en este momento', ris: 'Riesgo marcado en este momento', obs: 'Observación marcada en este momento' },
      marcou: 'Marcó este momento', js: 'Error de JavaScript', console: 'Error en la consola',
    },
  };
  let F = FRASES['pt-BR'];
  const usaIdioma = id => { if (FRASES[id]) F = FRASES[id]; };
  try {
    chrome.storage.local.get('qascout.idioma').then(r => usaIdioma(r['qascout.idioma'])).catch(() => {});
    chrome.storage.onChanged.addListener((m, area) => { if (area === 'local' && m['qascout.idioma']) usaIdioma(m['qascout.idioma'].newValue); });
  } catch (e) {}

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
    if (role) return { button: 'botao', link: 'link', tab: 'aba', checkbox: 'caixa', menuitem: 'menu', option: 'opcao', switch: 'chave' }[role] || role;
    const t = el.tagName;
    if (t === 'A') return 'link';
    if (t === 'BUTTON' || (t === 'INPUT' && /^(button|submit|reset)$/.test(el.type))) return 'botao';
    if (t === 'INPUT' && el.type === 'checkbox') return 'caixa';
    if (t === 'INPUT' && el.type === 'radio') return 'opcao';
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

  // Só ações reais de quem testa: eventos criados por script da página (isTrusted false) poderiam
  // inventar cliques, campos e marcas com print (GHSA-vh88-r3m4-957w).
  document.addEventListener('click', e => {
    if (!e.isTrusted) return;
    const t = alvoReal(e);
    if (!t || t.nodeType !== 1) return;
    const alvo = t.closest && t.closest(ALVO);
    const el = alvo || t;
    const papel = papelDe(el), nome = nomeDe(el, !!alvo);
    const desc = papel ? F.clique(papel, F.papel[papel] || papel, nome) : F.cliqueSem(nome || el.tagName.toLowerCase());
    // Dentro de iframe as coordenadas não batem com o print da aba: vai sem a marca do clique.
    envia(emQuadro ? { tipo: 'clique', desc } : { tipo: 'clique', desc, x: e.clientX, y: e.clientY, vw: innerWidth, vh: innerHeight });
  }, true);

  // Select com dados pessoais (cartão, nascimento...) não mostra a opção escolhida.
  const SENSIVEL = /^(cc-|bday|sex|transaction|one-time-code|new-password|current-password)/;

  function aoMudar(e) {
    if (!e.isTrusted) return;
    const el = alvoReal(e);
    if (!el || !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
    if (/^(button|submit|reset|checkbox|radio|hidden)$/.test(el.type)) return;
    const nome = rotuloDoCampo(el);
    let desc;
    if (el.type === 'password') desc = F.senha;
    else if (el.type === 'file') desc = F.anexo(el.files ? el.files.length : 1, nome);
    else if (el.tagName === 'SELECT') {
      const opcao = SENSIVEL.test(el.autocomplete || '') ? '' : limpa([...el.selectedOptions].map(o => o.label || o.text).join(', '));
      desc = F.escolheu(opcao, nome);
    } else {
      // Tipos de campo que não têm rótulo próprio na nota: o tipo vira a descrição.
      const tipo = F.tipo[el.type];
      desc = F.campo(nome ? tipo : tipo || F.tipo[el.tagName === 'TEXTAREA' ? 'longo' : 'texto'], nome);
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
  const TIPOS = { Digit1: 'bug', Digit2: 'duv', Digit3: 'ide', Digit4: 'ris', Digit5: 'obs' };
  document.addEventListener('keydown', e => {
    const tipo = TIPOS[e.code];
    if (tipo && e.isTrusted && e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      envia({ tipo: 'marca', nota: tipo, desc: F.marcas[tipo] });
    }
  }, true);

  // Atalho para marcar o momento sem sair do sistema em teste: vira nota com print da tela.
  document.addEventListener('keydown', e => {
    if (e.isTrusted && e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyM') {
      e.preventDefault();
      envia({ tipo: 'marca', desc: F.marcou });
    }
  }, true);

  // Erros de JavaScript e console.error, repassados pelo pagina.js (que roda no contexto da página).
  // A página consegue disparar este evento por conta própria (ele vem do pagina.js, no mesmo mundo dela).
  // Por isso o limite do pagina.js é repetido aqui: até 20 erros diferentes por página e repetições
  // só como contagem de uma nota que já existe.
  const errosVistos = new Set();
  document.addEventListener('qascout:erro', e => {
    let det; try { det = JSON.parse(e.detail); } catch (err) { return; }
    if (!det || typeof det !== 'object') return;
    det.msg = String(det.msg || '').slice(0, 160);
    det.chave = String(det.chave || '').slice(0, 200);
    det.vezes = Math.min(Math.max(1, Math.floor(+det.vezes) || 1), 10000);
    if (!det.msg || !det.chave) return;
    if (!errosVistos.has(det.chave)) {
      if (det.repete || errosVistos.size >= 20) return;
      errosVistos.add(det.chave);
    } else if (!det.repete) return;
    const desc = `${det.tipo === 'js' ? F.js : F.console}: ${det.msg}`;
    envia({ tipo: 'erro', grave: det.tipo === 'js', desc, chave: det.chave, vezes: det.vezes, repete: det.repete });
  });
  document.dispatchEvent(new CustomEvent('qascout:pronto'));
})();
