// @ts-check
const { test: base, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { prepararExtensao } = require('../bin/qa-scout');

const RAIZ = path.join(__dirname, '..', 'app');
const LOJA = 'http://localhost:4173/tests/fixtures/loja.html';

// Cada teste ganha um Chromium com a extensão carregada e o painel aberto numa aba.
// O acesso aos sites é opcional no manifesto e pedido no primeiro "Acompanhar"; aqui a extensão é a
// cópia do navegador de teste, em que o acesso já vem concedido. O pedido em si é testado à parte.
const test = base.extend({
  pasta: async ({}, use) => {
    const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-scout-ext-'));
    await use(prepararExtensao(pasta));
    fs.rmSync(pasta, { recursive: true, force: true });
  },
  context: async ({ pasta }, use) => {
    const context = await chromium.launchPersistentContext('', {
      locale: 'pt-BR',
      channel: 'chromium',
      args: [`--disable-extensions-except=${pasta}`, `--load-extension=${pasta}`],
    });
    await use(context);
    await context.close();
  },
  painel: async ({ context }, use) => {
    let [sw] = context.serviceWorkers();
    if (!sw) sw = await context.waitForEvent('serviceworker');
    const id = sw.url().split('/')[2];
    const painel = await context.newPage();
    await painel.goto(`chrome-extension://${id}/index.html`);
    await use(painel);
  },
});

async function iniciarSessao(painel) {
  await painel.getByRole('button', { name: 'Começar nova sessão' }).click();
  await painel.getByLabel('Explorar').fill('o checkout');
  await painel.getByLabel('para descobrir').fill('falhas no pagamento');
  await painel.getByRole('button', { name: 'Iniciar sessão' }).click();
}

// Na extensão, a testadora clica em "Acompanhar a aba atual" com a loja em primeiro plano.
// Aqui o painel é uma aba, então o comando vai direto para o service worker com o id da loja.
// Depois a loja é recarregada, o que gera a nota automática "Abriu a página".
async function acompanharLoja(context, painel) {
  const loja = await context.newPage();
  await loja.goto(LOJA);
  const r = await painel.evaluate(async url => {
    const [tab] = await chrome.tabs.query({ url });
    return chrome.runtime.sendMessage({ cmd: 'acompanhar', tabId: tab.id });
  }, LOJA);
  expect(r.ok).toBe(true);
  await loja.reload();
  await loja.bringToFront();
  return loja;
}

test.describe('Captura automática', () => {
  test('Mostrar as abas acompanhadas e ignorar as que não foram marcadas', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const outra = await context.newPage();
    await outra.goto(LOJA + '?aba=outra');
    await outra.getByRole('button', { name: 'Pagar com Pix' }).click();
    const loja = await acompanharLoja(context, painel);
    await painel.bringToFront();
    await expect(painel.locator('.captura .aba')).toHaveCount(1);
    await expect(painel.getByRole('button', { name: 'Acompanhar a aba atual' })).toBeVisible();
    await expect(painel.locator('.note', { hasText: 'Pagar com Pix' })).toHaveCount(0);
    await loja.getByRole('button', { name: 'Pagar com Pix' }).click();
    await expect(painel.locator('.note', { hasText: 'Pagar com Pix' })).toHaveCount(1);
  });

  test('Registrar clique como observação a revisar com print marcado', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.getByRole('button', { name: 'Pagar com Pix' }).click();

    const nota = painel.locator('.note.pendente', { hasText: 'Clicou no botão “Pagar com Pix”' });
    await expect(nota).toBeVisible();
    await expect(nota.locator('.tag-auto')).toHaveText('auto · a revisar');
    await expect(nota.locator('.imgs img')).toHaveCount(1);
    await expect(painel.getByRole('button', { name: 'a revisar 2' })).toBeVisible();
  });

  test('Registrar campo preenchido sem guardar o valor digitado', { tag: '@regressao' }, async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.getByLabel('CPF').fill('123.456.789-09');
    await loja.getByLabel('Senha').fill('segredo-de-teste');
    await loja.locator('body').click({ position: { x: 5, y: 5 } });

    await expect(painel.locator('.note', { hasText: 'Preencheu o campo “CPF”' })).toBeVisible();
    await expect(painel.locator('.note', { hasText: 'Preencheu um campo de senha' })).toBeVisible();
    const guardado = await painel.evaluate(() => chrome.storage.local.get(null).then(JSON.stringify));
    expect(guardado).not.toContain('123.456.789-09');
    expect(guardado).not.toContain('segredo-de-teste');
  });

  test('Ignorar cliques enquanto a sessão está pausada', async ({ context, painel }) => {
    await iniciarSessao(painel);
    await painel.getByRole('button', { name: 'Pausar' }).click();
    const loja = await acompanharLoja(context, painel);
    await loja.getByRole('button', { name: 'Pagar com Pix' }).click();
    await painel.waitForTimeout(800);
    await expect(painel.locator('.note')).toHaveCount(0);
  });

  test('Registrar a nova página ao navegar no sistema em teste', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.getByRole('link', { name: 'Ir para o passo 2' }).click();
    // Uma nota ao abrir a loja e outra ao navegar para o passo 2 (o título é o mesmo).
    await expect(painel.locator('.note', { hasText: 'Abriu a página “Loja fictícia · Checkout”' })).toHaveCount(2);
    await loja.getByRole('button', { name: 'Pagar com Pix' }).click();
    await expect(painel.locator('.note', { hasText: 'Pagar com Pix' })).toBeVisible();
  });
});

