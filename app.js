(() => {
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
  return {id:'ex-pix',example:true,area:'Checkout · pagamento com Pix',
    charter:{explorar:'o pagamento com Pix no checkout',com:'expiração do QR Code, botão voltar e pedidos com cupom',descobrir:'pedidos pagos que ficam pendentes ou cobranças em dobro'},
    ambiente:'Homologação · build 4.18.2',testadora:'Thamires',plannedMin:60,status:'done',startedAt:start,endedAt:start+57*MIN,elapsedMs:54*MIN,
    notes:[
      {id:'n1',type:'obs',t:3*MIN+12000,text:'QR Code gerado em ~2s. Tempo de expiração exibido: 15 min.'},
      {id:'n2',type:'bug',t:11*MIN+40000,text:'Com cupom de 10%, voltar da tela do QR Code e gerar de novo aplica o desconto duas vezes (R$ 90,00 → R$ 81,00).'},
      {id:'n3',type:'duv',t:18*MIN+5000,text:'Depois que o QR expira, o pedido deve ser cancelado ou continuar aguardando pagamento? Critério não cita.'},
      {id:'n4',type:'ris',t:26*MIN+51000,text:'Webhook de confirmação chega antes do pedido ser salvo quando o pagamento é muito rápido. Pode gerar pedido pago marcado como pendente.'},
      {id:'n5',type:'bug',t:34*MIN+2000,text:'Mensagem "Erro inesperado" ao copiar o código Pix no Safari iOS. Cópia funciona, mas o toast de erro aparece.'},
      {id:'n6',type:'ide',t:41*MIN+30000,text:'Sessão futura: explorar estorno de Pix parcial no painel administrativo.'},
      {id:'n7',type:'obs',t:49*MIN+15000,text:'Com rede 3G, a tela de confirmação demora ~8s sem indicador de carregamento.'}
    ],
    debrief:{test:55,bug:30,setup:15,coverage:'Geração e cópia do QR Code, expiração, cupom com Pix, voltar do navegador.',next:'Estorno parcial, Pix agendado, pedidos acima de R$ 5.000.'}};
}
function ex2(){
  const start = new Date('2026-10-07T10:30:00-03:00').getTime();
  return {id:'ex-cpf',example:true,area:'Cadastro PF · validação de CPF',
    charter:{explorar:'o cadastro de pessoa física',com:'CPFs com e sem máscara, colados e com dígito inválido',descobrir:'cadastros aceitos com documento inválido'},
    ambiente:'Staging · web',testadora:'Thamires',plannedMin:30,status:'done',startedAt:start,endedAt:start+33*MIN,elapsedMs:31*MIN,
    notes:[
      {id:'m1',type:'bug',t:6*MIN,text:'CPF 111.111.111-11 é aceito como válido.'},
      {id:'m2',type:'obs',t:12*MIN+20000,text:'Colar CPF com espaço no final bloqueia o botão Continuar sem nenhuma mensagem.'},
      {id:'m3',type:'duv',t:19*MIN,text:'Menor de idade pode se cadastrar? Data de nascimento não é validada.'},
      {id:'m4',type:'ide',t:27*MIN+45000,text:'Automatizar a tabela de CPFs inválidos em Playwright com teste parametrizado.'}
    ],
    debrief:{test:70,bug:20,setup:10,coverage:'Campo CPF, máscara, cola e mensagens de validação.',next:'Data de nascimento e e-mail duplicado.'}};
}

/* ---------- armazenamento ---------- */
const KEY = 'qascout.v1';
// Dentro da extensão, o estado vai para chrome.storage.local (sem o limite de ~5 MB do localStorage,
// que estouraria com os prints automáticos).
const EXT = (()=>{ try{ return !!(window.chrome && chrome.runtime && chrome.runtime.id && chrome.storage); }catch(e){ return false; } })();
const EV_PREFIX = 'qascout.ev.';
function fresh(){ return {sessions:[ex1(),ex2()],activeId:null,draft:null}; }
function load(){
  if(EXT) return fresh();
  try{ const raw = localStorage.getItem(KEY); if(raw){ return JSON.parse(raw); } }catch(e){}
  return fresh();
}
let state = load();
let storageOk = true, warned = false;
if(!EXT){ try{ localStorage.setItem(KEY+'.t','1'); localStorage.removeItem(KEY+'.t'); }catch(e){ storageOk = false; } }
function save(){
  if(EXT){ chrome.storage.local.set({[KEY]:state}).catch(()=>toast('Não foi possível salvar a sessão.')); return true; }
  if(!storageOk){ if(!warned){ warned=true; toast('Este navegador não permite salvar. A sessão fica só nesta aba.'); } return true; }
  try{ localStorage.setItem(KEY, JSON.stringify(state)); return true; }
  catch(e){ toast('Espaço do navegador cheio. Remova alguns prints e tente de novo.'); return false; }
}

/* ---------- utilidades ---------- */
const $ = (s,el=document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Math.random().toString(36).slice(2,10);
const pad = n => String(n).padStart(2,'0');
function fmtClock(ms){ const s=Math.max(0,Math.floor(ms/1000)); const h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return h? `${h}:${pad(m)}:${pad(x)}` : `${pad(m)}:${pad(x)}`; }
function fmtT(ms){ const s=Math.floor(ms/1000); return `${pad(Math.floor(s/60))}:${pad(s%60)}`; }
const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
function fmtDate(ts){ const d=new Date(ts); return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }
function elapsed(s){ return s.elapsedMs + (s.status==='running' && s.runStartedAt ? Date.now()-s.runStartedAt : 0); }
function counts(s){ const c={bug:0,duv:0,ide:0,ris:0,obs:0}; s.notes.forEach(n=>{ if(!n.pending) c[n.type]++; }); return c; }
function pendentes(s){ return s.notes.filter(n=>n.pending); }
function charterText(c){ return `Explorar ${c.explorar} com ${c.com} para descobrir ${c.descobrir}`; }
function getActive(){ return state.sessions.find(s=>s.id===state.activeId && s.status!=='done') || null; }
let toastT;
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2600); }
async function copy(text, okMsg, fallbackEl){
  try{ await navigator.clipboard.writeText(text); toast(okMsg); }
  catch(e){ if(fallbackEl){ fallbackEl.focus(); fallbackEl.select(); } toast('Texto selecionado. Use Ctrl+C para copiar.'); }
}

/* ---------- roteamento ---------- */
let view = 'home', viewArg = null;
function go(v,arg=null){
  view=v; viewArg=arg; render();
  const alvo = v==='metodo' && arg ? document.getElementById('m-'+arg) : null;
  if(alvo) alvo.scrollIntoView({block:'start'}); else window.scrollTo({top:0});
}
// Concordância dos avisos: "Bug registrado", "Dúvida registrada".
const FEM = {duv:true, ide:true, obs:true};
function registrado(k){ return `${TYPES[k].label} ${FEM[k]?'registrada':'registrado'}`; }

