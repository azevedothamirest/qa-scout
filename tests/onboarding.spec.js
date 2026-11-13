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

// Percorre até o último passo a partir da página atual.
async function ateOFim(page) {
  await page.goto('/#onboarding');
  await page.getByRole('button', { name: 'Começar →' }).click();
  await page.getByRole('button', { name: 'Pagar', exact: true }).click();
  await page.getByRole('button', { name: 'Próximo →' }).click();
  await page.getByRole('button', { name: 'Aplicar cupom' }).click();
  await page.getByRole('button', { name: 'Próximo →' }).click();
  await page.getByRole('button', { name: 'Alt', exact: true }).click();
  await page.getByRole('button', { name: '1', exact: true }).click();
  await page.getByRole('button', { name: 'Próximo →' }).click();
  await page.getByRole('button', { name: 'Copiar bug' }).click();
  await page.getByRole('button', { name: 'Próximo →' }).click();
}

test.describe('Onboarding · correções da 1.1.1', () => {
  // #68
  test('Voltar para a sessão em andamento no fim da apresentação sem criar outra', { tag: '@regressao' }, async ({ page }) => {
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.locator('#c-area').fill('Sessão A');
    await page.locator('#c-exp').fill('o checkout');
    await page.locator('#c-des').fill('cobranças em dobro');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await page.locator('#note-in').fill('nota da sessão A');
    await page.locator('#note-in').press('Control+Enter');

    await ateOFim(page);
    await expect(page.getByText('Sua sessão continua de onde parou.')).toBeVisible();
    await page.getByRole('button', { name: 'Voltar para a sessão' }).click();
    await expect(page.locator('.note .txt', { hasText: 'nota da sessão A' })).toBeVisible();
    const emAndamento = await page.evaluate(() => JSON.parse(localStorage.getItem('qascout.v1')).sessions.filter(s => s.status === 'running').length);
    expect(emAndamento).toBe(1);
  });

  // #71
  test('Devolver o foco a quem abriu e manter o Tab dentro da apresentação', async ({ page }) => {
    await page.getByRole('link', { name: 'Ver apresentação' }).focus();
    await page.keyboard.press('Enter');
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement.closest('#onb'))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(page.getByRole('link', { name: 'Ver apresentação' })).toBeFocused();
  });

  // #72
  test('Virar bug só com Alt e 1 juntos no teclado e copiar o bug de exemplo', async ({ page, context, browserName }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await page.goto('/#onboarding');
    await page.getByRole('button', { name: 'Começar →' }).click();
    await page.getByRole('button', { name: 'Pagar', exact: true }).click();
    await page.getByRole('button', { name: 'Próximo →' }).click();
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();
    await page.getByRole('button', { name: 'Próximo →' }).click();
    await page.keyboard.press('Alt');
    await page.keyboard.press('Digit1');
    await expect(page.getByRole('heading', { name: 'Aperte Alt + 1.' })).toBeVisible();
    await page.keyboard.down('Alt'); await page.keyboard.press('Digit1'); await page.keyboard.up('Alt');
    await expect(page.getByRole('heading', { name: 'Virou bug. Sem sair da tela.' })).toBeVisible();

    await page.getByRole('button', { name: 'Próximo →' }).click();
    await page.getByRole('button', { name: 'Copiar bug' }).click();
    await expect(page.locator('#toast')).toContainText('Bug copiado');
    if (browserName === 'chromium') expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Clicou no botão “Pagar”');
  });
});