test.describe('Revisão das notas automáticas', () => {
  test('Confirmar observação automática e incluí-la no relatório', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.getByRole('button', { name: 'Pagar com Pix' }).click();
    await painel.bringToFront();
    const nota = painel.locator('.note', { hasText: 'Pagar com Pix' });
    await nota.getByRole('button', { name: 'Confirmar' }).click();
    await expect(nota.locator('.tag-auto')).toHaveText('automática');
    await expect(painel.getByRole('button', { name: 'observação 1' })).toBeVisible();
    await painel.getByRole('button', { name: 'Encerrar' }).click();
    await painel.getByRole('button', { name: 'Sim, encerrar' }).click();
    await expect(painel.locator('#md-out')).toHaveValue(/Clicou no botão “Pagar com Pix”/);
  });

  test('Editar nota automática e trocar o tipo para bug', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.getByRole('button', { name: 'Pagar com Pix' }).click();
    await painel.bringToFront();
    await painel.locator('.note', { hasText: 'Pagar com Pix' }).getByRole('button', { name: 'Editar' }).click();
    await painel.getByLabel('Texto da nota').fill('Pagar com Pix não responde no primeiro clique');
    await painel.getByRole('group', { name: 'Tipo da nota editada' }).getByRole('button', { name: 'Bug' }).click();
    await painel.getByRole('button', { name: 'Salvar e confirmar' }).click();
    const nota = painel.locator('.note.t-bug', { hasText: 'não responde no primeiro clique' });
    await expect(nota).toBeVisible();
    await expect(nota).not.toHaveClass(/pendente/);
  });

  test('Deixar notas não revisadas fora do Markdown do relatório', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.getByRole('button', { name: 'Pagar com Pix' }).click();
    await painel.bringToFront();
    await expect(painel.locator('.note.pendente')).toHaveCount(2);
    await painel.getByRole('button', { name: 'Encerrar' }).click();
    await painel.getByRole('button', { name: 'Sim, encerrar' }).click();
    await expect(painel.getByText('2 notas automáticas para revisar')).toBeVisible();
    await expect(painel.locator('#md-out')).not.toHaveValue(/Pagar com Pix/);
    await painel.locator('#revisar .note', { hasText: 'Pagar com Pix' }).getByRole('button', { name: 'Confirmar' }).click();
    await expect(painel.locator('#md-out')).toHaveValue(/Pagar com Pix/);
  });
});

