// Idiomas do QA Scout. O texto em português do Brasil é a própria chave: t('Iniciar sessão') devolve a
// tradução do idioma ativo ou, se faltar, o original. {nome} no texto é trocado pelo valor em vars.
// Os dicionários ficam em i18n/<idioma>.js e se registram em QAS_I18N.dic.
(() => {
  const IDIOMAS = [
    { id: 'pt-BR', nome: 'Português (Brasil)', curto: 'PT-BR' },
    { id: 'pt-PT', nome: 'Português (Portugal)', curto: 'PT-PT' },
    { id: 'en', nome: 'English', curto: 'EN' },
    { id: 'es', nome: 'Español', curto: 'ES' },
  ];
  const CHAVE = 'qascout.idioma';
  const valido = id => IDIOMAS.some(i => i.id === id);

  // Primeira visita: segue o navegador. pt-PT só para Portugal; outro português cai em pt-BR;
  // idioma sem tradução cai em inglês.
  function doNavegador() {
    for (const l of (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''])) {
      const x = String(l).toLowerCase();
      if (x === 'pt-pt') return 'pt-PT';
      if (x.startsWith('pt')) return 'pt-BR';
      if (x.startsWith('en')) return 'en';
      if (x.startsWith('es')) return 'es';
    }
    return 'en';
  }

  let atual = null;
  try { const s = localStorage.getItem(CHAVE); if (valido(s)) atual = s; } catch (e) {}
  if (!atual) atual = doNavegador();

  const dic = {};
  function t(txt, vars) {
    let s = (atual !== 'pt-BR' && dic[atual] && dic[atual][txt]) || txt;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    return s;
  }
  // Todas as versões de um texto (para reconhecer, por exemplo, "Passos para reproduzir:" em qualquer idioma).
  const todas = txt => [txt, ...Object.values(dic).map(d => d[txt]).filter(Boolean)];

  function definir(id) {
    if (!valido(id)) return;
    atual = id;
    try { localStorage.setItem(CHAVE, id); } catch (e) {}
    // Na extensão, a captura (content.js e background.js) lê o idioma daqui.
    try { if (window.chrome && chrome.storage && chrome.storage.local) chrome.storage.local.set({ [CHAVE]: id }); } catch (e) {}
    document.documentElement.lang = id;
  }
  document.documentElement.lang = atual;
  try { if (window.chrome && chrome.storage && chrome.storage.local) chrome.storage.local.set({ [CHAVE]: atual }); } catch (e) {}

  window.QAS_I18N = { IDIOMAS, dic, t, todas, definir, get atual() { return atual; } };
})();