function render(){
  const active = getActive();
  ['home','active','deck','metodo'].forEach(k=>{
    const b=$('#tab-'+k);
    const cur = (k==='home' && (view==='home'||view==='report')) || (k==='active' && (view==='active'||view==='new')) || k===view;
    b.setAttribute('aria-current', cur ? 'page':'false');
  });
  $('#tab-active').innerHTML = active ? '<span class="live"></span>Em campo' : 'Nova sessão';
  stopTick();
  syncCaptura();
  const app = $('#app');
  if(view==='home') app.innerHTML = viewHome();
  else if(view==='new') app.innerHTML = viewNew();
  else if(view==='active'){ if(!active){ view='new'; app.innerHTML = viewNew(); } else { app.innerHTML = viewSession(active); startTick(); } }
  else if(view==='report') app.innerHTML = viewReport(state.sessions.find(s=>s.id===viewArg));
  else if(view==='deck') app.innerHTML = viewDeck();
  else if(view==='metodo') app.innerHTML = viewMetodo();
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
    ${active ? `<div class="banner"><p><b>Sessão em andamento:</b> ${esc(active.area)} · ${fmtClock(elapsed(active))}${active.status==='paused'?' (pausada)':''}</p><button class="btn primary" data-go="active">Voltar para a sessão</button></div>`:''}
    <div class="hero">
      <div>
        <div class="eyebrow">Teste exploratório baseado em sessões</div>
        <h1 style="margin-top:10px">Explore com missão.<br><em>Volte com evidência.</em></h1>
        <p>Defina o charter, ligue o cronômetro e anote bugs, dúvidas e riscos no ritmo da exploração. No fim, o relatório da sessão sai pronto para o time.</p>
        <div class="hero-actions">
          <button class="btn primary lg" data-go="${active?'active':'new'}">${active?'Continuar sessão':'Começar nova sessão'}</button>
          <button class="btn lg ghost" data-go="deck">Ver heurísticas</button>
        </div>
      </div>
      <div class="stats" aria-label="Resumo das sessões">
        <div class="stat"><b>${done.length}</b><span>sessões concluídas</span></div>
        <div class="stat"><b>${totMin}<small style="font-size:15px"> min</small></b><span>explorando</span></div>
        <div class="stat"><b style="color:var(--t-bug)">${bugs}</b><span>bugs encontrados</span></div>
        <div class="stat"><b style="color:var(--t-duv)">${duv}</b><span>dúvidas levantadas</span></div>
      </div>
    </div>
    <div>
      <div class="section-head" style="margin-bottom:12px"><div><div class="eyebrow">Como funciona</div><h2>Uma sessão em 3 passos</h2></div><button class="link-btn" data-go="metodo">Entenda o método →</button></div>
      <div class="passos">
        <div class="passo"><h3>Escreva o charter</h3><p>Uma missão curta: o que explorar, com o quê e para descobrir o quê.</p><small>Elisabeth Hendrickson</small></div>
        <div class="passo"><h3>Explore com tempo marcado</h3><p>30, 60 ou 90 minutos sem interrupção. Anote bugs, dúvidas, ideias e riscos na hora.</p><small>SBTM · James e Jon Bach</small></div>
        <div class="passo"><h3>Faça o debriefing</h3><p>Revise as notas, divida o tempo entre teste, bug e setup e leve o relatório para o time.</p><small>PROOF e métricas TBS</small></div>
      </div>
    </div>
    ${!EXT ? `<div class="captura-promo">
      <div><h3>Quer que ele anote sozinho?</h3><p>Rode o comando abaixo: abre um navegador de teste em que cada clique vira observação com print.</p>
      <code>npx github:azevedothamirest/qa-scout https://seu-sistema</code></div>
      <a class="btn" href="https://github.com/azevedothamirest/qa-scout/blob/main/docs/tutorial.md" target="_blank" rel="noopener">Ver tutorial ↗</a>
    </div>` : ''}
    <div class="section-head">
      <div><div class="eyebrow">Histórico</div><h2>Sessões anteriores</h2></div>
      <div class="backup"><button class="btn ghost" data-act="backup">Baixar backup</button><label class="btn ghost file-lbl">Importar backup<input type="file" id="backup-in" accept="application/json,.json"></label></div>
      <label class="search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="q" type="search" placeholder="Buscar por área, charter ou nota" value="${esc(query)}" aria-label="Buscar sessões"></label>
    </div>
    <div class="list" id="list">
      ${list.length ? list.map(rowHtml).join('') : `<div class="empty">${q?'Nenhuma sessão encontrada para essa busca.':'Nenhuma sessão ainda. Comece a primeira e ela aparece aqui.'}</div>`}
    </div>
    ${hasEx ? `<div class="banner"><p>As sessões marcadas como <b>exemplo</b> mostram como o app funciona. Remova quando quiser começar do zero.</p><button class="btn" data-act="clear-ex">Remover exemplos</button></div>`:''}
  </section>`;
}
function rowHtml(s){
  const d=new Date(s.startedAt), c=counts(s);
  return `<button class="row" data-open="${s.id}">
    <div class="date"><b>${pad(d.getDate())}</b>${MESES[d.getMonth()]}</div>
    <div style="min-width:0"><h3>${esc(s.area)}${s.example?'<span class="tag-ex">exemplo</span>':''}</h3><p>${esc(charterText(s.charter))}</p></div>
    <div class="chips">
      <span class="chip">${Math.round(s.elapsedMs/MIN)}/${s.plannedMin} min</span>
      ${['bug','duv','ris'].filter(k=>c[k]).map(k=>`<span class="chip ${TYPES[k].cls}" style="color:var(--c)"><i></i><span style="color:var(--ink)">${c[k]} ${c[k]>1?PLURAL[k].toLowerCase():TYPES[k].label.toLowerCase()}</span></span>`).join('')}
    </div>
  </button>`;
}

/* ---------- tela: novo charter ---------- */
function viewNew(){
  const d = state.draft || {explorar:'',com:'',descobrir:'',area:'',ambiente:'',testadora:'',plannedMin:60};
  return `<section class="view">
    <div class="section-head">
      <div><div class="eyebrow">Nova sessão</div><h2 style="font-size:28px;margin-top:6px">Escreva o charter da sessão</h2></div>
      <div style="display:flex;gap:14px;align-items:center"><button class="ajuda" type="button" data-go="metodo" data-arg="charter">Por que charter?</button><button class="btn" type="button" data-act="exemplo-charter">Usar um exemplo</button></div>
    </div>
    <form class="panel form-grid" id="charter-form" novalidate>
      <div class="charter-sentence">
        <label for="c-exp">Explorar</label>
        <textarea id="c-exp" rows="1" placeholder="o que você vai testar" required>${esc(d.explorar)}</textarea>
        <label for="c-com">com</label>
        <textarea id="c-com" rows="1" placeholder="quais recursos, dados ou técnicas">${esc(d.com)}</textarea>
        <label for="c-des">para descobrir</label>
        <textarea id="c-des" rows="1" placeholder="que tipo de informação ou problema">${esc(d.descobrir)}</textarea>
        <p class="hint" style="font-family:var(--f-body);font-size:13.5px;margin:4px 0 0">Modelo de charter de Elisabeth Hendrickson. Uma missão clara mantém a sessão focada sem virar roteiro.</p>
      </div>
      <div>
        <div class="field"><label for="c-area">Área ou funcionalidade</label><input id="c-area" placeholder="Ex.: Checkout · pagamento com cartão" value="${esc(d.area)}"></div>
        <div class="field"><label for="c-amb">Ambiente e versão</label><input id="c-amb" placeholder="Ex.: Homologação · build 4.19.0" value="${esc(d.ambiente)}"></div>
        <div class="field"><label for="c-tst">Quem testa</label><input id="c-tst" placeholder="Seu nome" value="${esc(d.testadora)}"></div>
        <div class="field"><span style="font-weight:600;font-size:13.5px">Duração planejada</span>
          <div class="seg" role="group" aria-label="Duração planejada">
            ${[[30,'curta'],[60,'normal'],[90,'longa']].map(([m,l])=>`<button type="button" data-dur="${m}" aria-pressed="${d.plannedMin===m}">${m} min<small>${l}</small></button>`).join('')}
          </div>
        </div>
        <div class="form-actions">
          <span class="hint" id="form-err" role="alert"></span>
          <button class="btn primary lg" type="submit">Iniciar sessão</button>
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
        <div class="eyebrow">Tempo de sessão ${s.status==='paused'?'<span class="paused-tag">pausada</span>':''}</div>
        <div class="clock" id="clock">${fmtClock(elapsed(s))}</div>
        <div class="clock-sub" id="clock-sub"></div>
        <div class="bar" id="bar"><i style="width:0"></i></div>
        <div class="timer-actions">
          <button class="btn" data-act="toggle">${s.status==='running'?'Pausar':'Retomar'}</button>
          <button class="btn end" data-act="end">Encerrar</button>
        </div>
        <div id="end-confirm" hidden style="margin-top:12px;font-size:14px">
          Encerrar e ir para o relatório?
          <div class="timer-actions" style="margin-top:8px"><button class="btn" data-act="end-no">Continuar</button><button class="btn end" data-act="end-yes">Sim, encerrar</button></div>
        </div>
      </div>
      <div class="card charter-card">
        <div class="eyebrow">Charter</div>
        <div class="area">${esc(s.area)}</div>
        <p>Explorar <b>${esc(s.charter.explorar)}</b> com <b>${esc(s.charter.com)}</b> para descobrir <b>${esc(s.charter.descobrir)}</b>.</p>
        <div class="meta">${s.ambiente?`<span class="chip">${esc(s.ambiente)}</span>`:''}${s.testadora?`<span class="chip">${esc(s.testadora)}</span>`:''}<span class="chip">${s.plannedMin} min</span></div>
      </div>
      ${EXT ? `<div class="card captura${s.status==='running'?'':' pausada'}" id="captura">${capturaHtml(s)}</div>` : ''}
      <div class="card heur" id="heur">${heurHtml()}</div>
    </aside>
    <div style="display:grid;gap:14px;min-width:0">
      <div class="composer">
        <div class="types" role="group" aria-label="Tipo da nota">
          ${TYPE_ORDER.map(k=>`<button type="button" class="type ${TYPES[k].cls}" data-type="${k}" aria-pressed="${noteType===k}"><i></i>${TYPES[k].label}<kbd>Alt+${TYPES[k].key}</kbd></button>`).join('')}
        </div>
        <label for="note-in" class="eyebrow" style="position:absolute;left:-9999px">Nota</label>
        <textarea id="note-in" placeholder="O que você viu? Cole um print aqui com Ctrl+V."></textarea>
        <div class="thumbs" id="thumbs">${thumbsHtml()}</div>
        <div class="composer-foot">
          <span class="hint">Ctrl+Enter salva · Alt+1 a 5 troca o tipo</span>
          <label class="btn ghost file-lbl">Anexar print<input type="file" id="file-in" accept="image/*" multiple></label>
          <button class="btn primary" data-act="add-note">Registrar nota</button>
        </div>
      </div>
      <div class="log-head">
        <div><div class="eyebrow">Diário da sessão</div><h2 style="font-size:20px">${s.notes.length} ${s.notes.length===1?'nota':'notas'}</h2></div>
        <div class="filters" role="group" aria-label="Filtrar notas">
          <button data-filter="all" aria-pressed="${filter==='all'}">todas</button>
          <button data-filter="rev" aria-pressed="${filter==='rev'}">a revisar ${pendentes(s).length}</button>
          ${TYPE_ORDER.map(k=>{const n=counts(s)[k]; return `<button data-filter="${k}" aria-pressed="${filter===k}">${TYPES[k].label.toLowerCase()} ${n}</button>`;}).join('')}
        </div>
      </div>
      <div class="log-wrap"><div class="log" id="log">${logHtml(s)}</div></div>
    </div>
  </section>`;
}
function heurHtml(){
  const h=HEUR[heurIdx];
  return `<div class="heur-head"><span class="eyebrow">Travou? Tente isto</span><button class="link-btn" data-act="heur">Outra ideia ↻</button></div>
    <div class="cat">${esc(h.cat)}</div><h3>${esc(h.t)}</h3><p>${esc(h.p)}</p>`;
}
function thumbsHtml(){ return pendingImgs.map((src,i)=>`<div class="thumb"><img src="${src}" alt="Print anexado ${i+1}"><button data-rmimg="${i}" aria-label="Remover print">×</button></div>`).join(''); }
function logHtml(s){
  const notes = s.notes.filter(n=>filter==='all'||(filter==='rev'?n.pending:(!n.pending&&n.type===filter))).slice().reverse();
  if(!notes.length) return `<div style="padding:28px 4px;color:var(--muted);text-align:center">${s.notes.length?(filter==='rev'?'Nada para revisar.':'Nenhuma nota desse tipo.'):'Sua primeira nota aparece aqui. Comece pelo que chamou sua atenção nos primeiros minutos.'}</div>`;
  return notes.map(noteHtml).join('');
}
// Passos para reproduzir: as ações registradas (cliques, campos, páginas e marcações) até o minuto da nota.
const ORIGEM_PASSO = ['clique','campo','pagina','marca'];
function passosAte(s, n){
  const ehPasso = x => x.auto && (x.origem ? ORIGEM_PASSO.includes(x.origem) : x.type==='obs');
  const lista = s.notes.slice(0, s.notes.indexOf(n)+1).filter(ehPasso).slice(-8);
  if(!lista.length) return '';
  return 'Passos para reproduzir:\n' + lista.map((x,i)=>`${i+1}. ${(x.passo||x.text).replace(/\n+/g,' ')}`).join('\n');
}
// Nota com ações de revisar, editar e excluir. Usada no diário da sessão e no relatório.
let editId = null;
function noteHtml(n){
  const tag = n.auto ? `<span class="tag-auto${n.pending?'':' revisada'}">${n.pending?'auto · a revisar':'automática'}</span>` : '';
  const corpo = editId===n.id
    ? `<div class="edit-box">
        <div class="types" role="group" aria-label="Tipo da nota editada">${TYPE_ORDER.map(k=>`<button type="button" class="type ${TYPES[k].cls}" data-edtype="${k}" aria-pressed="${n.type===k}"><i></i>${TYPES[k].label}</button>`).join('')}</div>
        <label for="edit-in" style="position:absolute;left:-9999px">Texto da nota</label>
        <textarea id="edit-in">${esc(n.text)}</textarea>
        <div class="edit-foot">${n.text.includes('Passos para reproduzir:')?'':`<button class="btn ghost" data-passos="${n.id}">Incluir passos para reproduzir</button>`}<button class="btn ghost" data-cancel-edit>Cancelar</button><button class="btn primary" data-saveedit="${n.id}">Salvar${n.pending?' e confirmar':''}</button></div>
      </div>`
    : `<p class="txt">${esc(n.text)}</p>${n.url?`<p class="url">${esc(n.url)}</p>`:''}
      ${n.imgs&&n.imgs.length?`<div class="imgs">${n.imgs.map(src=>`<img src="${src}" alt="Print da nota">`).join('')}</div>`:''}
      <div class="note-actions">${confirmDel===n.id?`<button class="confirm" data-delnote="${n.id}" data-sure="1">Confirmar exclusão</button><button data-cancel-del>Cancelar</button>`
        :`${n.pending?`<button class="ok" data-oknote="${n.id}">Confirmar</button>`:''}${n.type==='bug'&&!n.pending?`<button data-copybug="${n.id}">Copiar bug</button>`:''}<button data-editnote="${n.id}">Editar</button><button data-delnote="${n.id}">Excluir</button>`}</div>`;
  return `<article class="note ${TYPES[n.type].cls}${n.pending?' pendente':''}" data-note="${n.id}">
    <div class="t">${fmtT(n.t)}</div>
    <div style="min-width:0"><div class="kind"><i></i>${TYPES[n.type].label} ${tag}</div>${corpo}</div></article>`;
}

/* ---------- captura automática (só na extensão) ---------- */
let abasInfo = [], modoNavegador = false;
function capturaHtml(s){
  const extras = `<p class="hint" style="margin:6px 0 0"><kbd>Alt+Shift+M</kbd> no sistema em teste marca o momento com print.</p>`;
  if(modoNavegador) return `<div class="eyebrow">Captura automática · navegador de teste</div>
    <p class="hint" style="margin:6px 0 0">${s.status==='running'?'Todas as abas deste navegador são acompanhadas: cliques, campos preenchidos, páginas abertas, erros de JavaScript e falhas de rede viram notas a revisar.':'Sessão pausada: nada está sendo registrado.'} O que você digita nunca é guardado.</p>${extras}`;
  return `<div class="eyebrow">Captura automática</div>
    <p class="hint" style="margin:6px 0 0">${s.status==='running'?'Cliques, campos preenchidos, páginas abertas, erros de JavaScript e falhas de rede nas abas abaixo viram notas a revisar.':'Sessão pausada: nada está sendo registrado.'} O que você digita nunca é guardado.</p>
    <div class="abas">${abasInfo.length?abasInfo.map(a=>`<div class="aba"><i></i><span title="${esc(a.url)}">${esc(a.title||a.url)}</span><button class="link-btn" data-parar="${a.id}">Parar</button></div>`).join(''):'<p class="hint" style="margin:0">Nenhuma aba acompanhada ainda.</p>'}</div>
    <button class="btn" data-act="acompanhar">Acompanhar a aba atual</button>${extras}`;
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
async function acompanharAbaAtual(){
  const [tab] = await chrome.tabs.query({active:true, lastFocusedWindow:true});
  if(!tab || !/^https?:|^file:/.test(tab.url||'')){ toast('Abra a página do sistema em teste e clique de novo.'); return; }
  const r = await chrome.runtime.sendMessage({cmd:'acompanhar', tabId:tab.id}).catch(()=>null);
  if(!r || !r.ok){ toast('O navegador não deixa acompanhar essa aba.'); return; }
  toast('Aba acompanhada. Pode explorar.');
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
        const ev=tudo[k], img = ev.img ? await anotaPrint(ev) : null;
        const t=Math.max(0, elapsed(s)-(Date.now()-ev.ts));
        const lugar = ev.tipo==='pagina' ? '' : (ev.titulo ? ` · ${ev.titulo.slice(0,60)}` : '');
        s.notes.push({id:uid(),type:ev.nota||'obs',t,text:ev.desc+lugar,passo:ev.desc,origem:ev.tipo,url:ev.url||'',imgs:img?[img]:[],auto:true,pending:true});
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
function viewReport(s){
  if(!s) return `<div class="empty">Sessão não encontrada. <button class="link-btn" data-go="home">Voltar</button></div>`;
  const c=counts(s), db=s.debrief||(s.debrief={test:60,bug:25,setup:15,coverage:'',next:''});
  const real=Math.round(s.elapsedMs/MIN);
  return `<section class="view">
    <div class="no-print"><button class="link-btn" data-go="home">← Todas as sessões</button></div>
    <div class="report">
      <div class="panel" style="min-width:0">
        <div class="report-head">
          <div style="min-width:0">
            <div class="eyebrow">Relatório de sessão · ${fmtDate(s.startedAt)}${s.example?' · exemplo':''}</div>
            <h1 style="margin-top:8px">${esc(s.area)}</h1>
          </div>
          <div class="dur">${real} de ${s.plannedMin} min<br>${esc(s.ambiente||'')}</div>
        </div>
        <p class="charter-line">Explorar <b>${esc(s.charter.explorar)}</b> com <b>${esc(s.charter.com)}</b> para descobrir <b>${esc(s.charter.descobrir)}</b>.</p>
        <div class="kpis">${TYPE_ORDER.map(k=>`<div class="kpi ${TYPES[k].cls}"><b>${c[k]}</b><span>${c[k]===1?TYPES[k].label:PLURAL[k]}</span></div>`).join('')}</div>
        ${pendentes(s).length?`<div class="revisar no-print" id="revisar"><h3>${pendentes(s).length} ${pendentes(s).length===1?'nota automática para revisar':'notas automáticas para revisar'}</h3>
          <p class="hint" style="margin:0 0 6px">Elas só entram no relatório e no Markdown depois de confirmadas. Edite o texto ou o tipo se não for observação.</p>
          ${pendentes(s).map(noteHtml).join('')}</div>`:''}
        ${TYPE_ORDER.filter(k=>c[k]).map(k=>`<div class="group ${TYPES[k].cls}"><h3><i></i>${PLURAL[k]}</h3>
          ${s.notes.filter(n=>n.type===k&&!n.pending).map(n=>`<div class="note ${TYPES[k].cls}" style="padding:10px 0"><div class="t">${fmtT(n.t)}</div><div style="min-width:0"><p class="txt" style="margin:0">${esc(n.text)}</p>${n.imgs&&n.imgs.length?`<div class="imgs">${n.imgs.map(src=>`<img src="${src}" alt="Print da nota">`).join('')}</div>`:''}${k==='bug'?`<div class="note-actions no-print"><button data-copybug="${n.id}">Copiar bug</button></div>`:''}</div></div>`).join('')}
        </div>`).join('') || '<p class="hint">Nenhuma nota registrada nessa sessão.</p>'}
      </div>
      <aside style="display:grid;gap:16px;min-width:0">
        <div class="card debrief">
          <div class="eyebrow">Debriefing</div>
          <h3 style="font-size:17px;margin:4px 0 2px">Como o tempo foi dividido?</h3>
          <p class="hint" style="margin:0">Teste, investigação de bug e preparo (TBS). <button class="ajuda" data-go="metodo" data-arg="debriefing">Como fazer um bom debriefing?</button></p>
          <div class="tbs" id="tbs-bar">${tbsBar(db)}</div>
          <div class="tbs-legend">
            ${[['test','Teste','var(--accent)'],['bug','Bug','var(--t-bug)'],['setup','Setup','var(--marker)']].map(([k,l,col])=>`<div class="slider"><label for="tbs-${k}"><span class="sw" style="background:${col}"></span>${l}</label><input type="range" id="tbs-${k}" min="0" max="100" step="5" value="${db[k]}" data-tbs="${k}"><span class="mono" id="tbs-${k}-v">${db[k]}%</span></div>`).join('')}
          </div>
          <div class="field" style="margin:16px 0 10px"><label for="db-cov">Áreas cobertas</label><textarea id="db-cov" data-db="coverage" placeholder="O que de fato foi explorado">${esc(db.coverage)}</textarea></div>
          <div class="field" style="margin:0"><label for="db-next">Fora do escopo e próximas sessões</label><textarea id="db-next" data-db="next" placeholder="O que ficou para depois">${esc(db.next)}</textarea></div>
        </div>
        <div class="card">
          <div class="eyebrow">Compartilhar</div>
          <h3 style="font-size:17px;margin:4px 0 10px">Relatório em Markdown</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
            <button class="btn primary" data-act="copy-md">Copiar Markdown</button>
            <button class="btn" data-act="copy-bugs">Copiar só os bugs</button>
            ${CAN_PRINT?'<button class="btn" data-act="print">Salvar em PDF</button>':''}
          </div>
          <label for="md-out" style="position:absolute;left:-9999px">Prévia do Markdown</label>
          <textarea class="md" id="md-out" readonly>${esc(toMarkdown(s))}</textarea>
          <p class="hint" style="margin:8px 0 0">Funciona colado no Jira, no GitHub, no Notion ou no Slack.</p>
        </div>
        <div class="no-print" style="display:flex;gap:8px;justify-content:flex-end" id="del-wrap">
          <button class="btn ghost danger" data-act="del-session">Excluir sessão</button>
        </div>
      </aside>
    </div>
  </section>`;
}
function tbsBar(db){ const tot=(db.test+db.bug+db.setup)||1; return `<i style="width:${db.test/tot*100}%;background:var(--accent)"></i><i style="width:${db.bug/tot*100}%;background:var(--t-bug)"></i><i style="width:${db.setup/tot*100}%;background:var(--marker)"></i>`; }
function toMarkdown(s, onlyBugs=false){
  const c=counts(s), db=s.debrief||{};
  s={...s, notes:s.notes.filter(n=>!n.pending)};
  const line = n => `- \`${fmtT(n.t)}\` ${n.text.replace(/\n+/g,'\n  ')}${n.imgs&&n.imgs.length?` _(${n.imgs.length} print${n.imgs.length>1?'s':''})_`:''}`;
  if(onlyBugs){
    return `## Bugs · ${s.area}\n_${fmtDate(s.startedAt)} · ${s.ambiente||'ambiente não informado'}_\n\n` + (s.notes.filter(n=>n.type==='bug').map(line).join('\n') || '_Nenhum bug registrado._');
  }
  let md = `# Sessão exploratória · ${s.area}\n\n`;
  md += `**Charter:** ${charterText(s.charter)}.\n\n`;
  md += `| | |\n|---|---|\n| Data | ${fmtDate(s.startedAt)} |\n| Ambiente | ${s.ambiente||'-'} |\n| Quem testou | ${s.testadora||'-'} |\n| Duração | ${Math.round(s.elapsedMs/MIN)} de ${s.plannedMin} min |\n`;
  if(db.test!=null) md += `| Divisão do tempo | Teste ${db.test}% · Bug ${db.bug}% · Setup ${db.setup}% |\n`;
  md += `\n**Resumo:** ${TYPE_ORDER.map(k=>`${c[k]} ${(c[k]===1?TYPES[k].label:PLURAL[k]).toLowerCase()}`).join(', ')}.\n`;
  TYPE_ORDER.forEach(k=>{ const ns=s.notes.filter(n=>n.type===k); if(ns.length) md += `\n## ${PLURAL[k]}\n${ns.map(line).join('\n')}\n`; });
  if(db.coverage) md += `\n## Áreas cobertas\n${db.coverage}\n`;
  if(db.next) md += `\n## Fora do escopo e próximas sessões\n${db.next}\n`;
  md += `\n---\n_Gerado com QA Scout_`;
  return md;
}