test.describe('Erros de console e rede', () => {
  test('Sugerir bug ao capturar erro de JavaScript na página', { tag: '@regressao' }, async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.getByRole('button', { name: 'Aplicar cupom' }).click();
    const nota = painel.locator('.note.t-bug.pendente', { hasText: 'Erro de JavaScript: TypeError: cupom.valor is undefined' });
    await expect(nota).toBeVisible();
    await expect(nota.locator('.tag-auto')).toHaveText('auto · a revisar');
  });

  test('Sugerir risco ao capturar console.error', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.getByRole('button', { name: 'Ver aviso' }).click();
    await expect(painel.locator('.note.t-ris.pendente', { hasText: 'Erro no console: Falha ao carregar o aviso de frete grátis' })).toBeVisible();
  });

  test('Registrar resposta 4xx como risco e falha de conexão como bug', { tag: '@regressao' }, async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.getByRole('button', { name: 'Consultar frete' }).click();
    await expect(painel.locator('.note.t-ris.pendente', { hasText: 'Requisição com erro: GET /api/frete?cep=01001000 → 404' })).toBeVisible();
    await loja.getByRole('button', { name: 'Simular parcelas' }).click();
    await expect(painel.locator('.note.t-bug.pendente', { hasText: 'Requisição falhou: GET /api/parcelas' })).toBeVisible();
  });

  test('Ignorar erros enquanto a sessão está pausada', async ({ context, painel }) => {
    await iniciarSessao(painel);
    await painel.getByRole('button', { name: 'Pausar' }).click();
    const loja = await acompanharLoja(context, painel);
    await loja.getByRole('button', { name: 'Aplicar cupom' }).click();
    await loja.getByRole('button', { name: 'Consultar frete' }).click();
    await painel.waitForTimeout(800);
    await expect(painel.locator('.note')).toHaveCount(0);
  });
});

test.describe('Marcar o momento', () => {
  test('Criar nota com print ao apertar Alt+Shift+M no sistema em teste', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.locator('body').press('Alt+Shift+KeyM');
    const nota = painel.locator('.note.pendente', { hasText: 'Marcou este momento' });
    await expect(nota).toBeVisible();
    await expect(nota.locator('.imgs img')).toHaveCount(1);
  });
});

test.describe('Passos para reproduzir', () => {
  test('Incluir na nota de bug as ações registradas até ela', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.getByLabel('CPF').fill('123.456.789-09');
    await loja.getByRole('button', { name: 'Pagar com Pix' }).click();
    await painel.bringToFront();
    const nota = painel.locator('.note', { hasText: 'Clicou no botão “Pagar com Pix”' });
    await nota.getByRole('button', { name: 'Editar' }).click();
    await painel.getByLabel('Texto da nota').fill('Pix não responde no primeiro clique');
    await painel.getByRole('group', { name: 'Tipo da nota editada' }).getByRole('button', { name: 'Bug' }).click();
    await painel.getByRole('button', { name: 'Incluir passos para reproduzir' }).click();
    await expect(painel.getByLabel('Texto da nota')).toHaveValue(
      'Pix não responde no primeiro clique\n\nPassos para reproduzir:\n1. Abriu a página “Loja fictícia · Checkout”\n2. Preencheu o campo “CPF”\n3. Clicou no botão “Pagar com Pix”');
    await painel.getByRole('button', { name: 'Salvar e confirmar' }).click();
    await painel.getByRole('button', { name: 'Encerrar' }).click();
    await painel.getByRole('button', { name: 'Sim, encerrar' }).click();
    await expect(painel.locator('#md-out')).toHaveValue(/Pix não responde no primeiro clique {2}\n {2}Passos para reproduzir: {2}\n {2}1\\\. Abriu a página/);
  });
});

