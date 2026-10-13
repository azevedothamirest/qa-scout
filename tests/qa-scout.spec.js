// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('Histórico de sessões', () => {
  test('Exibir sessões de exemplo no primeiro acesso', async ({ page }) => {
    await expect(page.locator('.row')).toHaveCount(2);
    await expect(page.getByText('Checkout · pagamento com Pix')).toBeVisible();
    await expect(page.locator('.tag-ex').first()).toHaveText('exemplo');
  });

  test('Filtrar sessões pelo texto de uma nota', async ({ page }) => {
    await page.getByLabel('Buscar sessões').fill('111.111.111-11');
    await expect(page.locator('.row')).toHaveCount(1);
    await expect(page.locator('.row h3')).toContainText('Cadastro PF');
  });

  test('Remover exemplos e mostrar estado vazio', async ({ page }) => {
    await page.getByRole('button', { name: 'Remover exemplos' }).click();
    await expect(page.locator('.row')).toHaveCount(0);
    await expect(page.getByText('Nenhuma sessão ainda')).toBeVisible();
  });
});

test.describe('Charter', () => {
  test('Impedir início sem missão e objetivo de descoberta', async ({ page }) => {
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await expect(page.locator('#form-err')).toHaveText('Preencha pelo menos o que explorar e o que descobrir.');
  });

  test('Iniciar sessão com a duração escolhida', async ({ page }) => {
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.locator('#c-exp').fill('o login');
    await page.locator('#c-des').fill('falhas de sessão');
    await page.getByRole('button', { name: /30 min/ }).click();
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await expect(page.locator('.charter-card')).toContainText('Explorar o login');
    await expect(page.locator('#clock-sub')).toContainText('de 30 min');
  });
});

test.describe('Sessão em campo', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.locator('#c-exp').fill('o checkout');
    await page.locator('#c-des').fill('cobranças em dobro');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
  });

  test('Registrar nota com Ctrl+Enter usando o tipo selecionado', async ({ page }) => {
    await page.locator('[data-type="ris"]').click();
    await page.locator('#note-in').fill('Webhook chega antes do pedido');
    await page.locator('#note-in').press('Control+Enter');
    const note = page.locator('.note').first();
    await expect(note.locator('.kind')).toHaveText('Risco');
    await expect(note.locator('.txt')).toHaveText('Webhook chega antes do pedido');
  });

  test('Definir o tipo pelo prefixo de comando', async ({ page }) => {
    await page.locator('#note-in').fill('/duvida Cupom vale para Pix?');
    await page.getByRole('button', { name: 'Registrar nota' }).click();
    await expect(page.locator('.note .kind').first()).toHaveText('Dúvida');
    await expect(page.locator('.note .txt').first()).toHaveText('Cupom vale para Pix?');
  });

  test('Bloquear nota vazia', async ({ page }) => {
    await page.getByRole('button', { name: 'Registrar nota' }).click();
    await expect(page.locator('.note')).toHaveCount(0);
    await expect(page.locator('#toast')).toContainText('Escreva algo');
  });

  test('Pausar e manter o cronômetro parado', async ({ page }) => {
    await page.getByRole('button', { name: 'Pausar' }).click();
    const before = await page.locator('#clock').textContent();
    await page.waitForTimeout(1300);
    await expect(page.locator('#clock')).toHaveText(before || '');
    await expect(page.locator('.paused-tag')).toBeVisible();
  });

  test('Manter a sessão após recarregar a página', async ({ page }) => {
    await page.locator('#note-in').fill('Bug persistente');
    await page.locator('#note-in').press('Control+Enter');
    await page.reload();
    await expect(page.locator('.note .txt').first()).toHaveText('Bug persistente');
  });

  test('Encerrar e gerar relatório em Markdown', async ({ page }) => {
    await page.locator('#note-in').fill('Desconto aplicado duas vezes');
    await page.locator('#note-in').press('Control+Enter');
    await page.getByRole('button', { name: 'Encerrar' }).click();
    await page.getByRole('button', { name: 'Sim, encerrar' }).click();
    const md = page.locator('#md-out');
    await expect(md).toHaveValue(/# Sessão exploratória · o checkout/);
    await expect(md).toHaveValue(/## Bugs\n- `\d\d:\d\d` Desconto aplicado duas vezes/);
  });
});

test.describe('Debriefing', () => {
  test('Manter a divisão Teste, Bug e Setup somando 100%', async ({ page }) => {
    await page.locator('[data-open="ex-pix"]').click();
    await page.locator('#tbs-test').fill('80');
    const vals = await Promise.all(['test', 'bug', 'setup'].map(k => page.locator(`#tbs-${k}`).inputValue()));
    expect(vals.map(Number).reduce((a, b) => a + b, 0)).toBe(100);
    await expect(page.locator('#md-out')).toHaveValue(/Teste 80%/);
  });
});
