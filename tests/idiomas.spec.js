// @ts-check
const { test, expect } = require('@playwright/test');
const { chaves: chaves18n } = require('../scripts/chaves-i18n');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('Idioma', () => {
  test('Trocar para inglês recarregando a tela e manter a escolha ao voltar', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await page.getByRole('button', { name: /Trocar idioma/ }).click();
    const recarregou = page.waitForEvent('load');
    await page.getByRole('menuitemradio', { name: 'English' }).click();
    await recarregou;
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('button', { name: 'Start a new session' })).toBeVisible();
    await expect(page.locator('#idioma-cod')).toHaveText('EN');
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Start a new session' })).toBeVisible();
  });

  test('Abrir em espanhol e em português de Portugal pelo menu', async ({ page }) => {
    await page.getByRole('button', { name: /Trocar idioma/ }).click();
    await page.getByRole('menuitemradio', { name: 'Español' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await page.getByRole('button', { name: /Cambiar idioma/ }).click();
    await page.getByRole('menuitemradio', { name: 'Português (Portugal)' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-PT');
    await expect(page.getByRole('link', { name: /privacidade/i })).toHaveAttribute('href', /privacidade\.pt-PT\.html$/);
  });
});

test.describe('Idioma do navegador', () => {
  test.use({ locale: 'en-US' });
  test('Abrir em inglês na primeira visita com navegador em inglês', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('button', { name: 'Start a new session' })).toBeVisible();
  });
});

test.describe('Dicionários', () => {
  // O pt-PT só guarda o que muda em relação ao pt-BR; inglês e espanhol precisam de todas as chaves.
  test('Traduzir todos os textos da interface em inglês e espanhol', () => {
    global.window = { QAS_I18N: { dic: {} } };
    require('../app/i18n/en.js'); require('../app/i18n/es.js');
    const { dic } = global.window.QAS_I18N;
    const chaves = chaves18n();
    expect(chaves.filter(k => !dic.en[k])).toEqual([]);
    expect(chaves.filter(k => !dic.es[k])).toEqual([]);
  });
});