/* ---------- bug pronto para o Jira ou GitHub ---------- */
function navegadorAtual(){
  const ua=navigator.userAgent, m=ua.match(/(Edg|OPR|Firefox|Chrome|Version)\/(\d+)/);
  const nome = !m ? 'Navegador' : m[1]==='Edg' ? 'Edge' : m[1]==='OPR' ? 'Opera' : m[1]==='Version' ? 'Safari' : m[1];
  const so = /Windows/.test(ua)?'Windows':/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)?'iOS':/Mac OS/.test(ua)?'macOS':/Linux/.test(ua)?'Linux':'';
  return `${nome}${m?' '+m[2]:''}${so?' · '+so:''} · tela ${screen.width}×${screen.height}`;
}
const MARCA_PASSOS = 'Passos para reproduzir:';
function bugMarkdown(s,n){
  const [obtido, passosTxt=''] = n.text.split(MARCA_PASSOS);
  const descricao = obtido.trim() || 'Bug sem descrição';
  const titulo = descricao.split('\n')[0].slice(0,90);
  const passos = (passosTxt.trim() || passosAte(s,n).replace(MARCA_PASSOS,'').trim() || '1. ').trim();
  const erros = s.notes.filter(x=>x!==n && (x.origem==='erro'||x.origem==='rede') && Math.abs(x.t-n.t)<=60000);
  let md = `## ${titulo}\n\n`;
  md += `| | |\n|---|---|\n| Sessão | ${s.area} · ${fmtDate(s.startedAt)}, aos ${fmtT(n.t)} |\n| Ambiente | ${s.ambiente||'-'} |\n| Navegador | ${s.navegador||navegadorAtual()} |\n`;
  if(n.url) md += `| Página | ${n.url} |\n`;
  md += `\n### Passos para reproduzir\n${passos}\n`;
  md += `\n### Resultado obtido\n${descricao}\n`;
  md += `\n### Resultado esperado\n_Descreva o comportamento esperado._\n`;
  if(erros.length) md += `\n### Erros de console e rede no mesmo minuto\n${erros.map(x=>`- \`${fmtT(x.t)}\` ${(x.passo||x.text).replace(/\n+/g,' ')}`).join('\n')}\n`;
  if(n.imgs&&n.imgs.length) md += `\n### Evidências\n${n.imgs.length} print${n.imgs.length>1?'s':''} na nota do QA Scout. Anexe ao ticket.\n`;
  md += `\n---\n_Registrado com QA Scout · charter: ${charterText(s.charter)}_`;
  return md;
}

