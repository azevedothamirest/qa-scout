(() => {
const { t, todas: todasVersoes } = window.QAS_I18N;
/* ---------- dados fixos ---------- */
const TYPES = {
  bug:{label:'Bug',cls:'t-bug',key:'1'},
  duv:{label:'Dúvida',cls:'t-duv',key:'2'},
  ide:{label:'Ideia',cls:'t-ide',key:'3'},
  ris:{label:'Risco',cls:'t-ris',key:'4'},
  obs:{label:'Observação',cls:'t-obs',key:'5'}
};
const TYPE_ORDER = ['bug','duv','ide','ris','obs'];
const PLURAL = {bug:'Bugs',duv:'Dúvidas',ide:'Ideias',ris:'Riscos',obs:'Observações'};
const rot = k => t((TYPES[k]||TYPES.obs).label), plural = k => t(PLURAL[k]);

const HEUR = [
  {cat:'Tours',t:'Tour do dinheiro',p:'Siga o caminho que gera receita ou mexe com saldo. Onde um erro aqui custaria dinheiro a alguém?'},
  {cat:'Tours',t:'Tour do coletor de lixo',p:'Passe por cada tela de forma rápida e sistemática, como quem confere cômodo por cômodo. O que parece fora do lugar?'},
  {cat:'Tours',t:'Tour do sabotador',p:'Tente fazer a aplicação falhar: tire a rede, encha o disco, force timeouts. Ela avisa ou quebra em silêncio?'},
  {cat:'Tours',t:'Tour do ônibus da madrugada',p:'Use a aplicação no horário e no cenário mais estranho: virada de mês, meia-noite, fim de semana, feriado.'},
  {cat:'Dados',t:'Zero, um, muitos',p:'Teste com nenhum item, exatamente um e uma quantidade grande. Listas, carrinhos, anexos, parcelas.'},
  {cat:'Dados',t:'Cachinhos Dourados',p:'Valores pequenos demais, grandes demais e na medida certa. Depois, os vizinhos de cada limite.'},
  {cat:'Dados',t:'CPF, CNPJ e máscaras',p:'Com e sem pontuação, colado com espaço no fim, dígito verificador errado, CPF com todos os números iguais.'},
  {cat:'Dados',t:'Acentos e caracteres',p:'Nomes como "João D\'Ávila", emoji, ç, textos muito longos e campos só com espaço.'},
  {cat:'Dados',t:'Dinheiro em reais',p:'R$ 0,01, R$ 1.000,00, vírgula versus ponto, arredondamento de juros e de parcelas.'},
  {cat:'Interação',t:'Interrupções',p:'Feche a aba no meio do fluxo, volte pelo navegador, perca a conexão, deixe a sessão expirar.'},
  {cat:'Interação',t:'Clique duplo e pressa',p:'Clique duas vezes em salvar, pagar ou enviar. Envie o formulário antes da tela terminar de carregar.'},
  {cat:'Interação',t:'Duas abas, uma conta',p:'Faça a mesma ação em duas abas ou dois dispositivos ao mesmo tempo. Qual versão vence?'},
  {cat:'Interação',t:'CRUD completo',p:'Crie, leia, altere e apague. Depois tente alterar o que já foi apagado e criar algo duplicado.'},
  {cat:'Contexto',t:'Fuso e calendário',p:'Datas perto da meia-noite, fuso diferente, 29 de fevereiro, horário de verão em sistemas antigos.'},
  {cat:'Contexto',t:'Permissões',p:'Entre com perfis diferentes. O que um usuário comum vê que só o administrador deveria ver?'},
  {cat:'Contexto',t:'Mensagens de erro',p:'Cada erro explica o que aconteceu e como resolver? Algum expõe stack trace, SQL ou dado sensível?'},
  {cat:'Contexto',t:'Acessibilidade rápida',p:'Navegue só com teclado, aumente o zoom para 200% e confira o contraste dos textos principais.'},
  {cat:'Contexto',t:'Celular de verdade',p:'Rede 3G, tela pequena, teclado virtual cobrindo o botão, rotação da tela no meio do formulário.'}
];

// Um desafio concreto e curto para cada carta: o "faz isso agora" de quem travou.
const DESAFIO = {
  'Tour do dinheiro':'Ache o botão que cobra ou devolve dinheiro e tente executar duas vezes seguidas.',
  'Tour do coletor de lixo':'Abra 5 telas em sequência e anote a primeira coisa estranha de cada uma.',
  'Tour do sabotador':'Ligue o modo offline do DevTools no meio de um salvar. O que a tela diz?',
  'Tour do ônibus da madrugada':'Mude a data do sistema para 31/12 às 23:59 e repita o fluxo principal.',
  'Zero, um, muitos':'Pegue uma lista da tela e teste com 0 itens, 1 item e 100 itens.',
  'Cachinhos Dourados':'Escolha um campo numérico e teste o mínimo, o mínimo menos 1 e o máximo mais 1.',
  'CPF, CNPJ e máscaras':'Cole 111.111.111-11 e depois um CPF válido com espaço no final.',
  'Acentos e caracteres':'Cadastre o nome "João D\'Ávila 🚀" e procure por ele depois.',
  'Dinheiro em reais':'Digite 1.000,50 e depois 1,000.50 no mesmo campo de valor.',
  'Interrupções':'No meio de um formulário, aperte voltar do navegador e depois avançar.',
  'Clique duplo e pressa':'Dê clique duplo no botão principal da tela e conte quantos registros nasceram.',
  'Duas abas, uma conta':'Abra o mesmo registro em duas abas, edite nas duas e salve as duas.',
  'CRUD completo':'Apague um item e, em outra aba, tente editar esse mesmo item.',
  'Fuso e calendário':'Agende algo para 29/02 e para meia-noite em ponto.',
  'Permissões':'Copie a URL de uma tela de admin e abra logado como usuário comum.',
  'Mensagens de erro':'Provoque 3 erros diferentes e leia cada mensagem como se fosse o cliente.',
  'Acessibilidade rápida':'Faça o fluxo principal só com Tab, Enter e Esc.',
  'Celular de verdade':'Ative o throttling "Slow 3G" e gire a tela no meio do formulário.'
};

/* ---------- exemplos ---------- */
const MIN = 60000;
let CAN_PRINT = false; try{ CAN_PRINT = window.self === window.top; }catch(e){}
function ex1(){
  const start = new Date('2026-10-09T14:10:00-03:00').getTime();
  return {id:'ex-pix',example:true,area:t('Checkout · pagamento com Pix'),
    charter:{explorar:t('o pagamento com Pix no checkout'),com:t('expiração do QR Code, botão voltar e pedidos com cupom'),descobrir:t('pedidos pagos que ficam pendentes ou cobranças em dobro')},
    ambiente:t('Homologação · build 4.18.2'),testadora:'Thamires',plannedMin:60,status:'done',startedAt:start,endedAt:start+57*MIN,elapsedMs:54*MIN,
    notes:[
      {id:'n1',type:'obs',t:3*MIN+12000,text:t('QR Code gerado em ~2s. Tempo de expiração exibido: 15 min.')},
      {id:'n2',type:'bug',t:11*MIN+40000,text:t('Com cupom de 10%, voltar da tela do QR Code e gerar de novo aplica o desconto duas vezes (R$ 90,00 → R$ 81,00).')},
      {id:'n3',type:'duv',t:18*MIN+5000,text:t('Depois que o QR expira, o pedido deve ser cancelado ou continuar aguardando pagamento? Critério não cita.')},
      {id:'n4',type:'ris',t:26*MIN+51000,text:t('Webhook de confirmação chega antes do pedido ser salvo quando o pagamento é muito rápido. Pode gerar pedido pago marcado como pendente.')},
      {id:'n5',type:'bug',t:34*MIN+2000,text:t('Mensagem "Erro inesperado" ao copiar o código Pix no Safari iOS. Cópia funciona, mas o toast de erro aparece.')},
      {id:'n6',type:'ide',t:41*MIN+30000,text:t('Sessão futura: explorar estorno de Pix parcial no painel administrativo.')},
      {id:'n7',type:'obs',t:49*MIN+15000,text:t('Com rede 3G, a tela de confirmação demora ~8s sem indicador de carregamento.')}
    ],
    debrief:{test:55,bug:30,setup:15,coverage:t('Geração e cópia do QR Code, expiração, cupom com Pix, voltar do navegador.'),next:t('Estorno parcial, Pix agendado, pedidos acima de R$ 5.000.')}};
}
function ex2(){
  const start = new Date('2026-10-07T10:30:00-03:00').getTime();
  return {id:'ex-cpf',example:true,area:t('Cadastro PF · validação de CPF'),
    charter:{explorar:t('o cadastro de pessoa física'),com:t('CPFs com e sem máscara, colados e com dígito inválido'),descobrir:t('cadastros aceitos com documento inválido')},
    ambiente:t('Staging · web'),testadora:'Thamires',plannedMin:30,status:'done',startedAt:start,endedAt:start+33*MIN,elapsedMs:31*MIN,
    notes:[
      {id:'m1',type:'bug',t:6*MIN,text:t('CPF 111.111.111-11 é aceito como válido.')},
      {id:'m2',type:'obs',t:12*MIN+20000,text:t('Colar CPF com espaço no final bloqueia o botão Continuar sem nenhuma mensagem.')},
      {id:'m3',type:'duv',t:19*MIN,text:t('Menor de idade pode se cadastrar? Data de nascimento não é validada.')},
      {id:'m4',type:'ide',t:27*MIN+45000,text:t('Automatizar a tabela de CPFs inválidos em Playwright com teste parametrizado.')}
    ],
    debrief:{test:70,bug:20,setup:10,coverage:t('Campo CPF, máscara, cola e mensagens de validação.'),next:t('Data de nascimento e e-mail duplicado.')}};
}

/* ---------- armazenamento ---------- */
const KEY = 'qascout.v1';
// Dentro da extensão, o estado vai para chrome.storage.local (sem o limite de ~5 MB do localStorage,
// que estouraria com os prints automáticos).
const EXT = (()=>{ try{ return !!(window.chrome && chrome.runtime && chrome.runtime.id && chrome.storage); }catch(e){ return false; } })();
const EV_PREFIX = 'qascout.ev.';
function fresh(){ return {sessions:[ex1(),ex2()],activeId:null,draft:null}; }
// Dados ilegíveis não são descartados: vão para KEY.corrompido e o app avisa ao abrir.
const estadoValido = s => !!s && typeof s==='object' && Array.isArray(s.sessions) && s.sessions.every(x=>x && typeof x==='object' && x.id && x.charter && Array.isArray(x.notes)) && (s.sessions.forEach(normalizaSessao), true);
// Sessões que chegam de fora (backup, storage, outra aba) vão para o innerHTML: cada campo é forçado ao
// tipo esperado, ids só com letras e números, prints só como data:image e tipo de nota conhecido
// (GHSA-6hxg-hmpc-459h).
const ID_OK = /^[\w-]{1,40}$/;
const imgOk = src => typeof src==='string' && /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(src);
const num = (v, padrao=0) => Number.isFinite(+v) ? +v : padrao;
const txt = v => v==null ? '' : String(v);
function normalizaSessao(s){
  if(!ID_OK.test(s.id)) s.id = Math.random().toString(36).slice(2,10);
  ['area','ambiente','testadora','status','navegador'].forEach(k=>{ if(k in s) s[k]=txt(s[k]); });
  ['plannedMin','elapsedMs','startedAt','endedAt','segStart'].forEach(k=>{ if(k in s) s[k]=num(s[k]); });
  if(!s.plannedMin) s.plannedMin=30;
  const c = s.charter && typeof s.charter==='object' ? s.charter : {};
  s.charter = {explorar:txt(c.explorar), com:txt(c.com), descobrir:txt(c.descobrir)};
  if(s.debrief && typeof s.debrief==='object'){
    const d=s.debrief; s.debrief={test:num(d.test),bug:num(d.bug),setup:num(d.setup),coverage:txt(d.coverage),next:txt(d.next)};
  } else delete s.debrief;
  s.notes = s.notes.filter(n=>n && typeof n==='object').map(n=>({...n,
    id: ID_OK.test(n.id) ? n.id : Math.random().toString(36).slice(2,10),
    type: TYPES[n.type] && TYPE_ORDER.includes(n.type) ? n.type : 'obs',
    t: num(n.t), text: txt(n.text), url: txt(n.url),
    imgs: Array.isArray(n.imgs) ? n.imgs.filter(imgOk) : [],
  }));
  return s;
}
let corrompido = false;
function load(){
  if(EXT) return fresh();
  let raw=null;
  try{ raw = localStorage.getItem(KEY); }catch(e){}
  if(!raw) return fresh();
  try{ const s=JSON.parse(raw); if(estadoValido(s)) return s; }catch(e){}
  corrompido = true;
  try{ localStorage.setItem(KEY+'.corrompido', raw); }catch(e){}
  return fresh();
}
let state = load();
let storageOk = true, warned = false;
if(!EXT){ try{ localStorage.setItem(KEY+'.t','1'); localStorage.removeItem(KEY+'.t'); }catch(e){ storageOk = false; } }
// Cada aba marca o que grava; assim adotarEstado() ignora o eco das próprias gravações
// (o chrome.storage.onChanged chega depois, e o estado em memória pode já estar mais novo).
const ABA_ID = Math.random().toString(36).slice(2);
function save(){
  state._aba = ABA_ID;
  if(EXT){ chrome.storage.local.set({[KEY]:state}).catch(()=>toast(t('Não foi possível salvar a sessão.'))); return true; }
  if(!storageOk){ if(!warned){ warned=true; toast(t('Este navegador não permite salvar. A sessão fica só nesta aba.')); } return true; }
  try{ localStorage.setItem(KEY, JSON.stringify(state)); return true; }
  catch(e){ toast(t('Espaço do navegador cheio. Remova alguns prints e tente de novo.')); return false; }
}

/* ---------- utilidades ---------- */
const $ = (s,el=document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Math.random().toString(36).slice(2,10);
const pad = n => String(n).padStart(2,'0');
function fmtClock(ms){ const s=Math.max(0,Math.floor(ms/1000)); const h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return h? `${h}:${pad(m)}:${pad(x)}` : `${pad(m)}:${pad(x)}`; }
function fmtT(ms){ const s=Math.floor(ms/1000); return `${pad(Math.floor(s/60))}:${pad(s%60)}`; }
// Datas no formato do idioma (o inglês usa o britânico, dia/mês/ano).
const localeData = () => { const l=window.QAS_I18N.atual; return l==='en'?'en-GB':l; };
const mesCurto = d => d.toLocaleDateString(localeData(),{month:'short'}).replace('.','');
function fmtDate(ts){ return new Date(ts).toLocaleDateString(localeData(),{day:'2-digit',month:'2-digit',year:'numeric'}); }
function elapsed(s){ return s.elapsedMs + (s.status==='running' && s.runStartedAt ? Date.now()-s.runStartedAt : 0); }
function counts(s){ const c={bug:0,duv:0,ide:0,ris:0,obs:0}; s.notes.forEach(n=>{ if(!n.pending) c[n.type]++; }); return c; }
function pendentes(s){ return s.notes.filter(n=>n.pending); }
function charterHtml(c){ return t('Explorar {explorar} com {com} para descobrir {descobrir}',{explorar:`<b>${esc(c.explorar)}</b>`,com:`<b>${esc(c.com)}</b>`,descobrir:`<b>${esc(c.descobrir)}</b>`}); }
function charterText(c){ return t('Explorar {explorar} com {com} para descobrir {descobrir}', c); }
function getActive(){ return state.sessions.find(s=>s.id===state.activeId && s.status!=='done') || null; }
let toastT;
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2600); }
async function copy(text, okMsg, fallbackEl){
  try{ await navigator.clipboard.writeText(text); toast(okMsg); }
  catch(e){ if(fallbackEl){ fallbackEl.focus(); fallbackEl.select(); } toast(t('Texto selecionado. Use Ctrl+C para copiar.')); }
}

/* ---------- roteamento ---------- */
let view = 'home', viewArg = null;
function go(v,arg=null){
  view=v; viewArg=arg; render();
  const alvo = v==='metodo' && arg ? document.getElementById('m-'+arg) : null;
  if(alvo){ virarCarta(alvo,true); alvo.scrollIntoView({block:'center'}); alvo.focus({preventScroll:true}); } else window.scrollTo({top:0});
}
// Avisos com a concordância de cada idioma: "Bug registrado", "Dúvida registrada".
const REGISTRADO = {bug:'Bug registrado',duv:'Dúvida registrada',ide:'Ideia registrada',ris:'Risco registrado',obs:'Observação registrada'};
const SALVO = {bug:'Bug salvo',duv:'Dúvida salva',ide:'Ideia salva',ris:'Risco salvo',obs:'Observação salva'};
function registrado(k){ return t(REGISTRADO[k]); }

function render(){
  const active = getActive();
  ['home','active','deck','metodo','mcp'].forEach(k=>{
    const b=$('#tab-'+k);
    const cur = (k==='home' && (view==='home'||view==='report')) || (k==='active' && (view==='active'||view==='new')) || k===view;
    b.setAttribute('aria-current', cur ? 'page':'false');
  });
  $('#tab-active').innerHTML = active ? `<span class="live"></span>${t('Em campo')}` : t('Nova sessão');
  stopTick();
  syncCaptura();
  const app = $('#app');
  if(view==='home') app.innerHTML = viewHome();
  else if(view==='new') app.innerHTML = viewNew();
  else if(view==='active'){ if(!active){ view='new'; app.innerHTML = viewNew(); } else { app.innerHTML = viewSession(active); startTick(); } }
  else if(view==='report') app.innerHTML = viewReport(state.sessions.find(s=>s.id===viewArg));
  else if(view==='deck') app.innerHTML = viewDeck();
  else if(view==='metodo') app.innerHTML = viewMetodo();
  else if(view==='mcp') app.innerHTML = viewMcp();
  afterRender();
}

/* ---------- tela: sessões ---------- */
let query = '';
function viewHome(){
  const done = state.sessions.filter(s=>s.status==='done').sort((a,b)=>b.startedAt-a.startedAt);
  const active = getActive();
  const totMin = Math.round(done.reduce((a,s)=>a+s.elapsedMs,0)/MIN);
  const bugs = done.reduce((a,s)=>a+counts(s).bug,0);
  const duv = done.reduce((a,s)=>a+counts(s).duv,0);
  const hasEx = state.sessions.some(s=>s.example);
  const q = query.trim().toLowerCase();
  const list = done.filter(s=>!q || [s.area,charterText(s.charter),s.ambiente,...s.notes.map(n=>n.text)].join(' ').toLowerCase().includes(q));
  return `<section class="view">
    ${active ? `<div class="banner"><p><b>${t('Sessão em andamento:')}</b> ${esc(active.area)} · ${fmtClock(elapsed(active))}${active.status==='paused'?' ('+t('pausada')+')':''}</p><button class="btn primary" data-go="active">${t('Voltar para a sessão')}</button></div>`:''}
    <div class="hero">
      <div>
        <div class="eyebrow">${t('Teste exploratório baseado em sessões')}</div>
        <h1 style="margin-top:10px">${t('Explore com missão.')}<br><em>${t('Volte com evidência.')}</em></h1>
        <p>${t('Defina o charter, ligue o cronômetro e anote bugs, dúvidas e riscos no ritmo da exploração. No fim, o relatório da sessão sai pronto para o time.')}</p>
        <div class="hero-actions">
          <button class="btn primary lg" data-go="${active?'active':'new'}">${active?t('Continuar sessão'):t('Começar nova sessão')}</button>
          <button class="btn lg ghost" data-go="deck">${t('Ver heurísticas')}</button>
        </div>
      </div>
      <div class="stats" aria-label="${t('Resumo das sessões')}">
        <div class="stat"><b>${done.length}</b><span>${t('sessões concluídas')}</span></div>
        <div class="stat"><b>${totMin}<small style="font-size:15px"> min</small></b><span>${t('explorando')}</span></div>
        <div class="stat"><b style="color:var(--t-bug)">${bugs}</b><span>${t('bugs encontrados')}</span></div>
        <div class="stat"><b style="color:var(--t-duv)">${duv}</b><span>${t('dúvidas levantadas')}</span></div>
      </div>
    </div>
    <div>
      <div class="section-head" style="margin-bottom:12px"><div><div class="eyebrow">${t('Como funciona')}</div><h2>${t('Uma sessão em 3 passos')}</h2></div><button class="link-btn" data-go="metodo">${t('Entenda o método →')}</button></div>
      <div class="passos">
        <div class="passo"><h3>${t('Escreva o charter')}</h3><p>${t('Uma missão curta: o que explorar, com o quê e para descobrir o quê.')}</p><small>Elisabeth Hendrickson</small></div>
        <div class="passo"><h3>${t('Explore com tempo marcado')}</h3><p>${t('Um bloco de tempo sem interrupção, do tamanho da missão. Anote bugs, dúvidas, ideias e riscos na hora.')}</p><small>${t('SBTM · James e Jon Bach')}</small></div>
        <div class="passo"><h3>${t('Faça o debriefing')}</h3><p>${t('Revise as notas, divida o tempo entre teste, bug e setup e leve o relatório para o time.')}</p><small>${t('PROOF e métricas TBS')}</small></div>
      </div>
    </div>
    ${!EXT ? `<div class="captura-promo">
      <div><h3>${t('Quer que ele anote sozinho?')}</h3><p>${t('Instale a extensão do Chrome: no painel lateral, cada clique, erro e falha de rede da aba que você acompanhar vira nota com print.')}</p>
      <p class="promo-alt">${t('Prefere um navegador separado?')} <code>npx github:azevedothamirest/qa-scout https://${t('seu-sistema')}</code></p></div>
      <a class="btn" href="https://chromewebstore.google.com/detail/qa-scout/goffncpkhonlejcokjgiobomlpiefpin" target="_blank" rel="noopener">${t('Instalar no Chrome ↗')}</a>
    </div>` : ''}
    <div class="section-head">
      <div><div class="eyebrow">${t('Histórico')}</div><h2>${t('Sessões anteriores')}</h2></div>
      <div class="backup"><button class="btn ghost" data-act="backup">${t('Baixar backup')}</button><label class="btn ghost file-lbl">${t('Importar backup')}<input type="file" id="backup-in" accept="application/json,.json"></label></div>
      <label class="search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="q" type="search" placeholder="${t('Buscar por área, charter ou nota')}" value="${esc(query)}" aria-label="${t('Buscar sessões')}"></label>
    </div>
    <div class="list" id="list">
      ${list.length ? list.map(rowHtml).join('') : `<div class="empty">${q?t('Nenhuma sessão encontrada para essa busca.'):t('Nenhuma sessão ainda. Comece a primeira e ela aparece aqui.')}</div>`}
    </div>
    ${hasEx ? `<div class="banner"><p>${t('As sessões marcadas como <b>exemplo</b> mostram como o app funciona. Remova quando quiser começar do zero.')}</p><button class="btn" data-act="clear-ex">${t('Remover exemplos')}</button></div>`:''}
  </section>`;
}
function rowHtml(s){
  const d=new Date(s.startedAt), c=counts(s);
  return `<button class="row" data-open="${s.id}">
    <div class="date"><b>${pad(d.getDate())}</b>${mesCurto(d)}</div>
    <div style="min-width:0"><h3>${esc(s.area)}${s.example?`<span class="tag-ex">${t('exemplo')}</span>`:''}</h3><p>${esc(charterText(s.charter))}</p></div>
    <div class="chips">
      <span class="chip">${Math.round(s.elapsedMs/MIN)}/${s.plannedMin} min</span>
      ${['bug','duv','ris'].filter(k=>c[k]).map(k=>`<span class="chip ${TYPES[k].cls}" style="color:var(--c)"><i></i><span style="color:var(--ink)">${c[k]} ${c[k]>1?plural(k).toLowerCase():rot(k).toLowerCase()}</span></span>`).join('')}
    </div>
  </button>`;
}

/* ---------- tela: novo charter ---------- */
function viewNew(){
  const d = state.draft || {explorar:'',com:'',descobrir:'',area:'',ambiente:'',testadora:'',plannedMin:60};
  return `<section class="view">
    <div class="section-head">
      <div><div class="eyebrow">${t('Nova sessão')}</div><h2 style="font-size:28px;margin-top:6px">${t('Escreva o charter da sessão')}</h2></div>
      <div style="display:flex;gap:14px;align-items:center"><button class="ajuda" type="button" data-go="metodo" data-arg="charter">${t('Por que charter?')}</button><button class="btn" type="button" data-act="exemplo-charter">${t('Usar um exemplo')}</button></div>
    </div>
    <form class="panel form-grid" id="charter-form" novalidate>
      <div class="charter-sentence">
        <label for="c-exp">${t('Explorar')} <span class="obrig">${t('obrigatório')}</span></label>
        <textarea id="c-exp" rows="1" placeholder="${t('o que você vai testar')}" required aria-describedby="c-exp-err">${esc(d.explorar)}</textarea>
        <p class="msg-erro" id="c-exp-err" hidden>${t('Diga o que você vai explorar.')}</p>
        <label for="c-com">${t('com')}</label>
        <textarea id="c-com" rows="1" placeholder="${t('quais recursos, dados ou técnicas')}">${esc(d.com)}</textarea>
        <label for="c-des">${t('para descobrir')} <span class="obrig">${t('obrigatório')}</span></label>
        <textarea id="c-des" rows="1" placeholder="${t('que tipo de informação ou problema')}" required aria-describedby="c-des-err">${esc(d.descobrir)}</textarea>
        <p class="msg-erro" id="c-des-err" hidden>${t('Diga o que você quer descobrir.')}</p>
        <p class="hint" style="font-family:var(--f-body);font-size:13.5px;margin:4px 0 0">${t('Modelo de charter de Elisabeth Hendrickson. Uma missão clara mantém a sessão focada sem virar roteiro.')}</p>
      </div>
      <div>
        <div class="field"><label for="c-area">${t('Área ou funcionalidade')}</label><input id="c-area" placeholder="${t('Ex.: Checkout · pagamento com cartão')}" value="${esc(d.area)}"></div>
        <div class="field"><label for="c-amb">${t('Ambiente e versão')}</label><input id="c-amb" placeholder="${t('Ex.: Homologação · build 4.19.0')}" value="${esc(d.ambiente)}"></div>
        <div class="field"><label for="c-tst">${t('Quem testa')}</label><input id="c-tst" placeholder="${t('Seu nome')}" value="${esc(d.testadora)}"></div>
        <div class="field"><label for="c-dur">${t('Duração planejada')}</label>
          <div class="dur-in"><input id="c-dur" type="number" inputmode="numeric" min="1" max="480" step="1" value="${d.plannedMin}" aria-describedby="c-dur-err"><span>${t('minutos')}</span></div>
          <p class="msg-erro" id="c-dur-err" hidden>${t('Use um tempo entre 1 e 480 minutos.')}</p>
        </div>
        <div class="form-actions">
          <div class="form-err" id="form-err" role="alert" hidden></div>
          <button class="btn primary lg" type="submit">${t('Iniciar sessão')}</button>
        </div>
      </div>
    </form>
  </section>`;
}

/* ---------- tela: sessão em campo ---------- */
let noteType = 'bug', filter = 'all', pendingImgs = [], heurIdx = Math.floor(Math.random()*HEUR.length), confirmDel = null;
function viewSession(s){
  return `<section class="session">
    <aside class="side">
      <div class="card timer">
        <div class="eyebrow">${t('Tempo de sessão')} ${s.status==='paused'?`<span class="paused-tag">${t('pausada')}</span>`:''}</div>
        <div class="clock" id="clock">${fmtClock(elapsed(s))}</div>
        <div class="clock-sub" id="clock-sub"></div>
        <div class="bar" id="bar"><i style="width:0"></i></div>
        <div class="timer-actions">
          <button class="btn" data-act="toggle">${s.status==='running'?t('Pausar'):t('Retomar')}</button>
          <button class="btn end" data-act="end">${t('Encerrar')}</button>
        </div>
        <div id="end-confirm" hidden style="margin-top:12px;font-size:14px">
          ${t('Encerrar e ir para o relatório?')}
          <div class="timer-actions" style="margin-top:8px"><button class="btn" data-act="end-no">${t('Continuar')}</button><button class="btn end" data-act="end-yes">${t('Sim, encerrar')}</button></div>
        </div>
      </div>
      <div class="card charter-card">
        <div class="eyebrow">Charter</div>
        <div class="area">${esc(s.area)}</div>
        <p>${charterHtml(s.charter)}.</p>
        <div class="meta">${s.ambiente?`<span class="chip">${esc(s.ambiente)}</span>`:''}${s.testadora?`<span class="chip">${esc(s.testadora)}</span>`:''}<span class="chip">${s.plannedMin} min</span></div>
      </div>
      ${EXT ? `<div class="card captura${s.status==='running'?'':' pausada'}" id="captura">${capturaHtml(s)}</div>` : ''}
      <div class="card heur" id="heur">${heurHtml()}</div>
    </aside>
    <div style="display:grid;gap:14px;min-width:0">
      <div class="composer">
        <div class="types" role="group" aria-label="${t('Tipo da nota')}">
          ${TYPE_ORDER.map(k=>`<button type="button" class="type ${TYPES[k].cls}" data-type="${k}" aria-pressed="${noteType===k}"><i></i>${rot(k)}<kbd>Alt+${TYPES[k].key}</kbd></button>`).join('')}
        </div>
        <label for="note-in" class="eyebrow" style="position:absolute;left:-9999px">${t('Nota')}</label>
        <textarea id="note-in" placeholder="${t('O que você viu? Cole um print aqui com Ctrl+V.')}"></textarea>
        <div class="thumbs" id="thumbs">${thumbsHtml()}</div>
        <div class="composer-foot">
          <span class="hint">${t('Ctrl+Enter salva · Alt+1 a 5 troca o tipo')}</span>
          <label class="btn ghost file-lbl">${t('Anexar print')}<input type="file" id="file-in" accept="image/*" multiple></label>
          <button class="btn primary" data-act="add-note">${t('Registrar nota')}</button>
        </div>
      </div>
      <div class="log-head">
        <div><div class="eyebrow">${t('Diário da sessão')}</div><h2 style="font-size:20px">${s.notes.length===1?t('1 nota'):t('{n} notas',{n:s.notes.length})}</h2></div>
        <div class="filters" role="group" aria-label="${t('Filtrar notas')}">
          <button data-filter="all" aria-pressed="${filter==='all'}">${t('todas')}</button>
          <button data-filter="rev" aria-pressed="${filter==='rev'}">${t('a revisar')} ${pendentes(s).length}</button>
          ${TYPE_ORDER.map(k=>{const n=counts(s)[k]; return `<button data-filter="${k}" aria-pressed="${filter===k}">${rot(k).toLowerCase()} ${n}</button>`;}).join('')}
        </div>
      </div>
      <div class="log-wrap"><div class="log" id="log">${logHtml(s)}</div></div>
    </div>
  </section>`;
}
function heurHtml(){
  const h=HEUR[heurIdx];
  return `<div class="heur-head"><span class="eyebrow">${t('Travou? Tente isto')}</span><button class="link-btn" data-act="heur">${t('Outra ideia ↻')}</button></div>
    <div class="cat">${esc(t(h.cat))}</div><h3>${esc(t(h.t))}</h3><p>${esc(t(h.p))}</p>`;
}
function thumbsHtml(){ return pendingImgs.map((src,i)=>`<div class="thumb"><img src="${esc(src)}" alt="${t('Print anexado {n}',{n:i+1})}"><button data-rmimg="${i}" aria-label="${t('Remover print')}">×</button></div>`).join(''); }
function logHtml(s){
  const notes = s.notes.filter(n=>filter==='all'||(filter==='rev'?n.pending:(!n.pending&&n.type===filter))).slice().reverse();
  if(!notes.length) return `<div style="padding:28px 4px;color:var(--muted);text-align:center">${s.notes.length?(filter==='rev'?t('Nada para revisar.'):t('Nenhuma nota desse tipo.')):t('Sua primeira nota aparece aqui. Comece pelo que chamou sua atenção nos primeiros minutos.')}</div>`;
  const vis = paginaDe('log',notes);
  return (filter==='rev'?loteHtml(s,vis):'') + vis.map(noteHtml).join('') + pagerHtml('log',notes.length);
}
// Paginação das listas de notas, para não virar uma página gigante.
const POR_PAGINA = 5, pagina = {log:0, rev:0}, selecionadas = new Set();
function paginaDe(k,lista){
  const ult=Math.max(0,Math.ceil(lista.length/POR_PAGINA)-1);
  if(pagina[k]>ult) pagina[k]=ult;
  return lista.slice(pagina[k]*POR_PAGINA,(pagina[k]+1)*POR_PAGINA);
}
function pagerHtml(k,total){
  const n=Math.ceil(total/POR_PAGINA); if(n<=1) return '';
  const p=pagina[k];
  return `<div class="pager"><button class="btn ghost" data-pag="${k}" data-arg="${p-1}" ${p===0?'disabled':''}>${t('← Anteriores')}</button>
    <span class="mono">${t('{p} de {n} · {total} notas',{p:p+1,n,total})}</span>
    <button class="btn ghost" data-pag="${k}" data-arg="${p+1}" ${p>=n-1?'disabled':''}>${t('Próximas →')}</button></div>`;
}
// Barra de confirmação em lote para as notas automáticas.
function loteHtml(s,vis){
  const pend=pendentes(s), ids=new Set(pend.map(n=>n.id));
  [...selecionadas].forEach(id=>{ if(!ids.has(id)) selecionadas.delete(id); });
  const daPag=vis.filter(n=>n.pending), todasPag=daPag.length&&daPag.every(n=>selecionadas.has(n.id));
  return `<div class="lote">
    <label><input type="checkbox" data-selpag="${daPag.map(n=>n.id).join(',')}" ${todasPag?'checked':''}> ${t('Selecionar desta página')}</label>
    <span class="lote-btns"><button class="btn" data-act="ok-sel" ${selecionadas.size?'':'disabled'}>${t('Confirmar selecionadas ({n})',{n:selecionadas.size})}</button>
    <button class="btn primary" data-act="ok-todas">${t('Confirmar todas ({n})',{n:pend.length})}</button></span></div>`;
}
// Passos para reproduzir: as ações registradas (cliques, campos, páginas e marcações) até o minuto da nota.
const ORIGEM_PASSO = ['clique','campo','pagina','marca'];
function passosAte(s, n){
  const ehPasso = x => x.auto && (x.origem ? ORIGEM_PASSO.includes(x.origem) : x.type==='obs');
  const lista = s.notes.slice(0, s.notes.indexOf(n)+1).filter(ehPasso).slice(-8);
  if(!lista.length) return '';
  return t('Passos para reproduzir:')+'\n' + lista.map((x,i)=>`${i+1}. ${(x.passo||x.text).replace(/\n+/g,' ')}`).join('\n');
}
// Nota com ações de revisar, editar e excluir. Usada no diário da sessão e no relatório.
let editId = null;
function noteHtml(n){
  const tag = n.auto ? `<span class="tag-auto${n.pending?'':' revisada'}">${n.pending?t('auto · a revisar'):t('automática')}</span>` : '';
  const corpo = editId===n.id
    ? `<div class="edit-box">
        <div class="types" role="group" aria-label="${t('Tipo da nota editada')}">${TYPE_ORDER.map(k=>`<button type="button" class="type ${TYPES[k].cls}" data-edtype="${k}" aria-pressed="${n.type===k}"><i></i>${rot(k)}</button>`).join('')}</div>
        <label for="edit-in" style="position:absolute;left:-9999px">${t('Texto da nota')}</label>
        <textarea id="edit-in">${esc(n.text)}</textarea>
        <div class="edit-foot">${temPassos(n.text)?'':`<button class="btn ghost" data-passos="${n.id}">${t('Incluir passos para reproduzir')}</button>`}<button class="btn ghost" data-cancel-edit>${t('Cancelar')}</button><button class="btn primary" data-saveedit="${n.id}">${n.pending?t('Salvar e confirmar'):t('Salvar')}</button></div>
      </div>`
    : `<p class="txt">${esc(n.text)}</p>${n.url?`<p class="url">${esc(n.url)}</p>`:''}
      ${n.imgs&&n.imgs.length?`<div class="imgs">${n.imgs.filter(imgOk).map(src=>`<img src="${esc(src)}" alt="${t('Print da nota')}">`).join('')}</div>`:''}
      <div class="note-actions">${confirmDel===n.id?`<button class="confirm" data-delnote="${n.id}" data-sure="1">${t('Confirmar exclusão')}</button><button data-cancel-del>${t('Cancelar')}</button>`
        :`${n.pending?`<button class="ok" data-oknote="${n.id}">${t('Confirmar')}</button>`:''}${n.type==='bug'&&!n.pending?`<button data-copybug="${n.id}">${t('Copiar bug')}</button>`:''}<button data-editnote="${n.id}">${t('Editar')}</button><button data-delnote="${n.id}">${t('Excluir')}</button>`}</div>`;
  return `<article class="note ${TYPES[n.type].cls}${n.pending?' pendente':''}" data-note="${n.id}">
    <div class="t">${n.pending?`<input type="checkbox" class="sel" data-sel="${n.id}" aria-label="${t('Selecionar nota')}" ${selecionadas.has(n.id)?'checked':''}> `:''}${fmtT(n.t)}</div>
    <div style="min-width:0"><div class="kind"><i></i>${rot(n.type)} ${tag}</div>${corpo}</div></article>`;
}

/* ---------- captura automática (só na extensão) ---------- */
let abasInfo = [], modoNavegador = false;
function capturaHtml(s){
  const extras = `<p class="hint" style="margin:6px 0 0">${t('<kbd>Alt+Shift+M</kbd> no sistema em teste marca o momento com print.')}</p>`;
  if(modoNavegador) return `<div class="eyebrow">${t('Captura automática · navegador de teste')}</div>
    <p class="hint" style="margin:6px 0 0">${s.status==='running'?t('Todas as abas deste navegador são acompanhadas: cliques, campos preenchidos, páginas abertas, erros de JavaScript e falhas de rede viram notas a revisar.'):t('Sessão pausada: nada está sendo registrado.')} ${t('O que você digita nunca é guardado.')}</p>${extras}`;
  return `<div class="eyebrow">${t('Captura automática')}</div>
    <p class="hint" style="margin:6px 0 0">${s.status==='running'?t('Cliques, campos preenchidos, páginas abertas, erros de JavaScript e falhas de rede nas abas abaixo viram notas a revisar.'):t('Sessão pausada: nada está sendo registrado.')} ${t('O que você digita nunca é guardado.')}</p>
    <div class="abas">${abasInfo.length?abasInfo.map(a=>`<div class="aba"><i></i><span title="${esc(a.url)}">${esc(a.title||a.url)}</span><button class="link-btn" data-parar="${a.id}">${t('Parar')}</button></div>`).join(''):`<p class="hint" style="margin:0">${t('Nenhuma aba acompanhada ainda.')}</p>`}</div>
    <button class="btn" data-act="acompanhar">${t('Acompanhar a aba atual')}</button>${extras}`;
}
async function atualizaAbas(){
  if(!EXT) return;
  const { abas = [] } = await chrome.storage.session.get('abas');
  abasInfo = (await Promise.all(abas.map(id=>chrome.tabs.get(id).catch(()=>null)))).filter(Boolean);
  const c=$('#captura'), s=getActive(); if(c&&s) c.innerHTML=capturaHtml(s);
}
function syncCaptura(){
  if(!EXT) return;
  const s=getActive();
  chrome.runtime.sendMessage({cmd:'capturando', valor: !!(s && s.status==='running')}).catch(()=>{});
}
async function acompanharAbaAtual({auto=false}={}){
  if(!auto){
    // O pedido precisa sair direto do clique, antes de qualquer outra espera.
    const acesso = await chrome.permissions.request({origins:['<all_urls>']}).catch(()=>false);
    if(!acesso){ toast(t('Sem acesso aos sites, o QA Scout não consegue registrar cliques e prints dessa aba.')); return; }
  }
  const [tab] = await chrome.tabs.query({active:true, lastFocusedWindow:true});
  if(!tab || !/^https?:|^file:/.test(tab.url||'')){ toast(auto?t('Captura ligada. Abra o sistema em teste e clique em “Acompanhar a aba atual”.'):t('Abra a página do sistema em teste e clique de novo.')); return; }
  const r = await chrome.runtime.sendMessage({cmd:'acompanhar', tabId:tab.id}).catch(()=>null);
  if(!r || !r.ok){ toast(t('O navegador não deixa acompanhar essa aba.')); return; }
  toast(auto?t('Captura automática ligada em “{aba}”.',{aba:(tab.title||tab.url).slice(0,40)}):t('Aba acompanhada. Pode explorar.'));
  atualizaAbas();
}
// Desenha um anel no ponto clicado e reduz o print para o mesmo tamanho dos prints colados.
function anotaPrint(ev){
  return new Promise(res=>{
    const img=new Image();
    img.onload=()=>{
      const max=1100, k=Math.min(1,max/Math.max(img.width,img.height));
      const cv=document.createElement('canvas'); cv.width=Math.round(img.width*k); cv.height=Math.round(img.height*k);
      const g=cv.getContext('2d'); g.drawImage(img,0,0,cv.width,cv.height);
      if(ev.vw && ev.x!=null){
        const sx=cv.width/ev.vw, x=ev.x*sx, y=ev.y*(cv.height/ev.vh), r=Math.max(14,22*sx);
        g.lineWidth=Math.max(3,4*sx); g.strokeStyle='rgba(201,127,18,.95)'; g.fillStyle='rgba(240,174,72,.22)';
        g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fill(); g.stroke();
      }
      res(cv.toDataURL('image/jpeg',.72));
    };
    img.onerror=()=>res(null);
    img.src=ev.img;
  });
}
let drenando=false, drenarDeNovo=false;
function contaRepeticao(n, mais){
  n.vezes=(n.vezes||1)+mais;
  const marca=` (×${n.vezes})`;
  n.text = / \(×\d+\)$/.test(n.text) ? n.text.replace(/ \(×\d+\)$/, marca) : n.text+marca;
}
async function drenar(){
  if(!EXT) return;
  if(drenando){ drenarDeNovo=true; return; }
  drenando=true;
  try{
    const tudo = await chrome.storage.local.get(null);
    const chaves = Object.keys(tudo).filter(k=>k.startsWith(EV_PREFIX)).sort();
    if(!chaves.length) return;
    const s=getActive();
    if(s){
      for(const k of chaves){
        const ev=tudo[k];
        // Erro ou falha de rede repetida: soma na nota que já existe em vez de criar outra.
        const igual = ev.chave && s.notes.find(n=>n.chave===ev.chave);
        if(igual){ contaRepeticao(igual, ev.vezes||1); continue; }
        const img = ev.img ? await anotaPrint(ev) : null;
        const t=Math.max(0, elapsed(s)-(Date.now()-ev.ts));
        const lugar = ev.tipo==='pagina' ? '' : (ev.titulo ? ` · ${ev.titulo.slice(0,60)}` : '');
        const nota={id:uid(),type:ev.nota||'obs',t,text:ev.desc+lugar,passo:ev.desc,origem:ev.tipo,url:ev.url||'',imgs:img?[img]:[],auto:true,pending:true};
        if(ev.chave){ nota.chave=ev.chave; nota.vezes=1; if((ev.vezes||1)>1) contaRepeticao(nota, ev.vezes-1); }
        s.notes.push(nota);
      }
      s.notes.sort((a,b)=>a.t-b.t);
      save();
      if(view==='active' && $('#log') && !editId){ $('#log').innerHTML=logHtml(s); refreshSessionCounts(s); }
    }
    await chrome.storage.local.remove(chaves);
  } finally {
    drenando=false;
    if(drenarDeNovo){ drenarDeNovo=false; drenar(); }
  }
}
function sessaoDaTela(){ return view==='report' ? state.sessions.find(x=>x.id===viewArg) : getActive(); }
function atualizaNotas(s){
  if(view==='report'){ const y=window.scrollY; render(); window.scrollTo(0,y); return; }
  $('#log').innerHTML=logHtml(s); refreshSessionCounts(s);
}

/* ---------- tela: relatório ---------- */

/* ---------- relatório para imprimir / PDF ---------- */
// Documento próprio para impressão: claro, em A4, com as cores dos tipos forçadas (print-color-adjust).
const LOGO_DOC = `<svg viewBox="0 0 64 64" width="34" height="34" aria-hidden="true"><circle cx="32" cy="32" r="31" fill="#0F2B33"/><circle cx="32" cy="32" r="25" fill="none" stroke="#296F82" stroke-width="4.3"/><circle cx="32" cy="32" r="15" fill="none" stroke="#1B4E5C" stroke-width="2.6"/><path d="M32 12 L38.5 32 L32 52 L25.5 32 Z" fill="#06171C" opacity=".75" transform="translate(1.8 2.4) rotate(40 32 32)"/><g transform="rotate(40 32 32)"><path d="M32 12 L38.5 32 L32 52 L25.5 32 Z" fill="#296F82"/><path d="M32 32 L38.5 32 L32 52 Z" fill="#8AE3D7"/></g></svg>`;
function docImpressao(s){
  const c=counts(s), db=s.debrief||{}, notas=s.notes.filter(n=>!n.pending);
  const real=Math.round(s.elapsedMs/MIN);
  const cor={bug:'#E0354F',duv:'#1688C4',ide:'#B97E00',ris:'#7247E0',obs:'#0E9F6E'};
  const meta=[[t('Data'),fmtDate(s.startedAt)],[t('Duração'),t('{real} de {plan} min',{real,plan:s.plannedMin})],[t('Ambiente'),s.ambiente||'—'],[t('Quem testou'),s.testadora||'—'],[t('Navegador'),s.navegador||'—']];
  const grupos=TYPE_ORDER.filter(k=>c[k]).map(k=>`<section class="doc-grupo" style="--c:${cor[k]}">
      <h3><span>${plural(k)}</span><b>${c[k]}</b></h3>
      ${notas.filter(n=>n.type===k).map(n=>`<div class="doc-nota"><time>${fmtT(n.t)}</time><div><p>${esc(n.text)}</p>${n.url?`<small>${esc(n.url)}</small>`:''}${n.imgs&&n.imgs.length?`<div class="doc-imgs">${n.imgs.filter(imgOk).map(src=>`<img src="${esc(src)}" alt="">`).join('')}</div>`:''}</div></div>`).join('')}
    </section>`).join('') || `<p class="doc-vazio">${t('Nenhuma nota registrada nessa sessão.')}</p>`;
  return `<article class="doc" aria-hidden="true">
    <header class="doc-topo">${LOGO_DOC}<div><b>QA Scout</b><span>${t('Relatório de sessão exploratória')}</span></div><div class="doc-data">${fmtDate(s.startedAt)}</div></header>
    <h1>${esc(s.area)}</h1>
    <div class="doc-charter"><span>Charter</span><p>${charterHtml(s.charter)}.</p></div>
    <dl class="doc-meta">${meta.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <div class="doc-kpis">${TYPE_ORDER.map(k=>`<div style="--c:${cor[k]}"><b>${c[k]}</b><span>${c[k]===1?rot(k):plural(k)}</span></div>`).join('')}</div>
    ${db.test!=null?`<section class="doc-tbs"><h2>${t('Divisão do tempo (TBS)')}</h2><div class="doc-barra"><i style="width:${db.test}%;background:#0E9F6E"></i><i style="width:${db.bug}%;background:#E0354F"></i><i style="width:${db.setup}%;background:#C98A00"></i></div>
      <ul><li><i style="background:#0E9F6E"></i>${t('Teste')} ${db.test}%</li><li><i style="background:#E0354F"></i>${t('Bug')} ${db.bug}%</li><li><i style="background:#C98A00"></i>${t('Setup')} ${db.setup}%</li></ul></section>`:''}
    <h2 class="doc-sec">${t('Notas da sessão')}</h2>
    ${grupos}
    ${db.coverage||db.next?`<div class="doc-fim">${db.coverage?`<div><h2>${t('Áreas cobertas')}</h2><p>${esc(db.coverage)}</p></div>`:''}${db.next?`<div><h2>${t('Próximas sessões')}</h2><p>${esc(db.next)}</p></div>`:''}</div>`:''}
    <footer class="doc-rodape">${t('Gerado com QA Scout · teste exploratório baseado em sessões')}</footer>
  </article>`;
}

function viewReport(s){
  if(!s) return `<div class="empty">${t('Sessão não encontrada.')} <button class="link-btn" data-go="home">${t('Voltar')}</button></div>`;
  const c=counts(s), db=s.debrief||(s.debrief={test:60,bug:25,setup:15,coverage:'',next:''});
  const real=Math.round(s.elapsedMs/MIN);
  return `<section class="view">
    <div class="no-print"><button class="link-btn" data-go="home">${t('← Todas as sessões')}</button></div>
    <div class="report">
      <div class="panel" style="min-width:0">
        <div class="report-head">
          <div style="min-width:0">
            <div class="eyebrow">${t('Relatório de sessão')} · ${fmtDate(s.startedAt)}${s.example?' · '+t('exemplo'):''}</div>
            <h1 style="margin-top:8px">${esc(s.area)}</h1>
          </div>
          <div class="dur">${t('{real} de {plan} min',{real,plan:s.plannedMin})}<br>${esc(s.ambiente||'')}</div>
        </div>
        <p class="charter-line">${charterHtml(s.charter)}.</p>
        <div class="kpis">${TYPE_ORDER.map(k=>`<div class="kpi ${TYPES[k].cls}"><b>${c[k]}</b><span>${c[k]===1?rot(k):plural(k)}</span></div>`).join('')}</div>
        ${pendentes(s).length?`<div class="revisar no-print" id="revisar"><h3>${pendentes(s).length} ${pendentes(s).length===1?t('nota automática para revisar'):t('notas automáticas para revisar')}</h3>
          <p class="hint" style="margin:0 0 6px">${t('Elas só entram no relatório e no Markdown depois de confirmadas. Edite o texto ou o tipo se não for observação.')}</p>
          ${(vis=>loteHtml(s,vis)+`<div class="rev-lista">${vis.map(noteHtml).join('')}</div>`)(paginaDe('rev',pendentes(s)))}${pagerHtml('rev',pendentes(s).length)}</div>`:''}
        ${TYPE_ORDER.filter(k=>c[k]).map(k=>`<div class="group ${TYPES[k].cls}"><h3><i></i>${plural(k)}</h3>
          ${s.notes.filter(n=>n.type===k&&!n.pending).map(n=>`<div class="note ${TYPES[k].cls}" style="padding:10px 0"><div class="t">${fmtT(n.t)}</div><div style="min-width:0"><p class="txt" style="margin:0">${esc(n.text)}</p>${n.imgs&&n.imgs.length?`<div class="imgs">${n.imgs.filter(imgOk).map(src=>`<img src="${esc(src)}" alt="${t('Print da nota')}">`).join('')}</div>`:''}${k==='bug'?`<div class="note-actions no-print"><button data-copybug="${n.id}">${t('Copiar bug')}</button></div>`:''}</div></div>`).join('')}
        </div>`).join('') || `<p class="hint">${t('Nenhuma nota registrada nessa sessão.')}</p>`}
      </div>
      <aside style="display:grid;gap:16px;min-width:0">
        <div class="card debrief">
          <div class="eyebrow">Debriefing</div>
          <h3 style="font-size:17px;margin:4px 0 2px">${t('Como o tempo foi dividido?')}</h3>
          <p class="hint" style="margin:0">${t('Teste, investigação de bug e preparo (TBS).')} <button class="ajuda" data-go="metodo" data-arg="debriefing">${t('Como fazer um bom debriefing?')}</button></p>
          <div class="tbs" id="tbs-bar">${tbsBar(db)}</div>
          <div class="tbs-legend">
            ${[['test','Teste','var(--accent)'],['bug','Bug','var(--t-bug)'],['setup','Setup','var(--marker)']].map(([k,l,col])=>`<div class="slider"><label for="tbs-${k}"><span class="sw" style="background:${col}"></span>${t(l)}</label><input type="range" id="tbs-${k}" min="0" max="100" step="5" value="${db[k]}" data-tbs="${k}"><span class="mono" id="tbs-${k}-v">${db[k]}%</span></div>`).join('')}
          </div>
          <div class="field" style="margin:16px 0 10px"><label for="db-cov">${t('Áreas cobertas')}</label><textarea id="db-cov" data-db="coverage" placeholder="${t('O que de fato foi explorado')}">${esc(db.coverage)}</textarea></div>
          <div class="field" style="margin:0"><label for="db-next">${t('Fora do escopo e próximas sessões')}</label><textarea id="db-next" data-db="next" placeholder="${t('O que ficou para depois')}">${esc(db.next)}</textarea></div>
        </div>
        <div class="card">
          <div class="eyebrow">${t('Compartilhar')}</div>
          <h3 style="font-size:17px;margin:4px 0 10px">${t('Relatório em Markdown')}</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
            <button class="btn primary" data-act="copy-md">${t('Copiar Markdown')}</button>
            <button class="btn" data-act="copy-bugs">${t('Copiar só os bugs')}</button>
            ${CAN_PRINT?`<button class="btn" data-act="print">${t('Salvar em PDF')}</button>`:''}
          </div>
          <label for="md-out" style="position:absolute;left:-9999px">${t('Prévia do Markdown')}</label>
          <textarea class="md" id="md-out" readonly>${esc(toMarkdown(s))}</textarea>
          <p class="hint" style="margin:8px 0 0">${t('Funciona colado no Jira, no GitHub, no Notion ou no Slack.')}</p>
        </div>
        <div class="no-print" style="display:flex;gap:8px;justify-content:flex-end" id="del-wrap">
          <button class="btn ghost danger" data-act="del-session">${t('Excluir sessão')}</button>
        </div>
      </aside>
    </div>
  ${docImpressao(s)}
  </section>`;
}
function tbsBar(db){ const tot=(db.test+db.bug+db.setup)||1; return `<i style="width:${db.test/tot*100}%;background:var(--accent)"></i><i style="width:${db.bug/tot*100}%;background:var(--t-bug)"></i><i style="width:${db.setup/tot*100}%;background:var(--marker)"></i>`; }
// Texto digitado vai para o Markdown como texto: HTML, links e marcadores de bloco no início da linha
// são escapados, para o relatório não mudar de forma no GitHub ou no Jira.
const mdEsc = l => l.replace(/[\\`[\]|]/g,'\\$&').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const mdInline = t => mdEsc(String(t??'').replace(/\s*\n\s*/g,' '));
const mdBloco = (t, recuo='') => String(t??'').split(/\n+/).map(l=>mdEsc(l).replace(/^(\s*)(\d+)([.)])(?=\s|$)/,'$1$2\\$3').replace(/^(\s*)([#+*-])(?=\s|$)/,'$1\\$2')).join('  \n'+recuo);
function toMarkdown(s, onlyBugs=false){
  const c=counts(s), db=s.debrief||{};
  s={...s, notes:s.notes.filter(n=>!n.pending)};
  const line = n => `- \`${fmtT(n.t)}\` ${mdBloco(n.text,'  ')}${n.imgs&&n.imgs.length?` _(${n.imgs.length===1?t('1 print'):t('{n} prints',{n:n.imgs.length})})_`:''}`;
  if(onlyBugs){
    return `## ${t('Bugs')} · ${mdInline(s.area)}\n_${fmtDate(s.startedAt)} · ${mdInline(s.ambiente)||t('ambiente não informado')}_\n\n` + (s.notes.filter(n=>n.type==='bug').map(line).join('\n') || `_${t('Nenhum bug registrado.')}_`);
  }
  let md = `# ${t('Sessão exploratória')} · ${mdInline(s.area)}\n\n`;
  md += `**Charter:** ${mdInline(charterText(s.charter))}.\n\n`;
  md += `| | |\n|---|---|\n| ${t('Data')} | ${fmtDate(s.startedAt)} |\n| ${t('Ambiente')} | ${mdInline(s.ambiente)||'-'} |\n| ${t('Quem testou')} | ${mdInline(s.testadora)||'-'} |\n| ${t('Duração')} | ${t('{real} de {plan} min',{real:Math.round(s.elapsedMs/MIN),plan:s.plannedMin})} |\n`;
  if(db.test!=null) md += `| ${t('Divisão do tempo')} | ${t('Teste')} ${db.test}% · ${t('Bug')} ${db.bug}% · ${t('Setup')} ${db.setup}% |\n`;
  md += `\n**${t('Resumo:')}** ${TYPE_ORDER.map(k=>`${c[k]} ${(c[k]===1?rot(k):plural(k)).toLowerCase()}`).join(', ')}.\n`;
  TYPE_ORDER.forEach(k=>{ const ns=s.notes.filter(n=>n.type===k); if(ns.length) md += `\n## ${plural(k)}\n${ns.map(line).join('\n')}\n`; });
  if(db.coverage) md += `\n## ${t('Áreas cobertas')}\n${db.coverage}\n`;
  if(db.next) md += `\n## ${t('Fora do escopo e próximas sessões')}\n${db.next}\n`;
  md += `\n---\n_${t('Gerado com QA Scout')}_`;
  return md;
}

/* ---------- bug pronto para o Jira ou GitHub ---------- */
function navegadorAtual(){
  const ua=navigator.userAgent, m=ua.match(/(Edg|OPR|Firefox|Chrome|Version)\/(\d+)/);
  const nome = !m ? t('Navegador') : m[1]==='Edg' ? 'Edge' : m[1]==='OPR' ? 'Opera' : m[1]==='Version' ? 'Safari' : m[1];
  const so = /Windows/.test(ua)?'Windows':/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)?'iOS':/Mac OS/.test(ua)?'macOS':/Linux/.test(ua)?'Linux':'';
  return `${nome}${m?' '+m[2]:''}${so?' · '+so:''} · ${t('tela')} ${screen.width}×${screen.height}`;
}
// "Passos para reproduzir:" pode estar em qualquer idioma (a nota pode ter sido escrita antes da troca).
const marcasPassos = () => todasVersoes('Passos para reproduzir:');
const temPassos = txt => marcasPassos().some(m=>txt.includes(m));
const separaPassos = txt => { for(const m of marcasPassos()){ const i=txt.indexOf(m); if(i>=0) return [txt.slice(0,i), txt.slice(i+m.length)]; } return [txt,'']; };
function bugMarkdown(s,n){
  const [obtido, passosTxt=''] = separaPassos(n.text);
  const descricao = obtido.trim() || t('Bug sem descrição');
  const titulo = descricao.split('\n')[0].slice(0,90);
  const passos = (passosTxt.trim() || separaPassos(passosAte(s,n))[1].trim() || '1. ').trim();
  const erros = s.notes.filter(x=>x!==n && (x.origem==='erro'||x.origem==='rede') && Math.abs(x.t-n.t)<=60000);
  let md = `## ${mdInline(titulo)}\n\n`;
  md += `| | |\n|---|---|\n| ${t('Sessão')} | ${mdInline(s.area)} · ${t('{data}, aos {tempo}',{data:fmtDate(s.startedAt),tempo:fmtT(n.t)})} |\n| ${t('Ambiente')} | ${mdInline(s.ambiente)||'-'} |\n| ${t('Navegador')} | ${s.navegador||navegadorAtual()} |\n`;
  if(n.url) md += `| ${t('Página')} | ${n.url} |\n`;
  md += `\n### ${t('Passos para reproduzir')}\n${passos}\n`;
  md += `\n### ${t('Resultado obtido')}\n${mdBloco(descricao)}\n`;
  md += `\n### ${t('Resultado esperado')}\n_${t('Descreva o comportamento esperado.')}_\n`;
  if(erros.length) md += `\n### ${t('Erros de console e rede no mesmo minuto')}\n${erros.map(x=>`- \`${fmtT(x.t)}\` ${mdInline(x.passo||x.text)}`).join('\n')}\n`;
  if(n.imgs&&n.imgs.length) md += `\n### ${t('Evidências')}\n${n.imgs.length===1?t('1 print na nota do QA Scout. Anexe ao ticket.'):t('{n} prints na nota do QA Scout. Anexe ao ticket.',{n:n.imgs.length})}\n`;
  md += `\n---\n_${t('Registrado com QA Scout · charter:')} ${mdInline(charterText(s.charter))}_`;
  return md;
}

