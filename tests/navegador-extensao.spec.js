// @ts-check
// Comando qa-scout: abre o navegador de teste com a extensão e acompanha todas as abas sozinho.
// O nome do arquivo contém "extensao" para rodar no projeto "extensao" do Playwright.
const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { abrir, prepararExtensao, ID_FIXO } = require('../bin/qa-scout');

const LOJA = 'http://localhost:4173/tests/fixtures/loja.html';

test.describe('Navegador de teste (comando qa-scout)', () => {
  let aberto, perfil;

  test.beforeEach(async () => {
    perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-scout-'));
    aberto = await abrir({ url: LOJA, perfil, headless: true, locale: 'pt-BR' });
  });

  test.afterEach(async () => {
    await aberto.context.close();
    fs.rmSync(perfil, { recursive: true, force: true });
    fs.rmSync(perfil + '-extensao', { recursive: true, force: true });
  });

  test('Abrir o painel e o sistema em teste com um único comando', { tag: '@regressao' }, async () => {
    await expect(aberto.painel.getByRole('button', { name: 'Começar nova sessão' })).toBeVisible();
    await expect(aberto.site).toHaveTitle('Loja fictícia · Checkout');
  });

  test('Registrar cliques em qualquer aba sem precisar marcá-la', async () => {
    const { painel, site, context } = aberto;
    await painel.getByRole('button', { name: 'Começar nova sessão' }).click();
    await painel.getByLabel('Explorar').fill('o checkout');
    await painel.getByLabel('para descobrir').fill('falhas no pagamento');
    await painel.getByRole('button', { name: 'Iniciar sessão' }).click();
    await expect(painel.getByText('Captura automática · navegador de teste')).toBeVisible();
    await expect(painel.getByRole('button', { name: 'Acompanhar a aba atual' })).toHaveCount(0);

    await site.bringToFront();
    await site.getByRole('button', { name: 'Pagar com Pix' }).click();
    await expect(painel.locator('.note.pendente', { hasText: 'Clicou no botão “Pagar com Pix”' })).toBeVisible();

    const outra = await context.newPage();
    await outra.goto(LOJA + '?aba=2');
    await outra.getByLabel('CPF').fill('123');
    await outra.locator('body').click({ position: { x: 5, y: 5 } });
    await expect(painel.locator('.note', { hasText: 'Preencheu o campo “CPF”' })).toBeVisible();
  });

  test('Ignorar cliques, atalhos e erros forjados por script da página', async () => {
    const { painel, site } = aberto;
    await painel.getByRole('button', { name: 'Começar nova sessão' }).click();
    await painel.getByLabel('Explorar').fill('o checkout');
    await painel.getByLabel('para descobrir').fill('falhas no pagamento');
    await painel.getByRole('button', { name: 'Iniciar sessão' }).click();
    await site.bringToFront();
    await site.evaluate(() => {
      document.querySelector('button').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyM', altKey: true, shiftKey: true }));
      for (let i = 0; i < 60; i++) document.dispatchEvent(new CustomEvent('qascout:erro', { detail: JSON.stringify({ tipo: 'js', msg: 'falso ' + i, chave: 'falso-' + i, vezes: 1 }) }));
    });
    await site.getByRole('button', { name: 'Pagar com Pix' }).click();
    await expect(painel.locator('.note.pendente', { hasText: 'Clicou no botão “Pagar com Pix”' })).toHaveCount(1);
    await expect(painel.locator('.note', { hasText: 'Marcou este momento' })).toHaveCount(0);
    await expect.poll(() => painel.locator('.note', { hasText: 'Erro de JavaScript: falso' }).count()).toBeLessThanOrEqual(20);
  });
});

test.describe('Navegador de teste · atualização', () => {
  test('Recuperar as sessões guardadas sob o id antigo da extensão', async () => {
    const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-scout-'));
    const antiga = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-scout-antiga-'));
    // Versão antiga: mesma extensão sem a chave fixa, então com outro id (como acontecia com o npx).
    prepararExtensao(antiga);
    const manifesto = JSON.parse(fs.readFileSync(path.join(antiga, 'manifest.json'), 'utf8'));
    delete manifesto.key;
    fs.writeFileSync(path.join(antiga, 'manifest.json'), JSON.stringify(manifesto));
    const velho = await chromium.launchPersistentContext(perfil, { channel: 'chromium', locale: 'pt-BR', args: [`--disable-extensions-except=${antiga}`, `--load-extension=${antiga}`] });
    let [sw] = velho.serviceWorkers();
    if (!sw) sw = await velho.waitForEvent('serviceworker');
    expect(new URL(sw.url()).host).not.toBe(ID_FIXO);
    const painelVelho = await velho.newPage();
    await painelVelho.goto(`chrome-extension://${new URL(sw.url()).host}/index.html`);
    await painelVelho.getByRole('button', { name: 'Remover exemplos' }).click();
    await painelVelho.getByRole('button', { name: 'Começar nova sessão' }).click();
    await painelVelho.getByLabel('Explorar').fill('o carrinho antigo');
    await painelVelho.getByLabel('para descobrir').fill('itens duplicados');
    await painelVelho.getByRole('button', { name: 'Iniciar sessão' }).click();
    await painelVelho.getByRole('button', { name: 'Encerrar' }).click();
    await painelVelho.getByRole('button', { name: 'Sim, encerrar' }).click();
    await velho.close();

    const aberto = await abrir({ perfil, headless: true });
    try {
      expect(aberto.id).toBe(ID_FIXO);
      await expect(aberto.painel.locator('.row', { hasText: 'o carrinho antigo' })).toBeVisible();
    } finally {
      await aberto.context.close();
      for (const p of [perfil, perfil + '-extensao', antiga]) fs.rmSync(p, { recursive: true, force: true });
    }
  });
});
