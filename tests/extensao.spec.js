// @ts-check
const { test: base, expect, chromium } = require('@playwright/test');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const LOJA = 'http://localhost:4173/tests/fixtures/loja.html';

// Cada teste ganha um Chromium com a extensão carregada e o painel aberto numa aba.
const test = base.extend({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [`--disable-extensions-except=${RAIZ}`, `--load-extension=${RAIZ}`],
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

// No navegador real, a testadora clica em "Acompanhar a aba atual" com a loja em primeiro plano.
// Aqui o painel é uma aba, então o comando vai direto para o service worker com o id da loja.
async function acompanharLoja(context, painel) {
  const loja = await context.newPage();
  await loja.goto(LOJA);
  const r = await painel.evaluate(async url => {
    const [tab] = await chrome.tabs.query({ url });
    return chrome.runtime.sendMessage({ cmd: 'acompanhar', tabId: tab.id });
  }, LOJA);
  expect(r.ok).toBe(true);
  await loja.bringToFront();
  return loja;
}

test.describe('Captura automática', () => {
  test('Registrar clique como observação a revisar com print marcado', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.getByRole('button', { name: 'Pagar com Pix' }).click();

    const nota = painel.locator('.note.pendente', { hasText: 'Clicou no botão “Pagar com Pix”' });
    await expect(nota).toBeVisible();
    await expect(nota.locator('.tag-auto')).toHaveText('auto · a revisar');
    await expect(nota.locator('.imgs img')).toHaveCount(1);
    await expect(painel.getByRole('button', { name: 'a revisar 1' })).toBeVisible();
  });

  test('Registrar campo preenchido sem guardar o valor digitado', async ({ context, painel }) => {
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

  test('Registrar a nova página ao navegar na aba acompanhada', async ({ context, painel }) => {
    await iniciarSessao(painel);
    const loja = await acompanharLoja(context, painel);
    await loja.getByRole('link', { name: 'Ir para o passo 2' }).click();
    await expect(painel.locator('.note', { hasText: 'Abriu a página “Loja fictícia · Checkout”' })).toBeVisible();
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
    await expect(painel.locator('.note.pendente')).toHaveCount(1);
    await painel.getByRole('button', { name: 'Encerrar' }).click();
    await painel.getByRole('button', { name: 'Sim, encerrar' }).click();
    await expect(painel.getByText('1 nota automática para revisar')).toBeVisible();
    await expect(painel.locator('#md-out')).not.toHaveValue(/Pagar com Pix/);
    await painel.locator('#revisar').getByRole('button', { name: 'Confirmar' }).click();
    await expect(painel.locator('#md-out')).toHaveValue(/Pagar com Pix/);
  });
});
