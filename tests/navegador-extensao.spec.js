// @ts-check
// Comando qa-scout: abre o navegador de teste com a extensão e acompanha todas as abas sozinho.
// O nome do arquivo contém "extensao" para rodar no projeto "extensao" do Playwright.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { abrir } = require('../bin/qa-scout');

const LOJA = 'http://localhost:4173/tests/fixtures/loja.html';

test.describe('Navegador de teste (comando qa-scout)', () => {
  let aberto, perfil;

  test.beforeEach(async () => {
    perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-scout-'));
    aberto = await abrir({ url: LOJA, perfil, headless: true });
  });

  test.afterEach(async () => {
    await aberto.context.close();
    fs.rmSync(perfil, { recursive: true, force: true });
  });

  test('Abrir o painel e o sistema em teste com um único comando', async () => {
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
});