test.describe('Copiar bug', () => {
  test('Levar passos e erros do mesmo minuto para o bug copiado', async ({ context, painel }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.getByRole('button', { name: 'Pagar com Pix' }).click();
    await loja.getByRole('button', { name: 'Aplicar cupom' }).click();
    await painel.bringToFront();
    await painel.locator('.note', { hasText: 'Clicou no botão “Pagar com Pix”' }).getByRole('button', { name: 'Editar' }).click();
    await painel.getByLabel('Texto da nota').fill('Pix não responde no primeiro clique');
    await painel.getByRole('group', { name: 'Tipo da nota editada' }).getByRole('button', { name: 'Bug' }).click();
    await painel.getByRole('button', { name: 'Incluir passos para reproduzir' }).click();
    await painel.getByRole('button', { name: 'Salvar e confirmar' }).click();
    await painel.locator('.note', { hasText: 'Pix não responde' }).getByRole('button', { name: 'Copiar bug' }).click();
    const md = await painel.evaluate(() => navigator.clipboard.readText());
    expect(md).toMatch(/^## Pix não responde no primeiro clique/);
    expect(md).toContain('### Passos para reproduzir\n1. Abriu a página “Loja fictícia · Checkout”\n2. Clicou no botão “Pagar com Pix”');
    expect(md).toContain('### Resultado obtido\nPix não responde no primeiro clique\n');
    expect(md).toContain('| Página | http://localhost:4173/tests/fixtures/loja.html |');
    expect(md).toMatch(/### Erros de console e rede no mesmo minuto\n- `\d\d:\d\d` Erro de JavaScript: TypeError: cupom.valor is undefined/);
  });
});

test.describe('Acesso aos sites', () => {
  // Extensão como vai para a Chrome Web Store: sem acesso aos sites até a pessoa conceder.
  const testLoja = base.extend({
    context: async ({}, use) => {
      const context = await chromium.launchPersistentContext('', {
      locale: 'pt-BR',
        channel: 'chromium',
        args: [`--disable-extensions-except=${RAIZ}`, `--load-extension=${RAIZ}`],
      });
      await use(context);
      await context.close();
    },
  });

  testLoja('Pedir acesso aos sites ao iniciar e ao acompanhar, e explicar quando a pessoa recusa', async ({ context }) => {
    let [sw] = context.serviceWorkers();
    if (!sw) sw = await context.waitForEvent('serviceworker');
    expect(await sw.evaluate(() => chrome.permissions.contains({ origins: ['<all_urls>'] }))).toBe(false);
    const painel = await context.newPage();
    await painel.goto(`chrome-extension://${new URL(sw.url()).host}/index.html`);
    await painel.evaluate(() => {
      window.pedidos = [];
      chrome.permissions.request = async p => { window.pedidos.push(p); return false; };
    });
    await iniciarSessao(painel);
    await expect(painel.locator('#toast')).toContainText('a captura automática fica desligada');
    await painel.getByRole('button', { name: 'Acompanhar a aba atual' }).click();
    await expect(painel.locator('#toast')).toHaveText('Sem acesso aos sites, o QA Scout não consegue registrar cliques e prints dessa aba.');
    expect(await painel.evaluate(() => window.pedidos)).toEqual([{ origins: ['<all_urls>'] }, { origins: ['<all_urls>'] }]);
    await expect(painel.locator('.captura .aba')).toHaveCount(0);
  });
});

test.describe('Atalhos no sistema em teste', () => {
  test('Marcar uma dúvida com print ao apertar Alt+2 na página acompanhada', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.locator('body').press('Alt+Digit2');
    const nota = painel.locator('.note.t-duv.pendente', { hasText: 'Dúvida marcada neste momento' });
    await expect(nota).toBeVisible();
    await expect(nota.locator('.imgs img')).toHaveCount(1);
  });
});

test.describe('Salvar em PDF', () => {
  test('Abrir o relatório numa aba própria e imprimir de lá', async ({ context, painel }) => {
    await context.addInitScript(() => { window.print = () => { document.documentElement.dataset.imprimiu = '1'; }; });
    await painel.getByText('Checkout · pagamento com Pix').click();
    const [aba] = await Promise.all([context.waitForEvent('page'), painel.getByRole('button', { name: 'Salvar em PDF' }).click()]);
    await aba.waitForLoadState();
    expect(aba.url()).toMatch(/index\.html#imprimir=/);
    await expect(aba.getByRole('heading', { name: 'Checkout · pagamento com Pix' })).toBeVisible();
    await expect(aba.locator('html')).toHaveAttribute('data-imprimiu', '1');
    await expect(aba).toHaveTitle(/Relatório · Checkout · pagamento com Pix/);
  });
});

test.describe('Captura automática por padrão', () => {
  test('Acompanhar a aba do sistema em teste ao iniciar a sessão', { tag: '@regressao' }, async ({ context, painel }) => {
    const loja = await context.newPage();
    await loja.goto(LOJA);
    await painel.bringToFront();
    // No Chrome, a aba ativa da janela é o sistema em teste, ao lado do painel lateral.
    // Aqui o painel é uma aba, então a busca pela aba ativa devolve a loja.
    await painel.evaluate(url => {
      chrome.permissions.request = async () => true;
      const original = chrome.tabs.query.bind(chrome.tabs);
      chrome.tabs.query = q => q.active ? original({ url }) : original(q);
    }, LOJA);
    await iniciarSessao(painel);
    await expect(painel.locator('#toast')).toContainText('Captura automática ligada em “Loja fictícia · Checkout”');
    await expect(painel.locator('.captura .aba')).toHaveCount(1);
    await loja.getByRole('button', { name: 'Pagar com Pix' }).click();
    await expect(painel.locator('.note', { hasText: 'Clicou no botão “Pagar com Pix”' })).toBeVisible();
  });
});

test.describe('Privacidade da captura', () => {
  // #10
  test('Descrever clique em área sem interação sem copiar o texto da página', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.evaluate(() => {
      const caixa = document.createElement('section');
      caixa.id = 'caixa';
      caixa.style.cssText = 'padding:40px;margin:20px;background:#eee';
      caixa.innerHTML = '<p>Cliente: Maria da Silva</p><p>CPF 123.456.789-00</p><span>Saldo R$ 9.999,00</span>';
      document.body.prepend(caixa);
    });
    await loja.locator('#caixa').click({ position: { x: 5, y: 5 } });
    await expect(painel.locator('.note', { hasText: 'Clicou em' })).toHaveCount(1);
    await expect(painel.locator('.note', { hasText: 'Maria' })).toHaveCount(0);
    await expect(painel.locator('.note', { hasText: '123.456' })).toHaveCount(0);
  });
});

test.describe('Erros repetidos', () => {
  // #11
  test('Agrupar rajada do mesmo erro numa nota com contador e registrar erro diferente depois', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.evaluate(() => {
      for (let i = 1; i <= 50; i++) setTimeout(() => { throw new Error(`Falha ao renderizar item ${i}`); });
      setTimeout(() => console.error('Erro diferente depois da rajada'), 50);
    });
    const rajada = painel.locator('.note.t-bug', { hasText: 'Falha ao renderizar item' });
    await expect(rajada).toHaveCount(1);
    await expect(rajada).toContainText('(×50)');
    await expect(painel.locator('.note.t-ris', { hasText: 'Erro diferente depois da rajada' })).toBeVisible();
  });

  // #12
  test('Somar na mesma nota a falha de rede que se repete', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    for (let i = 0; i < 3; i++) {
      await loja.getByRole('button', { name: 'Consultar frete' }).click();
      await loja.waitForTimeout(300);
    }
    const nota = painel.locator('.note.t-ris', { hasText: 'GET /api/frete?cep=01001000 → 404' });
    await expect(nota).toHaveCount(1);
    await expect(nota).toContainText('(×3)');
  });
});