/* ---------- backup das sessões ---------- */
function baixarBackup(){
  const sessoes = state.sessions.filter(x=>x.status==='done');
  if(!sessoes.length){ toast(t('Nenhuma sessão concluída para salvar.')); return; }
  const dados = {app:'qa-scout', formato:1, exportadoEm:new Date().toISOString(), sessions:sessoes};
  const url = URL.createObjectURL(new Blob([JSON.stringify(dados)],{type:'application/json'}));
  const a = document.createElement('a');
  const d = new Date();
  a.href=url; a.download=`qa-scout-backup-${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast(sessoes.length===1?t('Backup com 1 sessão baixado'):t('Backup com {n} sessões baixado',{n:sessoes.length}));
}
function importarBackup(txt){
  let dados; try{ dados=JSON.parse(txt); }catch(e){ toast(t('Esse arquivo não é um backup do QA Scout.')); return; }
  if(!dados || dados.app!=='qa-scout' || !Array.isArray(dados.sessions)){ toast(t('Esse arquivo não é um backup do QA Scout.')); return; }
  const ids = new Set(state.sessions.map(x=>x.id));
  const validas = dados.sessions.filter(x=>x && x.id && x.charter && Array.isArray(x.notes) && x.status==='done').map(normalizaSessao);
  const novas = validas.filter(x=>!ids.has(x.id));
  if(!novas.length){ toast(validas.length?t('Todas as sessões desse backup já estão aqui.'):t('Nenhuma sessão encontrada no backup.')); return; }
  state.sessions.push(...novas);
  if(!save()){ state.sessions=state.sessions.filter(x=>!novas.includes(x)); return; }
  render();
  const rep = validas.length-novas.length;
  toast((novas.length===1?t('1 sessão importada'):t('{n} sessões importadas',{n:novas.length}))+(rep?' · '+(rep===1?t('1 já existia'):t('{n} já existiam',{n:rep})):''));
}

/* ---------- tela: heurísticas ---------- */
let deckCat = 'Todas', deckIdx = Math.floor(Math.random()*HEUR.length), deckAberto = false, deckGiro = 0;
const CAT_CLS = {Tours:'c-tours',Dados:'c-dados','Interação':'c-inter',Contexto:'c-ctx'};
function deckLista(){ return HEUR.map((h,i)=>({...h,i})).filter(h=>deckCat==='Todas'||h.cat===deckCat); }
function puxarCarta(){
  const l=deckLista(); if(l.length<2){ deckIdx=l[0]?.i??0; return; }
  let n; do{ n=l[Math.floor(Math.random()*l.length)].i; }while(n===deckIdx);
  deckIdx=n; deckGiro++;
}
function cartaHtml(){
  const h=HEUR[deckIdx];
  return `<article class="carta ${CAT_CLS[h.cat]}" data-giro="${deckGiro%2}" aria-live="polite">
    <div class="carta-topo"><span class="cat">${esc(t(h.cat))}</span><span class="carta-n">${deckIdx+1}/${HEUR.length}</span></div>
    <h3>${esc(t(h.t))}</h3>
    <p>${esc(t(h.p))}</p>
    <div class="desafio"><span>${t('Faz isso agora')}</span>${esc(t(DESAFIO[h.t]||''))}</div>
  </article>`;
}
function viewDeck(){
  const cats=['Todas',...new Set(HEUR.map(h=>h.cat))];
  if(!deckLista().some(h=>h.i===deckIdx)) puxarCarta();
  const active=getActive();
  return `<section class="view">
    <div class="sorteio">
      <div class="sorteio-txt">
        <div class="eyebrow">${t('Baralho de ideias · {n} cartas',{n:HEUR.length})}</div>
        <h2>${t('Travou?')} <em>${t('Puxa uma carta.')}</em></h2>
        <p class="hint">${t('Cada carta traz uma heurística e um desafio para fazer agora. Tours inspirados em James Whittaker, mais dados e contextos do dia a dia brasileiro.')}</p>
        <div class="deck-filters" role="group" aria-label="${t('Categoria')}">${cats.map(c=>`<button data-cat="${c}" aria-pressed="${deckCat===c}">${t(c)}</button>`).join('')}</div>
      </div>
      <div class="mesa">
        <div class="monte" aria-hidden="true"><i></i><i></i></div>
        <div id="carta">${cartaHtml()}</div>
        <div class="mesa-acoes">
          <button class="btn primary lg" data-act="puxar">${t('Puxar outra carta')} <kbd>${t('Espaço')}</kbd></button>
          <button class="btn lg" data-act="usar-carta">${active?t('Anotar como ideia na sessão'):t('Começar sessão com esta carta')}</button>
        </div>
      </div>
    </div>
    <div class="section-head" style="margin-top:8px">
      <h2 style="font-size:18px">${t('Todas as cartas')}${deckCat==='Todas'?'':` · ${esc(t(deckCat))}`}</h2>
      <button class="link-btn" data-act="ver-todas" aria-expanded="${deckAberto}">${deckAberto?t('Esconder'):t('Ver todas')}</button>
    </div>
    ${deckAberto?`<div class="deck">${deckLista().map(h=>`<button class="hcard ${CAT_CLS[h.cat]}${h.i===deckIdx?' atual':''}" data-carta="${h.i}"><span class="cat">${esc(t(h.cat))}</span><h3>${esc(t(h.t))}</h3><p>${esc(t(h.p))}</p></button>`).join('')}</div>`:''}
  </section>`;
}
function mostraCarta(){ const c=$('#carta'); if(c) c.innerHTML=cartaHtml(); document.querySelectorAll('[data-carta]').forEach(b=>b.classList.toggle('atual',+b.dataset.carta===deckIdx)); }

/* ---------- tela: método ---------- */
const EXEMPLOS_CHARTER = [
  {area:'Checkout · pagamento com Pix',explorar:'o pagamento com Pix no checkout',com:'QR Code expirado, botão voltar e cupom de desconto',descobrir:'pedidos pagos que ficam pendentes ou cobranças em dobro'},
  {area:'Cadastro · pessoa física',explorar:'o cadastro de pessoa física',com:'CPFs com e sem máscara, colados e com dígito inválido',descobrir:'cadastros aceitos com documento inválido'},
  {area:'Login · recuperação de senha',explorar:'a recuperação de senha',com:'links expirados, duas abas abertas e e-mail com maiúsculas',descobrir:'acessos indevidos ou usuários travados fora da conta'},
  {area:'Relatórios · exportação',explorar:'a exportação de relatórios',com:'períodos longos, filtros combinados e acentos nos nomes',descobrir:'arquivos com dados faltando, cortados ou com encoding errado'}
];
// Método em flashcards: frente com a pergunta, verso com o conteúdo. Clique, Enter ou espaço vira.
const CARTAS_METODO = [
  {id:'sbtm', etapa:'Base', ic:'⏱', titulo:'SBTM', pergunta:'Como prestar contas de um teste exploratório?', cor:'g1',
   autor:'Jonathan e James Bach · 2000', h:'Session-Based Test Management',
   verso:`<p>O exploratório organizado em <b>sessões</b>: blocos de tempo sem interrupção, cada um com uma missão, que terminam num relatório revisável.</p><p>Em vez de contar casos executados, você conta sessões, o que cada uma cobriu e o que revelou.</p>`,
   nota:['No QA Scout','Charter, cronômetro, diário e relatório em cada sessão. Pausa para interrupções reais e histórico com busca.']},
  {id:'charter', etapa:'Antes', ic:'🎯', titulo:'Charter', pergunta:'A missão da sessão em uma frase.', cor:'g2',
   autor:'Elisabeth Hendrickson · Explore It!', h:'Para onde olhar, sem dizer como',
   verso:`<p class="exemplo"><b>Explorar</b> o alvo <b>com</b> recursos, dados ou técnicas <b>para descobrir</b> um tipo de informação.</p><p>Estreito o bastante para caber na sessão, aberto o bastante para a descoberta. Se parece passo a passo, virou caso de teste.</p>`,
   nota:['Dica','No “para descobrir”, pense no risco: o que custaria caro se escapasse? Travou? A aba Heurísticas sugere um charter.']},
  {id:'notas', etapa:'Durante', ic:'📝', titulo:'Notas e heurísticas', pergunta:'O diário da exploração.', cor:'g3',
   autor:'SBTM · James Whittaker', h:'A evidência é o que você anota',
   verso:`<p><b style="color:var(--t-bug)">Bug</b> o que está errado · <b style="color:var(--t-duv)">Dúvida</b> o que precisa de resposta · <b style="color:var(--t-ide)">Ideia</b> o que testar depois · <b style="color:var(--t-ris)">Risco</b> o que pode dar errado · <b style="color:var(--t-obs)">Observação</b> o que vale registrar.</p><p>Heurísticas e os <b>tours</b> de Whittaker são atalhos para gerar ideias de teste.</p>`,
   nota:['No QA Scout','Alt+1 a Alt+5, captura automática com print e baralho com 18 heurísticas.']},
  {id:'debriefing', etapa:'Depois', ic:'💬', titulo:'Debriefing PROOF', pergunta:'A sessão só acaba quando vira conversa.', cor:'g4',
   autor:'Jon Bach · SBTM', h:'Cinco perguntas para fechar',
   verso:`<div class="proof-mini"><b>P</b><b>R</b><b>O</b><b>O</b><b>F</b></div><p><b>Past</b> o que aconteceu · <b>Results</b> o que foi descoberto · <b>Obstacles</b> o que atrapalhou · <b>Outlook</b> o que falta · <b>Feelings</b> como você se sente sobre a qualidade.</p>`,
   nota:['Dica','Faça com outra pessoa do time, de preferência logo depois da sessão.']},
  {id:'tbs', etapa:'Depois', ic:'📊', titulo:'Métricas TBS', pergunta:'Para onde foi o tempo da sessão?', cor:'g5',
   autor:'Jon Bach · SBTM', h:'Teste, Bug e Setup',
   verso:`<div class="tbs-demo"><i style="width:60%;background:var(--t-obs)"></i><i style="width:25%;background:var(--t-bug)"></i><i style="width:15%;background:var(--t-ide)"></i></div><p><b>Teste</b> explorar de fato · <b>Bug</b> investigar e registrar · <b>Setup</b> preparar ambiente e dados.</p><p>Muito setup indica ambiente instável; muito bug, uma área frágil.</p>`,
   nota:['No QA Scout','O debriefing do relatório pede a divisão, somando 100%.']},
  {id:'leituras', etapa:'Para ir além', ic:'📚', titulo:'Leituras', pergunta:'As fontes do método.', cor:'g6',
   autor:'Para ir além', h:'Comece por aqui',
   verso:`<ul class="livros"><li><b>Session-Based Test Management</b> · Jonathan Bach, 2000</li><li><b>Explore It!</b> · Elisabeth Hendrickson, 2013</li><li><b>Exploratory Software Testing</b> · James Whittaker, 2009</li><li><b>Lessons Learned in Software Testing</b> · Kaner, Bach e Pettichord, 2001</li></ul>`},
];
/* ---------- tela: explorar com o Claude (MCP) ---------- */
// Só explica e dá os comandos: o servidor MCP roda no computador da pessoa (qa-scout mcp), não aqui.
const MCP_INSTALAR = 'claude mcp add qa-scout -- npx -y github:azevedothamirest/qa-scout mcp';
const MCP_PEDIDOS = [
  {t:'Sessão com charter', cls:'t-obs', tags:['20 min','checkout'], txt:'Use o QA Scout para uma sessão exploratória de 20 minutos em https://homolog.minhaloja.com: explorar o checkout, com cupons e Pix, para descobrir cobranças erradas. Anote o que encontrar e me mostre o relatório.'},
  {t:'Foco em erros', cls:'t-bug', tags:['15 min','cadastro'], txt:'Com o QA Scout, explore o cadastro de https://homolog.meusistema.com por 15 minutos procurando erros de validação, mensagens confusas e falhas de rede. Use dados de teste e consulte as capturas depois de cada envio.'},
  {t:'Com heurística', cls:'t-ris', tags:['10 min','busca'], txt:'Abra uma sessão do QA Scout em https://homolog.meusistema.com, sorteie uma heurística do baralho e explore a busca por 10 minutos seguindo ela.'},
];
const MCP_FERRAMENTAS = [
  ['Sessão', [['iniciar_sessao','charter, tempo e endereço'],['encerrar_sessao','debriefing e relatório']]],
  ['Navegar', [['ver_pagina','lê a tela atual'],['navegar','abre um endereço'],['clicar','botões e links'],['preencher','campos com dados de teste'],['escolher_opcao','listas']]],
  ['Registrar', [['anotar','bug, dúvida, ideia, risco'],['ver_capturas','erros de JS, console e rede'],['sugerir_heuristica','uma carta do baralho']]],
];
const ICONE_COPIAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
const MCP_DOC = 'https://github.com/azevedothamirest/qa-scout/blob/main/docs/mcp.md';
function viewMcp(){
  const cmd = (txt, rotulo) => `<div class="mcp-cmd"><code>${esc(txt)}</code><button class="btn" type="button" data-copiar="${esc(txt)}" aria-label="${t('Copiar')} ${t(rotulo)}">${t('Copiar')}</button></div>`;
  return `<section class="view mcp">
    <div class="metodo-hero">
      <div class="eyebrow">${t('Com o Claude · MCP')}</div>
      <h1>${t('Explore em dupla')} <em>${t('com o Claude.')}</em></h1>
      <p>${t('Você passa a missão e o Claude conduz a sessão no navegador de teste: lê a tela, clica, preenche, anota o que encontra e devolve o relatório. A captura do QA Scout grava tudo como faria com você, e a sessão fica no seu histórico para revisar.')}</p>
    </div>
    <div class="mcp-aviso" role="note"><b>${t('Roda no terminal do seu computador.')}</b> ${t('O MCP funciona no Claude Code ou no Claude Desktop, com o Node.js 18 ou mais recente instalado.')} ${EXT?t('Esta extensão só explica como usar: quem abre o navegador e conduz a sessão é o comando <code>qa-scout mcp</code>.'):t('Este site só explica como usar: quem abre o navegador e conduz a sessão é o comando <code>qa-scout mcp</code>.')}</div>
    <div class="passos mcp-passos">
      <div class="passo"><h3>${t('Instale no Claude Code')}</h3><p>${t('No terminal, uma vez só:')}</p>${cmd(MCP_INSTALAR,'o comando de instalação')}<small>${t('Claude Desktop: veja o guia')}</small></div>
      <div class="passo"><h3>${t('Confira a conexão')}</h3><p>${t('O <code>qa-scout</code> deve aparecer como conectado.')}</p>${cmd('claude mcp list','o comando de conferência')}<small>${t('Primeira vez: o Chromium é baixado')}</small></div>
      <div class="passo"><h3>${t('Peça a sessão')}</h3><p>${t('Abra o Claude Code e diga o que explorar, com o quê, para descobrir o quê e por quanto tempo.')}</p><small>${t('O charter, como você já faz')}</small></div>
    </div>
    <div class="section-head" style="margin:26px 0 12px"><div><div class="eyebrow">${t('Como pedir')}</div><h2>${t('Exemplos de pedido')}</h2></div></div>
    <div class="mcp-pedidos">${MCP_PEDIDOS.map(p=>`<article class="mcp-pedido ${p.cls}">
        <div class="mcp-pedido-topo"><h3>${t(p.t)}</h3><div class="mcp-tags">${p.tags.map(x=>`<span>${t(x)}</span>`).join('')}</div></div>
        <blockquote>${esc(t(p.txt))}</blockquote>
        <button class="btn mcp-copiar" type="button" data-copiar="${esc(t(p.txt))}" aria-label="${t('Copiar pedido: {nome}',{nome:t(p.t)})}">${ICONE_COPIAR}${t('Copiar pedido')}</button>
      </article>`).join('')}</div>
    <div class="mcp-grade">
      <div class="card"><div class="eyebrow">${t('O que o Claude usa')}</div><h3>${t('Ferramentas')}</h3>
        ${MCP_FERRAMENTAS.map(([g,fs])=>`<div class="mcp-grupo"><span class="mcp-grupo-nome">${t(g)}</span><div class="mcp-chips">${fs.map(([n,d])=>`<div class="mcp-chip"><code>${n}</code><span>${t(d)}</span></div>`).join('')}</div></div>`).join('')}</div>
      <div class="card"><div class="eyebrow">${t('Antes de começar')}</div><h3>${t('Cuidados')}</h3>
        <ul class="mcp-cuidados">
          <li class="t-bug"><i aria-hidden="true">!</i><span>${t('<b>Só ambientes e dados de teste</b>, nunca produção.')}</span></li>
          <li class="t-duv"><i aria-hidden="true">◎</i><span>${t('<b>O Claude lê a tela</b> das páginas que visita, inclusive campos preenchidos. A sessão e os prints ficam só no seu computador.')}</span></li>
          <li class="t-obs"><i aria-hidden="true">✓</i><span>${t('As notas automáticas chegam <span class="tag-auto">a revisar</span>: o julgamento do que importa continua com você.')}</span></li>
          <li class="t-ide"><i aria-hidden="true">≈</i><span>${t('<b>Cada passo lê a tela</b>, então sessões de 10 a 30 minutos rendem mais e gastam menos tokens.')}</span></li>
        </ul></div>
    </div>
    <a class="btn mcp-guia" href="${MCP_DOC}" target="_blank" rel="noopener">${t('Guia completo do MCP no GitHub ↗')}</a>
  </section>`;
}

function viewMetodo(){
  return `<section class="view">
    <div class="metodo-hero">
      <div class="eyebrow">${t('Método · {n} cartas',{n:CARTAS_METODO.length})}</div>
      <h1>${t('Exploratório não é')} <em>${t('teste sem plano.')}</em></h1>
      <p>${t('É aprender, projetar e executar ao mesmo tempo, com foco e com registro. Vire as cartas para conhecer cada prática.')}</p>
    </div>
    <nav class="trilha-pills" aria-label="${t('Etapas do método')}">${CARTAS_METODO.map(c=>`<button type="button" data-virar="${c.id}"><b>${t(c.etapa)}</b> ${t(c.titulo)}</button>`).join('')}</nav>
    <div class="flashcards">
      ${CARTAS_METODO.map((c,i)=>`<div class="fc ${c.cor}" id="m-${c.id}" role="button" tabindex="0" aria-pressed="false" aria-label="${t(c.titulo)}: ${t(c.pergunta)} ${t('Clique para virar.')}">
        <div class="fc-in">
          <div class="fc-face fc-frente" aria-hidden="false"><span class="fc-num">${String(i+1).padStart(2,'0')}</span><span class="fc-etapa">${t(c.etapa)}</span><span class="fc-ic" aria-hidden="true">${c.ic}</span><h2>${t(c.titulo)}</h2><p>${t(c.pergunta)}</p><span class="fc-vira">${t('↻ Virar carta')}</span></div>
          <div class="fc-face fc-verso" aria-hidden="true"><span class="fc-volta">${t('↻ voltar')}</span><div class="fc-autor">${t(c.autor)}</div><h3>${t(c.h)}</h3>${t(c.verso)}${c.nota?`<div class="fc-nota"><b>${t(c.nota[0])}</b>${t(c.nota[1])}</div>`:''}</div>
        </div>
      </div>`).join('')}
    </div>
    <p class="hint" style="text-align:center;margin-top:18px">${t('Clique numa carta ou aperte Enter para virar. Quer praticar?')} <button class="link-btn" data-go="deck">${t('Puxe uma carta de heurística →')}</button></p>
  </section>`;
}
function virarCarta(el, forcar){
  if(!el) return;
  const v = forcar ?? el.getAttribute('aria-pressed')!=='true';
  el.setAttribute('aria-pressed', v);
  el.querySelector('.fc-frente').setAttribute('aria-hidden', v);
  el.querySelector('.fc-verso').setAttribute('aria-hidden', !v);
}

/* ---------- cronômetro ---------- */
let tickT=null;
function startTick(){ tick(); tickT=setInterval(tick,250); }
function stopTick(){ clearInterval(tickT); tickT=null; }
function tick(){
  const s=getActive(); if(!s) return;
  const e=elapsed(s), plan=s.plannedMin*MIN;
  const clock=$('#clock'), sub=$('#clock-sub'), bar=$('#bar'); if(!clock) return;
  clock.textContent=fmtClock(e);
  const over=e>plan;
  sub.textContent = over ? t('+{t} além do planejado',{t:fmtClock(e-plan)}) : t('{t} restantes de {plan} min',{t:fmtClock(plan-e),plan:s.plannedMin});
  sub.classList.toggle('over',over); bar.classList.toggle('over',over);
  bar.firstElementChild.style.width = Math.min(100,e/plan*100)+'%';
}

/* ---------- imagens ---------- */
function addImageFile(file){
  if(!file || !file.type.startsWith('image/')) return;
  const r=new FileReader();
  r.onload=()=>{ const img=new Image(); img.onload=()=>{
    const max=1100, k=Math.min(1,max/Math.max(img.width,img.height));
    const cv=document.createElement('canvas'); cv.width=Math.round(img.width*k); cv.height=Math.round(img.height*k);
    cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
    pendingImgs.push(cv.toDataURL('image/jpeg',.72));
    const th=$('#thumbs'); if(th) th.innerHTML=thumbsHtml();
  }; img.src=r.result; };
  r.readAsDataURL(file);
}

/* ---------- ações ---------- */
function addNote(){
  const s=getActive(), inp=$('#note-in'); if(!s||!inp) return;
  let text=inp.value.trim();
  // Prefixos de comando em todos os idiomas: /bug, /duvida, /question, /pregunta...
  const m=text.match(/^\/(bug|duvida|dúvida|ideia|risco|obs|question|idea|risk|note|pregunta|riesgo|nota)\s+/i);
  let type=noteType;
  if(m){ type={bug:'bug',duvida:'duv','dúvida':'duv',question:'duv',pregunta:'duv',ideia:'ide',idea:'ide',risco:'ris',risk:'ris',riesgo:'ris',obs:'obs',note:'obs',nota:'obs'}[m[1].toLowerCase()]; text=text.slice(m[0].length); }
  if(!text && !pendingImgs.length){ inp.focus(); toast(t('Escreva algo ou anexe um print antes de registrar.')); return; }
  s.notes.push({id:uid(),type,t:elapsed(s),text,imgs:pendingImgs.slice()});
  pendingImgs=[]; inp.value='';
  if(!save()){ s.notes.pop(); return; }
  filter='all';
  $('#log').innerHTML=logHtml(s); $('#thumbs').innerHTML='';
  refreshSessionCounts(s);
  toast(t('{tipo} às {tempo}',{tipo:registrado(type),tempo:fmtT(s.notes[s.notes.length-1].t)}));
  inp.focus();
}
function refreshSessionCounts(s){
  const h=$('.log-head h2'); if(h) h.textContent=s.notes.length===1?t('1 nota'):t('{n} notas',{n:s.notes.length});
  const c=counts(s);
  document.querySelectorAll('[data-filter]').forEach(b=>{ const k=b.dataset.filter; b.setAttribute('aria-pressed',filter===k);
    if(k==='rev') b.textContent=`${t('a revisar')} ${pendentes(s).length}`; else if(k!=='all') b.textContent=`${rot(k).toLowerCase()} ${c[k]}`; });
}
function setType(k){ noteType=k; document.querySelectorAll('[data-type]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.type===k)); }

function readDraft(){
  const g=id=>($('#'+id)?.value||'').trim();
  return {explorar:g('c-exp'),com:g('c-com'),descobrir:g('c-des'),area:g('c-area'),ambiente:g('c-amb'),testadora:g('c-tst'),plannedMin:Number(g('c-dur'))||0};
}

document.addEventListener('click',e=>{
  const fc=e.target.closest('.fc'); if(fc && !e.target.closest('button,a')){ virarCarta(fc); return; }
  const bt=e.target.closest('button,[data-open]'); if(!bt) return;
  if(bt.dataset.go){ if(view==='new') { state.draft=readDraft(); save(); } go(bt.dataset.go==='active' && !getActive() ? 'new' : bt.dataset.go, bt.dataset.arg||null); return; }
  if(bt.dataset.open){ go('report',bt.dataset.open); return; }
  if(bt.dataset.copiar){ copy(bt.dataset.copiar,t('Copiado')); return; }
  if(bt.dataset.type){ setType(bt.dataset.type); $('#note-in')?.focus(); return; }
  if(bt.dataset.pag){ pagina[bt.dataset.pag]=+bt.dataset.arg; atualizaNotas(sessaoDaTela()); (bt.dataset.pag==='rev'?$('#revisar'):$('#log'))?.scrollIntoView({block:'start'}); return; }
  if(bt.dataset.act==='ok-todas'||bt.dataset.act==='ok-sel'){
    const s=sessaoDaTela(), alvo=s.notes.filter(n=>n.pending&&(bt.dataset.act==='ok-todas'||selecionadas.has(n.id)));
    alvo.forEach(n=>{ n.pending=false; selecionadas.delete(n.id); });
    save(); atualizaNotas(s); toast(alvo.length===1?t('1 observação confirmada'):t('{n} observações confirmadas',{n:alvo.length})); return;
  }
  if(bt.dataset.filter){ filter=bt.dataset.filter; pagina.log=0; const s=getActive(); $('#log').innerHTML=logHtml(s); refreshSessionCounts(s); return; }
  if(bt.dataset.cat){ deckCat=bt.dataset.cat; puxarCarta(); render(); return; }
  if(bt.dataset.carta){ deckIdx=+bt.dataset.carta; deckGiro++; mostraCarta(); $('#carta').scrollIntoView({block:'center',behavior:'smooth'}); return; }
  if(bt.dataset.rmimg!=null){ pendingImgs.splice(+bt.dataset.rmimg,1); $('#thumbs').innerHTML=thumbsHtml(); return; }
  if(bt.hasAttribute('data-cancel-del')){ confirmDel=null; atualizaNotas(sessaoDaTela()); return; }
  if(bt.dataset.delnote){
    const s=sessaoDaTela();
    if(bt.dataset.sure){ s.notes=s.notes.filter(n=>n.id!==bt.dataset.delnote); confirmDel=null; save(); toast(t('Nota excluída')); }
    else confirmDel=bt.dataset.delnote;
    atualizaNotas(s); return;
  }
  if(bt.dataset.oknote){
    const s=sessaoDaTela(), n=s.notes.find(x=>x.id===bt.dataset.oknote);
    if(n){ n.pending=false; save(); atualizaNotas(s); toast(t('Observação confirmada')); }
    return;
  }
  if(bt.dataset.editnote){ editId=bt.dataset.editnote; confirmDel=null; atualizaNotas(sessaoDaTela()); const ed=$('#edit-in'); if(ed){ ed.focus(); ed.setSelectionRange(ed.value.length,ed.value.length); } return; }
  if(bt.dataset.edtype){ bt.parentElement.querySelectorAll('[data-edtype]').forEach(b=>b.setAttribute('aria-pressed',b===bt)); return; }
  if(bt.dataset.copybug){
    const s=sessaoDaTela(), n=s&&s.notes.find(x=>x.id===bt.dataset.copybug);
    if(n) copy(bugMarkdown(s,n),t('Bug copiado. É só colar no Jira ou no GitHub.'));
    return;
  }
  if(bt.dataset.passos){
    const s=sessaoDaTela(), n=s.notes.find(x=>x.id===bt.dataset.passos), ed=$('#edit-in'), p=passosAte(s,n);
    if(!p){ toast(t('Nenhum clique ou página registrado até essa nota.')); return; }
    ed.value = ed.value.replace(/\s+$/,'') + (ed.value.trim()?'\n\n':'') + p;
    bt.remove(); ed.focus(); return;
  }
  if(bt.hasAttribute('data-cancel-edit')){ editId=null; atualizaNotas(sessaoDaTela()); return; }
  if(bt.dataset.saveedit){
    const s=sessaoDaTela(), n=s.notes.find(x=>x.id===bt.dataset.saveedit), box=bt.closest('.edit-box');
    const text=$('#edit-in').value.trim(), tipo=box.querySelector('[data-edtype][aria-pressed="true"]')?.dataset.edtype || n.type;
    if(!text && !(n.imgs&&n.imgs.length)){ toast(t('A nota precisa de texto ou de um print.')); return; }
    n.text=text; n.type=tipo; n.pending=false; editId=null; save(); atualizaNotas(s);
    toast(t(SALVO[tipo])); return;
  }
  if(bt.dataset.parar){ chrome.runtime.sendMessage({cmd:'parar', tabId:+bt.dataset.parar}).then(atualizaAbas); return; }
  if(bt.dataset.virar){ const c=document.getElementById('m-'+bt.dataset.virar); virarCarta(c,true); c.scrollIntoView({block:'center',behavior:'smooth'}); return; }
  const act=bt.dataset.act; if(!act) return;
  const s=getActive();
  if(act==='add-note') addNote();
  if(act==='acompanhar') acompanharAbaAtual();
  if(act==='puxar'){ puxarCarta(); mostraCarta(); }
  if(act==='exemplo-charter'){
    const ex=EXEMPLOS_CHARTER[Math.floor(Math.random()*EXEMPLOS_CHARTER.length)];
    [['c-exp',ex.explorar],['c-com',ex.com],['c-des',ex.descobrir],['c-area',ex.area]].forEach(([id,v])=>{ const el=$('#'+id); if(el) el.value=t(v); });
    toast(t('Exemplo preenchido. Ajuste para o seu sistema.'));
  }
  if(act==='ver-todas'){ deckAberto=!deckAberto; render(); }
  if(act==='usar-carta'){
    const h=HEUR[deckIdx], nome=t(h.t), d=t(DESAFIO[h.t]);
    if(s){ s.notes.push({id:uid(),type:'ide',t:elapsed(s),text:t('Heurística “{nome}”: {desafio}',{nome,desafio:d}),imgs:[]}); save(); toast(t('Carta anotada como ideia na sessão')); }
    else { state.draft={...(state.draft||{explorar:'',descobrir:'',area:'',ambiente:'',testadora:'',plannedMin:60}),com:t('a heurística “{nome}” ({desafio})',{nome,desafio:d.charAt(0).toLowerCase()+d.slice(1).replace(/\.$/,'')})}; save(); go('new'); }
  }
  if(act==='heur'){ heurIdx=(heurIdx+1+Math.floor(Math.random()*(HEUR.length-1)))%HEUR.length; $('#heur').innerHTML=heurHtml(); }
  if(act==='toggle' && s){
    if(s.status==='running'){ s.elapsedMs+=Date.now()-s.runStartedAt; s.runStartedAt=null; s.status='paused'; }
    else { s.runStartedAt=Date.now(); s.status='running'; }
    save(); render();
  }
  if(act==='end'){ $('#end-confirm').hidden=false; }
  if(act==='end-no'){ $('#end-confirm').hidden=true; }
  if(act==='end-yes' && s){
    if(s.status==='running'){ s.elapsedMs+=Date.now()-s.runStartedAt; }
    s.runStartedAt=null; s.status='done'; s.endedAt=Date.now(); state.activeId=null; save();
    pendingImgs=[]; go('report',s.id); toast(t('Sessão encerrada. Faça o debriefing enquanto está fresco.'));
  }
  if(act==='print') salvarPdf();
  if(act==='backup') baixarBackup();
  if(act==='clear-ex'){ state.sessions=state.sessions.filter(x=>!x.example); save(); render(); toast(t('Exemplos removidos')); }
  if(act==='copy-md' || act==='copy-bugs'){ const rs=state.sessions.find(x=>x.id===viewArg); copy(toMarkdown(rs,act==='copy-bugs'), act==='copy-md'?t('Relatório copiado'):t('Bugs copiados'), $('#md-out')); }
  if(act==='del-session'){ $('#del-wrap').innerHTML=`<span class="hint" style="margin-right:auto;align-self:center">${t('Excluir de vez?')}</span><button class="btn" data-act="del-no">${t('Cancelar')}</button><button class="btn danger" data-act="del-yes">${t('Excluir')}</button>`; }
  if(act==='del-no'){ $('#del-wrap').innerHTML=`<button class="btn ghost danger" data-act="del-session">${t('Excluir sessão')}</button>`; }
  if(act==='del-yes'){ state.sessions=state.sessions.filter(x=>x.id!==viewArg); save(); go('home'); toast(t('Sessão excluída')); }
});

document.addEventListener('submit',e=>{
  if(e.target.id!=='charter-form') return;
  e.preventDefault();
  const d=readDraft();
  const faltam=[['c-exp',!d.explorar],['c-des',!d.descobrir],['c-dur',!(Number.isInteger(d.plannedMin)&&d.plannedMin>=1&&d.plannedMin<=480)]];
  faltam.forEach(([id,erro])=>marcaErro(id,erro));
  const erros=faltam.filter(([,e])=>e);
  if(erros.length){
    const box=$('#form-err');
    box.innerHTML=`<b>${t('Falta pouco para começar.')}</b> ${!d.explorar||!d.descobrir?t('Preencha o que vai explorar e o que quer descobrir, destacados em vermelho.'):t('Ajuste a duração planejada.')}`;
    box.hidden=false;
    $('#'+erros[0][0]).focus();
    return;
  }
  // Na extensão, a captura começa junto com a sessão: o pedido de acesso precisa sair deste clique.
  const pedidoAcesso = EXT && !modoNavegador ? chrome.permissions.request({origins:['<all_urls>']}).catch(()=>false) : null;
  const s={id:uid(),area:d.area||d.explorar,charter:{explorar:d.explorar,com:d.com||t('o que estiver à mão'),descobrir:d.descobrir},ambiente:d.ambiente,testadora:d.testadora,plannedMin:d.plannedMin,navegador:navegadorAtual(),status:'running',startedAt:Date.now(),runStartedAt:Date.now(),elapsedMs:0,notes:[]};
  state.sessions.push(s); state.activeId=s.id; state.draft=null; noteType='bug'; filter='all';
  save(); go('active'); setTimeout(()=>$('#note-in')?.focus(),50);
  if(pedidoAcesso) pedidoAcesso.then(ok=>ok ? acompanharAbaAtual({auto:true}) : toast(t('Sem acesso aos sites, a captura automática fica desligada. Dá para ligar em “Acompanhar a aba atual”.')));
});
function marcaErro(id,erro){
  const el=$('#'+id), msg=$('#'+id+'-err'); if(!el) return;
  el.classList.toggle('invalido',erro); el.setAttribute('aria-invalid',erro);
  if(msg) msg.hidden=!erro;
}

document.addEventListener('input',e=>{
  const bt=e.target;
  if(bt.classList?.contains('invalido') && bt.value.trim()){ marcaErro(bt.id,false); if(!document.querySelector('#charter-form .invalido')) $('#form-err').hidden=true; }
  if(bt.id==='q'){ query=bt.value; const sel=bt.selectionStart; render(); const q=$('#q'); q.focus(); try{q.setSelectionRange(sel,sel);}catch(_){} return; }
  if(bt.dataset.tbs || bt.dataset.db){
    const s=state.sessions.find(x=>x.id===viewArg); if(!s) return;
    if(bt.dataset.tbs){
      const k=bt.dataset.tbs, v=+bt.value; const others=['test','bug','setup'].filter(x=>x!==k);
      const rest=100-v, sumO=s.debrief[others[0]]+s.debrief[others[1]];
      s.debrief[k]=v;
      if(sumO===0){ s.debrief[others[0]]=rest; s.debrief[others[1]]=0; }
      else { const a=Math.round(rest*s.debrief[others[0]]/sumO/5)*5; s.debrief[others[0]]=a; s.debrief[others[1]]=rest-a; }
      ['test','bug','setup'].forEach(x=>{ $('#tbs-'+x).value=s.debrief[x]; $('#tbs-'+x+'-v').textContent=s.debrief[x]+'%'; });
      $('#tbs-bar').innerHTML=tbsBar(s.debrief);
    } else s.debrief[bt.dataset.db]=bt.value;
    $('#md-out').value=toMarkdown(s); save();
  }
});

document.addEventListener('keydown',e=>{
  if(e.target.classList?.contains('fc') && (e.key==='Enter'||e.key===' ')){ e.preventDefault(); virarCarta(e.target); return; }
  if(view==='deck' && e.key===' ' && !e.target.closest?.('input,textarea,button')){ e.preventDefault(); puxarCarta(); mostraCarta(); return; }
  if(view!=='active') return;
  if(e.altKey && !e.ctrlKey && !e.metaKey){ const k=TYPE_ORDER.find(x=>TYPES[x].key===e.key) || TYPE_ORDER[['Digit1','Digit2','Digit3','Digit4','Digit5'].indexOf(e.code)]; if(k){ e.preventDefault(); setType(k); return; } }
  if(e.target.id==='note-in' && e.key==='Enter' && (e.ctrlKey||e.metaKey)){ e.preventDefault(); addNote(); }
});
document.addEventListener('paste',e=>{
  if(view!=='active') return;
  const items=[...(e.clipboardData?.items||[])].filter(i=>i.type.startsWith('image/'));
  if(items.length){ e.preventDefault(); items.forEach(i=>addImageFile(i.getAsFile())); toast(t('Print anexado à nota')); }
});
document.addEventListener('change',e=>{
  if(e.target.id==='file-in'){ [...e.target.files].forEach(addImageFile); e.target.value=''; return; }
  const d=e.target.dataset;
  if(d.sel){ e.target.checked?selecionadas.add(d.sel):selecionadas.delete(d.sel); atualizaNotas(sessaoDaTela()); return; }
  if(d.selpag!=null){ d.selpag.split(',').filter(Boolean).forEach(id=>e.target.checked?selecionadas.add(id):selecionadas.delete(id)); atualizaNotas(sessaoDaTela()); }
  if(e.target.id==='backup-in'){ const f=e.target.files[0]; e.target.value=''; if(f) f.text().then(importarBackup).catch(()=>toast(t('Não foi possível ler o arquivo.'))); }
});

function afterRender(){}
// Idioma: textos fixos do index.html (data-i18n) e menu no cabeçalho. Trocar recarrega a tela, com a abertura, já no idioma novo.
const I18N = window.QAS_I18N;
const PRIVACIDADE = {'pt-BR':'privacidade.html','pt-PT':'privacidade.pt-PT.html',en:'privacidade.en.html',es:'privacidade.es.html'};
function aplicaTextosFixos(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent=t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{ el.title=t(el.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>{ el.setAttribute('aria-label',t(el.dataset.i18nAria)); });
  const pv=$('#link-privacidade'); if(pv) pv.href='https://azevedothamirest.github.io/qa-scout/'+PRIVACIDADE[I18N.atual];
  const tm=$('#link-termos'); if(tm) tm.href='https://azevedothamirest.github.io/qa-scout/'+PRIVACIDADE[I18N.atual].replace('privacidade','termos');
  const atual=I18N.IDIOMAS.find(i=>i.id===I18N.atual);
  const b=$('#idioma'); if(b){ $('#idioma-cod').textContent=atual.curto; b.setAttribute('aria-label',t('Idioma: {nome}. Trocar idioma',{nome:atual.nome})); }
  const menu=$('#idioma-menu');
  if(menu) menu.innerHTML=I18N.IDIOMAS.map(i=>`<li role="none"><button type="button" role="menuitemradio" lang="${i.id}" aria-checked="${i.id===I18N.atual}" data-idioma="${i.id}">${i.nome}<span aria-hidden="true">${i.id===I18N.atual?'✓':''}</span></button></li>`).join('');
}
function menuIdioma(abrir){
  const b=$('#idioma'), menu=$('#idioma-menu'); if(!b||!menu) return;
  menu.hidden=!abrir; b.setAttribute('aria-expanded',abrir);
  if(abrir) (menu.querySelector('[aria-checked="true"]')||menu.querySelector('button')).focus();
}
$('#idioma')?.addEventListener('click',e=>{ e.stopPropagation(); menuIdioma($('#idioma-menu').hidden); });
$('#idioma-menu')?.addEventListener('click',e=>{
  const b=e.target.closest('[data-idioma]'); if(!b) return;
  e.stopPropagation();
  menuIdioma(false);
  if(b.dataset.idioma===I18N.atual){ $('#idioma').focus(); return; }
  I18N.definir(b.dataset.idioma);
  try{ sessionStorage.removeItem('qascout.abertura'); }catch(e){}
  location.reload();
});
$('#idioma-menu')?.addEventListener('keydown',e=>{
  const itens=[...$('#idioma-menu').querySelectorAll('button')], i=itens.indexOf(document.activeElement);
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); itens[(i+(e.key==='ArrowDown'?1:itens.length-1))%itens.length].focus(); }
  if(e.key==='Escape'){ menuIdioma(false); $('#idioma').focus(); }
});
document.addEventListener('click',e=>{ if(!e.target.closest('.idioma')) menuIdioma(false); });
aplicaTextosFixos();

// Tema: segue o sistema até a pessoa escolher; a escolha fica salva neste navegador.
const TEMA_KEY='qascout.tema', escuroSistema=matchMedia('(prefers-color-scheme: dark)');
function temaAtual(){ return document.documentElement.dataset.theme || 'dark'; }
function aplicaTema(tema){
  if(tema) document.documentElement.dataset.theme=tema;
  const escuro=temaAtual()==='dark';
  document.documentElement.toggleAttribute('data-escuro',escuro);
  const b=$('#tema'); if(!b) return;
  b.querySelector('span').textContent=escuro?t('Escuro'):t('Claro');
  b.setAttribute('aria-label',escuro?t('Tema escuro. Mudar para claro'):t('Tema claro. Mudar para escuro'));
}
try{ const salvo=localStorage.getItem(TEMA_KEY); if(salvo==='light'||salvo==='dark') document.documentElement.dataset.theme=salvo; }catch(e){}
aplicaTema();
escuroSistema.addEventListener('change',()=>aplicaTema());
$('#tema')?.addEventListener('click',()=>{
  const novo=temaAtual()==='dark'?'light':'dark';
  aplicaTema(novo);
  try{ localStorage.setItem(TEMA_KEY,novo); }catch(e){}
});

// Abertura: aparece uma vez por visita (por aba), some sozinha em ~5 s e pode ser pulada.
// Não aparece em navegador automatizado, para não atrapalhar os testes.
function abertura(){
  const el=$('#abertura'); if(!el) return;
  const fim=()=>{ el.remove(); document.body.classList.remove('com-abertura'); };
  let vista=false; try{ vista=sessionStorage.getItem('qascout.abertura')==='1'; sessionStorage.setItem('qascout.abertura','1'); }catch(e){}
  if(vista || navigator.webdriver){ fim(); return; }
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let saiu=false;
  const sair=()=>{ if(saiu) return; saiu=true; el.classList.add('saindo'); setTimeout(fim, calmo?300:1300); };
  const t=setTimeout(sair, calmo?1500:6500);
  el.addEventListener('click',()=>{ clearTimeout(t); sair(); });
  addEventListener('keydown',e=>{ if(e.key==='Escape'){ clearTimeout(t); sair(); } },{once:true});
}
abertura();

// O painel lateral do Chrome não abre a janela de impressão: na extensão, o relatório abre numa aba
// própria (index.html#imprimir=<id>) e a impressão sai de lá.
function salvarPdf(){
  if(EXT && viewArg){ chrome.tabs.create({url:chrome.runtime.getURL('index.html')+'#imprimir='+viewArg}); return; }
  window.print();
}
// Outra aba (ou a aba de impressão) salvou: adota o estado novo sem perder o que está sendo digitado.
function adotarEstado(novo){
  if(!estadoValido(novo) || novo._aba===ABA_ID) return;
  const campos=[...document.querySelectorAll('textarea[id],input[id]')].filter(el=>el.type!=='file'&&el.type!=='range').map(el=>[el.id,el.value]);
  const foco=document.activeElement?.id, sel=foco && document.activeElement.selectionStart!=null ? [document.activeElement.selectionStart,document.activeElement.selectionEnd] : null;
  state=novo;
  if(view==='active' && !getActive()) view='home';
  render();
  campos.forEach(([id,v])=>{ const el=document.getElementById(id); if(el && !el.readOnly && el.value!==v) el.value=v; });
  if(foco){ const el=document.getElementById(foco); if(el){ el.focus(); if(sel) try{ el.setSelectionRange(...sel); }catch(e){} } }
}
if(!EXT) addEventListener('storage',e=>{ if(e.key===KEY && e.newValue) try{ adotarEstado(JSON.parse(e.newValue)); }catch(err){} });

async function init(){
  if(EXT){
    try{
      const r=await chrome.storage.local.get([KEY,'qascout.modo']);
      if(r[KEY] && estadoValido(r[KEY])) state=r[KEY];
      else if(r[KEY]){ corrompido=true; await chrome.storage.local.set({[KEY+'.corrompido']:r[KEY]}); }
      modoNavegador = r['qascout.modo']==='navegador';
    }catch(e){}
    chrome.storage.onChanged.addListener((mud,area)=>{
      if(area==='local' && mud[KEY]?.newValue) adotarEstado(mud[KEY].newValue);
      if(area==='local' && Object.keys(mud).some(k=>k.startsWith(EV_PREFIX) && mud[k].newValue)) drenar();
      if(area==='session' && mud.abas) atualizaAbas();
    });
  }
  const imprimir = location.hash.match(/^#imprimir=(.+)$/);
  if(imprimir && state.sessions.some(x=>x.id===imprimir[1])){
    view='report'; viewArg=imprimir[1]; render();
    document.title=`${t('Relatório')} · ${state.sessions.find(x=>x.id===viewArg).area} · QA Scout`;
    setTimeout(()=>window.print(),600);
    return;
  }
  if(getActive()) view='active';
  render();
  if(corrompido) toast(t('Não foi possível ler as sessões salvas. Guardamos uma cópia e começamos do zero; importe um backup se tiver.'));
  if(EXT){ atualizaAbas(); drenar(); }
}
init();
})();
