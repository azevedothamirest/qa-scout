// @ts-check
// Site institucional (site/inicio.html, publicado como index.html no Pages): o mesmo app.js em modo
// site, sem sessão. A sessão só existe na extensão e no navegador de teste (#86).
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/inicio.html');
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('qascout.onboarding', 'visto'); });
  await page.reload();
});

test.describe('Site institucional', () => {
  test('Mostrar o institucional com o link da Chrome Web Store e sem sessões', { tag: '@regressao' }, async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Explore com missão.');
    await expect(page.getByRole('link', { name: 'Instalar no Chrome ↗' }).first()).toHaveAttribute('href', /chromewebstore\.google\.com/);
    await expect(page.getByRole('button', { name: 'Começar nova sessão' })).toHaveCount(0);
    await expect(page.locator('.row')).toHaveCount(0);
    await expect(page.getByRole('navigation').getByRole('link')).toHaveText(['Início', 'Heurísticas', 'MCP']);
  });

  test('Mostrar no rodapé Como instalar, Privacidade, Termos e o apoio opcional, sem falar em beta', async ({ page }) => {
    await expect(page.locator('.rodape a')).toHaveText(['Como instalar ↗', 'Privacidade ↗', 'Termos ↗', '☕ Apoiar (opcional) ↗']);
    await expect(page.locator('.rodape a').first()).toHaveAttribute('href', /chromewebstore/);
    await expect(page.locator('body')).not.toContainText(/beta/i);
  });

  test('Oferecer o café do Ko-fi como apoio opcional', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Pagar um café ↗' })).toHaveAttribute('href', 'https://ko-fi.com/tazevedo');
    await expect(page.locator('.cafe')).toContainText('É opcional.');
  });

  test('Cair no início quando o endereço pede uma tela de sessão', async ({ page }) => {
    await page.goto('/inicio.html#/nova');
    await expect(page.locator('#tab-home')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#c-exp')).toHaveCount(0);
  });

  test('Mostrar 2 cartas fixas e uma terceira que leva à extensão', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Heurísticas' }).click();
    await expect(page.locator('.deck-site .hcard')).toHaveCount(3);
    await expect(page.locator('.hcard-mais h2')).toHaveText('Quer ver mais? Use a extensão.');
    await expect(page.locator('.hcard-mais').getByRole('link', { name: 'Instalar no Chrome ↗' })).toHaveAttribute('href', /chromewebstore/);
    await expect(page.getByRole('button', { name: 'Puxar outra carta', exact: true })).toHaveCount(0);
    await expect(page.getByText('Todas as cartas')).toHaveCount(0);
    const primeiras = await page.locator('.deck-site .hcard h2').allTextContents();
    await page.reload();
    await expect(page.locator('.deck-site .hcard h2')).toHaveText(primeiras);
  });


  test('Levar o fim da demo para a instalação da extensão', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('link', { name: 'Ver a demo' }).click();
    await page.getByRole('button', { name: 'Começar →' }).click();
    await page.getByRole('button', { name: 'Pagar', exact: true }).click();
    await page.getByRole('button', { name: 'Próximo →' }).click();
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();
    await page.getByRole('button', { name: 'Próximo →' }).click();
    await page.keyboard.down('Alt'); await page.keyboard.press('Digit1'); await page.keyboard.up('Alt');
    await page.getByRole('button', { name: 'Próximo →' }).click();
    await page.getByRole('button', { name: 'Copiar bug' }).click();
    await page.getByRole('button', { name: 'Próximo →' }).click();
    await expect(page.getByRole('link', { name: 'Instalar no Chrome ↗' }).last()).toHaveAttribute('href', /chromewebstore/);
    await expect(page.getByRole('button', { name: /Começar (minha primeira|uma) sessão/ })).toHaveCount(0);
  });
});

test.describe('Site · transição do app web', () => {
  test('Oferecer o backup das sessões que ficaram do app web antigo', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('qascout.v1', JSON.stringify({ sessions: [{ id: 's1', area: 'Antiga', charter: { explorar: 'a', com: 'b', descobrir: 'c' }, status: 'done', startedAt: 1, elapsedMs: 60000, plannedMin: 30, notes: [] }], activeId: null })));
    await page.reload();
    await expect(page.getByText('O QA Scout agora roda na extensão do Chrome.')).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Baixar backup' }).click();
    expect((await download).suggestedFilename()).toMatch(/\.json$/);
  });

  test('Esconder o aviso de backup quando só há as sessões de exemplo', async ({ page }) => {
    await expect(page.getByText('O QA Scout agora roda na extensão do Chrome.')).toHaveCount(0);
  });
});