// Página com os casos da 0.7.0: campos sem rótulo, select, ícone, SPA, shadow DOM e iframe.
const CAPTURA = 'http://localhost:4173/tests/fixtures/captura.html';
async function acompanharCaptura(context, painel) {
  const pagina = await context.newPage();
  await pagina.goto(CAPTURA);
  const r = await painel.evaluate(async url => {
    const [tab] = await chrome.tabs.query({ url: url + '*' });
    return chrome.runtime.sendMessage({ cmd: 'acompanhar', tabId: tab.id });
  }, CAPTURA);
  expect(r.ok).toBe(true);
  await pagina.reload();
  await pagina.bringToFront();
  return pagina;
}

test.describe('Cobertura da captura', () => {
  // #15
  test('Registrar o título novo ao navegar numa SPA com pushState', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const pagina = await acompanharCaptura(context, painel);
    await pagina.getByRole('button', { name: 'Ir para Pagamento' }).click();
    await expect(painel.locator('.note', { hasText: 'Abriu a página “Captura · Pagamento”' })).toHaveCount(1);
  });

  // #13
  test('Descrever clique e campo dentro do shadow DOM', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const pagina = await acompanharCaptura(context, painel);
    await pagina.getByRole('button', { name: 'Aplicar no shadow' }).click();
    await pagina.getByLabel('Código do cupom').fill('PROMO10');
    await pagina.getByLabel('Código do cupom').blur();
    await expect(painel.locator('.note', { hasText: 'Clicou no botão “Aplicar no shadow”' })).toHaveCount(1);
    await expect(painel.locator('.note', { hasText: 'Preencheu o campo “Código do cupom”' })).toHaveCount(1);
    await expect(painel.locator('.note', { hasText: 'PROMO10' })).toHaveCount(0);
  });

  // #14
  test('Registrar clique e campo dentro de iframe do mesmo site', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const pagina = await acompanharCaptura(context, painel);
    const quadro = pagina.frameLocator('#quadro');
    await quadro.getByLabel('CEP de entrega').fill('01001000');
    await quadro.getByLabel('CEP de entrega').blur();
    await quadro.getByRole('button', { name: 'Calcular dentro do iframe' }).click();
    await expect(painel.locator('.note', { hasText: 'Preencheu o campo “CEP de entrega”' })).toHaveCount(1);
    await expect(painel.locator('.note', { hasText: 'Clicou no botão “Calcular dentro do iframe”' })).toHaveCount(1);
  });

  // #16 #17 #18 #19
  test('Descrever upload, campos sem rótulo, opção do select e botões de ícone ou texto longo', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const pagina = await acompanharCaptura(context, painel);
    await pagina.getByLabel('Comprovante').setInputFiles({ name: 'segredo-do-cliente.pdf', mimeType: 'application/pdf', buffer: Buffer.from('x') });
    await pagina.getByLabel('Data da entrega').fill('2026-11-02');
    await pagina.locator('.volume').fill('7');
    await pagina.locator('.semrotulo').fill('qualquer coisa');
    await pagina.locator('.semrotulo').blur();
    await pagina.getByLabel('Estado').selectOption('RJ');
    await pagina.getByLabel('Validade do cartão').selectOption('12');
    await pagina.locator('#lixeira').click();
    await pagina.locator('#longo').click();

    // O diário mostra 5 notas por página: confere na sessão salva, não só na tela.
    const textos = () => painel.evaluate(async () => {
      const st = (await chrome.storage.local.get('qascout.v1'))['qascout.v1'];
      return st.sessions.find(x => x.id === st.activeId).notes.map(n => n.text).join('\n');
    });
    const vezes = t => expect.poll(async () => (await textos()).split(t).length - 1);
    await vezes('Anexou um arquivo em “Comprovante”').toBe(1);
    await vezes('segredo-do-cliente').toBe(0);
    await vezes('Preencheu o campo de data “Data da entrega”').toBe(1);
    await vezes('Preencheu um campo deslizante').toBe(1);
    await vezes('Preencheu um campo de texto').toBe(1);
    await vezes('Escolheu “RJ” em “Estado”').toBe(1);
    await vezes('Escolheu uma opção em “Validade do cartão”').toBe(1);
    await vezes('Clicou no botão “Excluir item”').toBe(1);
    await vezes('Clicou no botão “Confirmar a contratação do plano anual com renovação automática e cobrança no…”').toBe(1);
  });
});

test.describe('Idioma da captura', () => {
  test('Registrar clique e campo em inglês quando o painel está em inglês', async ({ context, painel }) => {
    await painel.getByRole('button', { name: /Trocar idioma/ }).click();
    await painel.getByRole('menuitemradio', { name: 'English' }).click();
    await expect(painel.getByRole('button', { name: 'Start a new session' })).toBeVisible();
    await painel.getByRole('button', { name: 'Start a new session' }).click();
    await painel.getByLabel('Explore').fill('the checkout');
    await painel.getByLabel('to discover').fill('payment failures');
    await painel.getByRole('button', { name: 'Start session' }).click();
    const loja = await acompanharLoja(context, painel);
    await loja.getByRole('button', { name: 'Pagar com Pix' }).click();
    await expect(painel.locator('.note', { hasText: 'Clicked the button “Pagar com Pix”' })).toBeVisible();
    await expect(painel.locator('.note', { hasText: 'Opened the page “Loja fictícia · Checkout”' })).toHaveCount(1);
  });
});
