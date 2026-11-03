// @ts-check
const { test, expect } = require('@playwright/test');

// Em navegador automatizado o onboarding não abre sozinho; aqui ele é aberto pelo #onboarding ou pelo rodapé.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

const onb = page => page.getByRole('dialog');

test.describe('Onboarding', () => {
  test('Percorrer a apresentação da mini-loja até começar a primeira sessão', async ({ page }) => {
    await page.goto('/#onboarding');
    await expect(onb(page).getByRole('heading', { name: 'QA Scout' })).toBeVisible();
    await page.getByRole('button', { name: 'Começar →' }).click();

    await expect(page.getByRole('heading', { name: 'Clique em Pagar.' })).toBeVisible();
    await page.getByRole('button', { name: 'Pagar', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Clicou. Anotado.' })).toBeVisible();
    await expect(onb(page).locator('.onb-nota')).toHaveText(/Clicou no botão “Pagar”/);

    await page.getByRole('button', { name: 'Próximo →' }).click();
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();
    await expect(onb(page).locator('.onb-nota.t-bug')).toHaveText(/Erro de JavaScript/);

    await page.getByRole('button', { name: 'Próximo →' }).click();
    await page.keyboard.down('Alt'); await page.keyboard.press('Digit1'); await page.keyboard.up('Alt');
    await expect(page.getByRole('heading', { name: 'Virou bug. Sem sair da tela.' })).toBeVisible();
    await expect(onb(page).locator('.onb-nota.t-bug')).toHaveCount(2);

    await page.getByRole('button', { name: 'Próximo →' }).click();
    await page.getByRole('button', { name: 'Copiar bug' }).click();
    await expect(onb(page).locator('.onb-ticket')).toContainText('Clicou no botão “Pagar”');

    await page.getByRole('button', { name: 'Próximo →' }).click();
    await page.getByRole('button', { name: 'Começar minha primeira sessão' }).click();
    await expect(onb(page)).toHaveCount(0);
    await expect(page.getByLabel('Duração planejada')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('qascout.onboarding'))).toBe('visto');
  });

  test('Transformar a nota em bug tocando nas teclas', async ({ page }) => {
    await page.goto('/#onboarding');
    await page.getByRole('button', { name: 'Começar →' }).click();
    await page.getByRole('button', { name: 'Pagar', exact: true }).click();
    await page.getByRole('button', { name: 'Próximo →' }).click();
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();
    await page.getByRole('button', { name: 'Próximo →' }).click();
    await page.getByRole('button', { name: 'Alt', exact: true }).click();
    await page.getByRole('button', { name: '1', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Virou bug. Sem sair da tela.' })).toBeVisible();
  });

  test('Pular a apresentação, liberar a página e reabrir pelo rodapé', async ({ page }) => {
    await page.goto('/#onboarding');
    await page.getByRole('button', { name: 'Pular' }).click();
    await expect(onb(page)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Começar nova sessão' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('qascout.onboarding'))).toBe('visto');
    await page.getByRole('link', { name: 'Ver apresentação' }).click();
    await expect(onb(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(onb(page)).toHaveCount(0);
  });
});

test.describe('Onboarding em inglês', () => {
  test.use({ locale: 'en-US' });
  test('Mostrar a apresentação em inglês', async ({ page }) => {
    await page.goto('/#onboarding');
    await page.getByRole('button', { name: 'Start →' }).click();
    await expect(page.getByRole('heading', { name: 'Click Pay.' })).toBeVisible();
  });
});