/* ---------- backup das sessões ---------- */
function baixarBackup(){
  const sessoes = state.sessions.filter(x=>x.status==='done');
  if(!sessoes.length){ toast('Nenhuma sessão concluída para salvar.'); return; }
  const dados = {app:'qa-scout', formato:1, exportadoEm:new Date().toISOString(), sessions:sessoes};
  const url = URL.createObjectURL(new Blob([JSON.stringify(dados)],{type:'application/json'}));
  const a = document.createElement('a');
  const d = new Date();
  a.href=url; a.download=`qa-scout-backup-${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast(`Backup com ${sessoes.length} ${sessoes.length===1?'sessão':'sessões'} baixado`);
}
function importarBackup(txt){
  let dados; try{ dados=JSON.parse(txt); }catch(e){ toast('Esse arquivo não é um backup do QA Scout.'); return; }
  if(!dados || dados.app!=='qa-scout' || !Array.isArray(dados.sessions)){ toast('Esse arquivo não é um backup do QA Scout.'); return; }
  const ids = new Set(state.sessions.map(x=>x.id));
  const validas = dados.sessions.filter(x=>x && x.id && x.charter && Array.isArray(x.notes) && x.status==='done');
  const novas = validas.filter(x=>!ids.has(x.id));
  if(!novas.length){ toast(validas.length?'Todas as sessões desse backup já estão aqui.':'Nenhuma sessão encontrada no backup.'); return; }
  state.sessions.push(...novas);
  if(!save()){ state.sessions=state.sessions.filter(x=>!novas.includes(x)); return; }
  render();
  const rep = validas.length-novas.length;
  toast(`${novas.length} ${novas.length===1?'sessão importada':'sessões importadas'}${rep?` · ${rep} já ${rep===1?'existia':'existiam'}`:''}`);
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
    <div class="carta-topo"><span class="cat">${esc(h.cat)}</span><span class="carta-n">${deckIdx+1}/${HEUR.length}</span></div>
    <h3>${esc(h.t)}</h3>
    <p>${esc(h.p)}</p>
    <div class="desafio"><span>Faz isso agora</span>${esc(DESAFIO[h.t]||'')}</div>
  </article>`;
}
function viewDeck(){
  const cats=['Todas',...new Set(HEUR.map(h=>h.cat))];
  if(!deckLista().some(h=>h.i===deckIdx)) puxarCarta();
  const active=getActive();
  return `<section class="view">
    <div class="sorteio">
      <div class="sorteio-txt">
        <div class="eyebrow">Baralho de ideias · ${HEUR.length} cartas</div>
        <h2>Travou? <em>Puxa uma carta.</em></h2>
        <p class="hint">Cada carta traz uma heurística e um desafio para fazer agora. Tours inspirados em James Whittaker, mais dados e contextos do dia a dia brasileiro.</p>
        <div class="deck-filters" role="group" aria-label="Categoria">${cats.map(c=>`<button data-cat="${c}" aria-pressed="${deckCat===c}">${c}</button>`).join('')}</div>
      </div>
      <div class="mesa">
        <div class="monte" aria-hidden="true"><i></i><i></i></div>
        <div id="carta">${cartaHtml()}</div>
        <div class="mesa-acoes">
          <button class="btn primary lg" data-act="puxar">Puxar outra carta <kbd>Espaço</kbd></button>
          <button class="btn lg" data-act="usar-carta">${active?'Anotar como ideia na sessão':'Começar sessão com esta carta'}</button>
        </div>
      </div>
    </div>
    <div class="section-head" style="margin-top:8px">
      <h2 style="font-size:18px">Todas as cartas${deckCat==='Todas'?'':` · ${esc(deckCat)}`}</h2>
      <button class="link-btn" data-act="ver-todas" aria-expanded="${deckAberto}">${deckAberto?'Esconder':'Ver todas'}</button>
    </div>
    ${deckAberto?`<div class="deck">${deckLista().map(h=>`<button class="hcard ${CAT_CLS[h.cat]}${h.i===deckIdx?' atual':''}" data-carta="${h.i}"><span class="cat">${esc(h.cat)}</span><h3>${esc(h.t)}</h3><p>${esc(h.p)}</p></button>`).join('')}</div>`:''}
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
function viewMetodo(){
  return `<section class="view">
    <div class="metodo-hero">
      <div class="eyebrow">Método</div>
      <h1>Exploratório não é <em>teste sem plano.</em></h1>
      <p>É aprender, projetar e executar ao mesmo tempo, com foco e com registro. O QA Scout junta as práticas que dão estrutura ao exploratório sem transformá-lo em roteiro.</p>
    </div>
    <nav class="trilha" aria-label="Etapas do método">
      <a href="#m-sbtm" data-ancora="sbtm"><b>Base</b><span>SBTM</span><small>Sessões com missão e tempo</small></a>
      <a href="#m-charter" data-ancora="charter"><b>Antes</b><span>Charter</span><small>A missão da sessão</small></a>
      <a href="#m-notas" data-ancora="notas"><b>Durante</b><span>Notas e heurísticas</span><small>O diário da exploração</small></a>
      <a href="#m-debriefing" data-ancora="debriefing"><b>Depois</b><span>Debriefing</span><small>PROOF e métricas TBS</small></a>
      <a href="#m-leituras" data-ancora="leituras"><b>Para ir além</b><span>Leituras</span><small>As fontes do método</small></a>
    </nav>

    <article class="met" id="m-sbtm">
      <div>
        <div class="origem">Jonathan e James Bach · 2000</div>
        <h2>Session-Based Test Management</h2>
        <p>O <b>SBTM</b> nasceu para responder a uma pergunta difícil: <i>como gerenciar e prestar contas de um trabalho que é exploratório?</i> A resposta foi organizar o exploratório em <b>sessões</b>: blocos de tempo sem interrupção, cada um com uma missão, que terminam num relatório revisável.</p>
        <p>A sessão é a unidade de trabalho. Em vez de contar casos de teste executados, você conta sessões, o que foi coberto em cada uma e o que elas revelaram.</p>
      </div>
      <div class="no-app"><h3>No QA Scout</h3><ul>
        <li>Cada sessão tem charter, cronômetro, diário e relatório</li>
        <li>Duração planejada de 30, 60 ou 90 minutos, com aviso de tempo extra</li>
        <li>Pausa para interrupções reais, sem contar como tempo de teste</li>
        <li>Histórico com busca para prestar contas depois</li>
      </ul></div>
    </article>

    <article class="met" id="m-charter">
      <div>
        <div class="origem">Elisabeth Hendrickson · Explore It!</div>
        <h2>Charter: a missão em uma frase</h2>
        <p>O charter diz <b>para onde</b> olhar sem dizer <b>como</b> testar. O modelo de Elisabeth Hendrickson cabe numa frase:</p>
        <p class="exemplo"><b>Explorar</b> o alvo <b>com</b> recursos, dados ou técnicas <b>para descobrir</b> um tipo de informação.</p>
        <p style="margin-top:12px">Um bom charter é estreito o bastante para caber na sessão e aberto o bastante para deixar espaço à descoberta. Se ele parece um passo a passo, virou caso de teste. Se cabe o sistema inteiro, ainda está largo demais.</p>
      </div>
      <div class="no-app"><h3>Dicas</h3><ul>
        <li>No "para descobrir", pense no risco: o que custaria caro se escapasse?</li>
        <li>No "com", use as heurísticas: dados de borda, interrupções, permissões</li>
        <li>Saiu do foco e achou algo interessante? Anote como ideia para outra sessão</li>
        <li>Travou? A aba Heurísticas sugere um charter pronto</li>
      </ul></div>
    </article>

    <article class="met" id="m-notas">
      <div>
        <div class="origem">SBTM · James Whittaker · heurísticas brasileiras</div>
        <h2>Notas e heurísticas: o diário da exploração</h2>
        <p>A evidência do exploratório é o que você anota. Separar as notas por tipo deixa o relatório legível para quem não estava na sessão:</p>
        <p><b style="color:var(--t-bug)">Bug</b> o que está errado · <b style="color:var(--t-duv)">Dúvida</b> o que precisa de resposta de Produto ou Dev · <b style="color:var(--t-ide)">Ideia</b> o que testar depois · <b style="color:var(--t-ris)">Risco</b> o que pode dar errado mesmo sem falha visível · <b style="color:var(--t-obs)">Observação</b> o que você viu e vale registrar.</p>
        <p>As <b>heurísticas</b> são atalhos para gerar ideias de teste. Os <b>tours</b>, de James Whittaker, propõem roteiros temáticos pelo sistema, como seguir o dinheiro ou sabotar a aplicação. O baralho do QA Scout soma a eles contextos do dia a dia brasileiro: CPF, centavos, acentos e fuso.</p>
      </div>
      <div class="no-app"><h3>No QA Scout</h3><ul>
        <li>Notas com o minuto exato da sessão e atalhos <code>Alt+1</code> a <code>Alt+5</code></li>
        <li>Captura automática de cliques com print, para revisar depois</li>
        <li>Baralho com 18 cartas e um desafio de "faz isso agora" em cada</li>
      </ul>
      <button class="btn" style="margin-top:14px" data-go="deck">Puxar uma carta</button></div>
    </article>

    <article class="met" id="m-debriefing">
      <div>
        <div class="origem">Jon Bach · SBTM</div>
        <h2>Debriefing: a sessão só acaba quando vira conversa</h2>
        <p>No SBTM, toda sessão termina com um debriefing curto, de preferência com outra pessoa do time. O roteiro clássico é o <b>PROOF</b>:</p>
        <div class="proof">
          <div><b>P</b><span><strong>Past</strong>: o que aconteceu na sessão?</span></div>
          <div><b>R</b><span><strong>Results</strong>: o que foi descoberto, como bugs, dúvidas e riscos?</span></div>
          <div><b>O</b><span><strong>Obstacles</strong>: o que atrapalhou o teste?</span></div>
          <div><b>O</b><span><strong>Outlook</strong>: o que ainda falta e merece outra sessão?</span></div>
          <div><b>F</b><span><strong>Feelings</strong>: como você se sente sobre a qualidade do que viu?</span></div>
        </div>
      </div>
      <div class="no-app"><h3>Métricas TBS</h3>
        <p style="margin:0 0 4px;font-size:14.5px">O tempo da sessão se divide em três partes:</p>
        <div class="tbs-demo"><i style="width:60%;background:var(--accent)"></i><i style="width:25%;background:var(--t-bug)"></i><i style="width:15%;background:var(--marker)"></i></div>
        <ul>
          <li><b>Teste</b>: explorar de fato</li>
          <li><b>Bug</b>: investigar e registrar problemas</li>
          <li><b>Setup</b>: preparar ambiente e dados</li>
        </ul>
        <p style="margin:10px 0 0;font-size:14px">Muito setup indica ambiente instável. Muito bug indica uma área frágil. As duas coisas são informação para o time.</p>
      </div>
    </article>

    <div id="m-leituras" style="scroll-margin-top:90px">
      <div class="section-head" style="margin-bottom:12px"><div><div class="eyebrow">Para ir além</div><h2>Leituras</h2></div></div>
      <div class="leituras">
        <div><b>Session-Based Test Management</b><span>Jonathan Bach, 2000. O artigo que apresentou sessões, charters, métricas TBS e o debriefing.</span></div>
        <div><b>Explore It!</b><span>Elisabeth Hendrickson, 2013. Charters, heurísticas e como explorar com intenção.</span></div>
        <div><b>Exploratory Software Testing</b><span>James Whittaker, 2009. Os tours como roteiros para explorar um sistema.</span></div>
        <div><b>Lessons Learned in Software Testing</b><span>Cem Kaner, James Bach e Bret Pettichord, 2001. A escola de contexto que deu origem a tudo isso.</span></div>
      </div>
    </div>
  </section>`;
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
  sub.textContent = over ? `+${fmtClock(e-plan)} além do planejado` : `${fmtClock(plan-e)} restantes de ${s.plannedMin} min`;
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
  const m=text.match(/^\/(bug|duvida|dúvida|ideia|risco|obs)\s+/i);
  let type=noteType;
  if(m){ type={bug:'bug',duvida:'duv','dúvida':'duv',ideia:'ide',risco:'ris',obs:'obs'}[m[1].toLowerCase()]; text=text.slice(m[0].length); }
  if(!text && !pendingImgs.length){ inp.focus(); toast('Escreva algo ou anexe um print antes de registrar.'); return; }
  s.notes.push({id:uid(),type,t:elapsed(s),text,imgs:pendingImgs.slice()});
  pendingImgs=[]; inp.value='';
  if(!save()){ s.notes.pop(); return; }
  filter='all';
  $('#log').innerHTML=logHtml(s); $('#thumbs').innerHTML='';
  refreshSessionCounts(s);
  toast(`${registrado(type)} às ${fmtT(s.notes[s.notes.length-1].t)}`);
  inp.focus();
}
function refreshSessionCounts(s){
  const h=$('.log-head h2'); if(h) h.textContent=`${s.notes.length} ${s.notes.length===1?'nota':'notas'}`;
  const c=counts(s);
  document.querySelectorAll('[data-filter]').forEach(b=>{ const k=b.dataset.filter; b.setAttribute('aria-pressed',filter===k);
    if(k==='rev') b.textContent=`a revisar ${pendentes(s).length}`; else if(k!=='all') b.textContent=`${TYPES[k].label.toLowerCase()} ${c[k]}`; });
}
function setType(k){ noteType=k; document.querySelectorAll('[data-type]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.type===k)); }

function readDraft(){
  const g=id=>($('#'+id)?.value||'').trim();
  const pressed=document.querySelector('[data-dur][aria-pressed="true"]');
  return {explorar:g('c-exp'),com:g('c-com'),descobrir:g('c-des'),area:g('c-area'),ambiente:g('c-amb'),testadora:g('c-tst'),plannedMin:pressed?+pressed.dataset.dur:60};
}

document.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-open]'); if(!t) return;
  if(t.dataset.go){ if(view==='new') { state.draft=readDraft(); save(); } go(t.dataset.go==='active' && !getActive() ? 'new' : t.dataset.go, t.dataset.arg||null); return; }
  if(t.dataset.open){ go('report',t.dataset.open); return; }
  if(t.dataset.dur){ document.querySelectorAll('[data-dur]').forEach(b=>b.setAttribute('aria-pressed',b===t)); return; }
  if(t.dataset.type){ setType(t.dataset.type); $('#note-in')?.focus(); return; }
  if(t.dataset.filter){ filter=t.dataset.filter; const s=getActive(); $('#log').innerHTML=logHtml(s); refreshSessionCounts(s); return; }
  if(t.dataset.cat){ deckCat=t.dataset.cat; puxarCarta(); render(); return; }
  if(t.dataset.carta){ deckIdx=+t.dataset.carta; deckGiro++; mostraCarta(); $('#carta').scrollIntoView({block:'center',behavior:'smooth'}); return; }
  if(t.dataset.rmimg!=null){ pendingImgs.splice(+t.dataset.rmimg,1); $('#thumbs').innerHTML=thumbsHtml(); return; }
  if(t.hasAttribute('data-cancel-del')){ confirmDel=null; atualizaNotas(sessaoDaTela()); return; }
  if(t.dataset.delnote){
    const s=sessaoDaTela();
    if(t.dataset.sure){ s.notes=s.notes.filter(n=>n.id!==t.dataset.delnote); confirmDel=null; save(); toast('Nota excluída'); }
    else confirmDel=t.dataset.delnote;
    atualizaNotas(s); return;
  }
  if(t.dataset.oknote){
    const s=sessaoDaTela(), n=s.notes.find(x=>x.id===t.dataset.oknote);
    if(n){ n.pending=false; save(); atualizaNotas(s); toast('Observação confirmada'); }
    return;
  }
  if(t.dataset.editnote){ editId=t.dataset.editnote; confirmDel=null; atualizaNotas(sessaoDaTela()); const ed=$('#edit-in'); if(ed){ ed.focus(); ed.setSelectionRange(ed.value.length,ed.value.length); } return; }
  if(t.dataset.edtype){ t.parentElement.querySelectorAll('[data-edtype]').forEach(b=>b.setAttribute('aria-pressed',b===t)); return; }
  if(t.dataset.copybug){
    const s=sessaoDaTela(), n=s&&s.notes.find(x=>x.id===t.dataset.copybug);
    if(n) copy(bugMarkdown(s,n),'Bug copiado. É só colar no Jira ou no GitHub.');
    return;
  }
  if(t.dataset.passos){
    const s=sessaoDaTela(), n=s.notes.find(x=>x.id===t.dataset.passos), ed=$('#edit-in'), p=passosAte(s,n);
    if(!p){ toast('Nenhum clique ou página registrado até essa nota.'); return; }
    ed.value = ed.value.replace(/\s+$/,'') + (ed.value.trim()?'\n\n':'') + p;
    t.remove(); ed.focus(); return;
  }
  if(t.hasAttribute('data-cancel-edit')){ editId=null; atualizaNotas(sessaoDaTela()); return; }
  if(t.dataset.saveedit){
    const s=sessaoDaTela(), n=s.notes.find(x=>x.id===t.dataset.saveedit), box=t.closest('.edit-box');
    const text=$('#edit-in').value.trim(), tipo=box.querySelector('[data-edtype][aria-pressed="true"]')?.dataset.edtype || n.type;
    if(!text && !(n.imgs&&n.imgs.length)){ toast('A nota precisa de texto ou de um print.'); return; }
    n.text=text; n.type=tipo; n.pending=false; editId=null; save(); atualizaNotas(s);
    toast(`${TYPES[tipo].label} ${FEM[tipo]?'salva':'salvo'}`); return;
  }
  if(t.dataset.parar){ chrome.runtime.sendMessage({cmd:'parar', tabId:+t.dataset.parar}).then(atualizaAbas); return; }
  const act=t.dataset.act; if(!act) return;
  const s=getActive();
  if(act==='add-note') addNote();
  if(act==='acompanhar') acompanharAbaAtual();
  if(act==='puxar'){ puxarCarta(); mostraCarta(); }
  if(act==='exemplo-charter'){
    const ex=EXEMPLOS_CHARTER[Math.floor(Math.random()*EXEMPLOS_CHARTER.length)];
    [['c-exp',ex.explorar],['c-com',ex.com],['c-des',ex.descobrir],['c-area',ex.area]].forEach(([id,v])=>{ const el=$('#'+id); if(el) el.value=v; });
    toast('Exemplo preenchido. Ajuste para o seu sistema.');
  }
  if(act==='ver-todas'){ deckAberto=!deckAberto; render(); }
  if(act==='usar-carta'){
    const h=HEUR[deckIdx], d=DESAFIO[h.t];
    if(s){ s.notes.push({id:uid(),type:'ide',t:elapsed(s),text:`Heurística “${h.t}”: ${d}`,imgs:[]}); save(); toast('Carta anotada como ideia na sessão'); }
    else { state.draft={...(state.draft||{explorar:'',descobrir:'',area:'',ambiente:'',testadora:'',plannedMin:60}),com:`a heurística “${h.t}” (${d.charAt(0).toLowerCase()+d.slice(1).replace(/\.$/,'')})`}; save(); go('new'); }
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
    pendingImgs=[]; go('report',s.id); toast('Sessão encerrada. Faça o debriefing enquanto está fresco.');
  }
  if(act==='print'){ window.print(); }
  if(act==='backup') baixarBackup();
  if(act==='clear-ex'){ state.sessions=state.sessions.filter(x=>!x.example); save(); render(); toast('Exemplos removidos'); }
  if(act==='copy-md' || act==='copy-bugs'){ const rs=state.sessions.find(x=>x.id===viewArg); copy(toMarkdown(rs,act==='copy-bugs'), act==='copy-md'?'Relatório copiado':'Bugs copiados', $('#md-out')); }
  if(act==='del-session'){ $('#del-wrap').innerHTML='<span class="hint" style="margin-right:auto;align-self:center">Excluir de vez?</span><button class="btn" data-act="del-no">Cancelar</button><button class="btn danger" data-act="del-yes">Excluir</button>'; }
  if(act==='del-no'){ $('#del-wrap').innerHTML='<button class="btn ghost danger" data-act="del-session">Excluir sessão</button>'; }
  if(act==='del-yes'){ state.sessions=state.sessions.filter(x=>x.id!==viewArg); save(); go('home'); toast('Sessão excluída'); }
});

document.addEventListener('submit',e=>{
  if(e.target.id!=='charter-form') return;
  e.preventDefault();
  const d=readDraft();
  if(!d.explorar || !d.descobrir){ $('#form-err').textContent='Preencha pelo menos o que explorar e o que descobrir.'; (d.explorar?$('#c-des'):$('#c-exp')).focus(); return; }
  const s={id:uid(),area:d.area||d.explorar,charter:{explorar:d.explorar,com:d.com||'o que estiver à mão',descobrir:d.descobrir},ambiente:d.ambiente,testadora:d.testadora,plannedMin:d.plannedMin,navegador:navegadorAtual(),status:'running',startedAt:Date.now(),runStartedAt:Date.now(),elapsedMs:0,notes:[]};
  state.sessions.push(s); state.activeId=s.id; state.draft=null; noteType='bug'; filter='all';
  save(); go('active'); setTimeout(()=>$('#note-in')?.focus(),50);
});

document.addEventListener('input',e=>{
  const t=e.target;
  if(t.id==='q'){ query=t.value; const sel=t.selectionStart; render(); const q=$('#q'); q.focus(); try{q.setSelectionRange(sel,sel);}catch(_){} return; }
  if(t.dataset.tbs || t.dataset.db){
    const s=state.sessions.find(x=>x.id===viewArg); if(!s) return;
    if(t.dataset.tbs){
      const k=t.dataset.tbs, v=+t.value; const others=['test','bug','setup'].filter(x=>x!==k);
      const rest=100-v, sumO=s.debrief[others[0]]+s.debrief[others[1]];
      s.debrief[k]=v;
      if(sumO===0){ s.debrief[others[0]]=rest; s.debrief[others[1]]=0; }
      else { const a=Math.round(rest*s.debrief[others[0]]/sumO/5)*5; s.debrief[others[0]]=a; s.debrief[others[1]]=rest-a; }
      ['test','bug','setup'].forEach(x=>{ $('#tbs-'+x).value=s.debrief[x]; $('#tbs-'+x+'-v').textContent=s.debrief[x]+'%'; });
      $('#tbs-bar').innerHTML=tbsBar(s.debrief);
    } else s.debrief[t.dataset.db]=t.value;
    $('#md-out').value=toMarkdown(s); save();
  }
});

document.addEventListener('keydown',e=>{
  if(view==='deck' && e.key===' ' && !e.target.closest?.('input,textarea,button')){ e.preventDefault(); puxarCarta(); mostraCarta(); return; }
  if(view!=='active') return;
  if(e.altKey && !e.ctrlKey && !e.metaKey){ const k=TYPE_ORDER.find(x=>TYPES[x].key===e.key) || TYPE_ORDER[['Digit1','Digit2','Digit3','Digit4','Digit5'].indexOf(e.code)]; if(k){ e.preventDefault(); setType(k); return; } }
  if(e.target.id==='note-in' && e.key==='Enter' && (e.ctrlKey||e.metaKey)){ e.preventDefault(); addNote(); }
});
document.addEventListener('paste',e=>{
  if(view!=='active') return;
  const items=[...(e.clipboardData?.items||[])].filter(i=>i.type.startsWith('image/'));
  if(items.length){ e.preventDefault(); items.forEach(i=>addImageFile(i.getAsFile())); toast('Print anexado à nota'); }
});
document.addEventListener('change',e=>{
  if(e.target.id==='file-in'){ [...e.target.files].forEach(addImageFile); e.target.value=''; }
  if(e.target.id==='backup-in'){ const f=e.target.files[0]; e.target.value=''; if(f) f.text().then(importarBackup).catch(()=>toast('Não foi possível ler o arquivo.')); }
});

function afterRender(){}
// Tema: segue o sistema até a pessoa escolher; a escolha fica salva neste navegador.
const TEMA_KEY='qascout.tema', escuroSistema=matchMedia('(prefers-color-scheme: dark)');
function temaAtual(){ const d=document.documentElement.dataset.theme; return d || (escuroSistema.matches?'dark':'light'); }
function aplicaTema(t){
  if(t) document.documentElement.dataset.theme=t;
  const escuro=temaAtual()==='dark';
  document.documentElement.toggleAttribute('data-escuro',escuro);
  const b=$('#tema'); if(!b) return;
  b.querySelector('span').textContent=escuro?'Escuro':'Claro';
  b.setAttribute('aria-label',`Tema ${escuro?'escuro':'claro'}. Mudar para ${escuro?'claro':'escuro'}`);
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
  const sair=()=>{ if(saiu) return; saiu=true; el.classList.add('saindo'); setTimeout(fim, calmo?300:900); };
  const t=setTimeout(sair, calmo?1500:4100);
  el.addEventListener('click',()=>{ clearTimeout(t); sair(); });
  addEventListener('keydown',e=>{ if(e.key==='Escape'){ clearTimeout(t); sair(); } },{once:true});
}
abertura();

async function init(){
  if(EXT){
    try{ const r=await chrome.storage.local.get([KEY,'qascout.modo']); if(r[KEY]) state=r[KEY]; modoNavegador = r['qascout.modo']==='navegador'; }catch(e){}
    chrome.storage.onChanged.addListener((mud,area)=>{
      if(area==='local' && Object.keys(mud).some(k=>k.startsWith(EV_PREFIX) && mud[k].newValue)) drenar();
      if(area==='session' && mud.abas) atualizaAbas();
    });
  }
  if(getActive()) view='active';
  render();
  if(EXT){ atualizaAbas(); drenar(); }
}
init();
})();
