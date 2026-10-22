// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');

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

test.describe('Backup das sessões', () => {
  test('Restaurar sessões removidas a partir do backup baixado', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Baixar backup' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^qa-scout-backup-\d{4}-\d{2}-\d{2}\.json$/);
    const arquivo = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'qa-scout-')), 'backup.json');
    await download.saveAs(arquivo);

    await page.getByRole('button', { name: 'Remover exemplos' }).click();
    await expect(page.locator('.row')).toHaveCount(0);
    await page.getByLabel('Importar backup').setInputFiles(arquivo);
    await expect(page.locator('#toast')).toHaveText('2 sessões importadas');
    await expect(page.locator('.row')).toHaveCount(2);

    await page.reload();
    await expect(page.locator('.row')).toHaveCount(2);
  });

  test('Ignorar sessões que já existem ao importar o mesmo backup', async ({ page }) => {
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Baixar backup' }).click()]);
    const arquivo = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'qa-scout-')), 'backup.json');
    await download.saveAs(arquivo);
    await page.getByLabel('Importar backup').setInputFiles(arquivo);
    await expect(page.locator('#toast')).toHaveText('Todas as sessões desse backup já estão aqui.');
    await expect(page.locator('.row')).toHaveCount(2);
  });

  test('Recusar arquivo que não é backup do QA Scout', async ({ page }) => {
    await page.getByLabel('Importar backup').setInputFiles({ name: 'outro.json', mimeType: 'application/json', buffer: Buffer.from('{"nome":"planilha"}') });
    await expect(page.locator('#toast')).toHaveText('Esse arquivo não é um backup do QA Scout.');
    await expect(page.locator('.row')).toHaveCount(2);
  });
});

test.describe('Copiar bug', () => {
  test('Copiar bug com ambiente, passos e resultado esperado a partir do relatório', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByText('Checkout · pagamento com Pix').click();
    await page.locator('.group.t-bug .note', { hasText: 'aplica o desconto duas vezes' }).getByRole('button', { name: 'Copiar bug' }).click();
    await expect(page.locator('#toast')).toHaveText('Bug copiado. É só colar no Jira ou no GitHub.');
    const md = await page.evaluate(() => navigator.clipboard.readText());
    expect(md).toMatch(/^## Com cupom de 10%, voltar da tela do QR Code/);
    expect(md).toContain('| Ambiente | Homologação · build 4.18.2 |');
    expect(md).toMatch(/\| Navegador \| \S+/);
    expect(md).toContain('### Passos para reproduzir\n1.');
    expect(md).toContain('### Resultado obtido\nCom cupom de 10%');
    expect(md).toContain('### Resultado esperado');
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

test.describe('Baralho de heurísticas', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole('button', { name: 'Heurísticas', exact: true }).click();
  });

  test('Puxar outra carta diferente da atual', async ({ page }) => {
    const antes = await page.locator('.carta h3').textContent();
    await page.getByRole('button', { name: /Puxar outra carta/ }).click();
    await expect(page.locator('.carta h3')).not.toHaveText(antes || '');
    await expect(page.locator('.desafio')).toContainText('Faz isso agora');
  });

  test('Puxar só cartas da categoria escolhida', async ({ page }) => {
    await page.getByRole('group', { name: 'Categoria' }).getByRole('button', { name: 'Dados' }).click();
    for (let i = 0; i < 4; i++) {
      await expect(page.locator('.carta .cat')).toHaveText('Dados');
      await page.getByRole('button', { name: /Puxar outra carta/ }).click();
    }
  });

  test('Começar sessão com a carta sugerida no campo "com"', async ({ page }) => {
    const titulo = await page.locator('.carta h3').textContent();
    await page.getByRole('button', { name: 'Começar sessão com esta carta' }).click();
    await expect(page.getByLabel('com', { exact: true })).toHaveValue(new RegExp(`heurística “${titulo}”`));
  });

  test('Anotar a carta como ideia durante a sessão', async ({ page }) => {
    await page.getByRole('button', { name: 'Nova sessão' }).click();
    await page.getByLabel('Explorar').fill('o login');
    await page.getByLabel('para descobrir').fill('falhas de sessão');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await page.getByRole('button', { name: 'Heurísticas', exact: true }).click();
    const titulo = await page.locator('.carta h3').textContent();
    await page.getByRole('button', { name: 'Anotar como ideia na sessão' }).click();
    await page.getByRole('button', { name: 'Em campo' }).click();
    await expect(page.locator('.note.t-ide')).toContainText(`Heurística “${titulo}”`);
  });

  test('Abrir uma carta pela lista completa', async ({ page }) => {
    await page.getByRole('button', { name: 'Ver todas' }).click();
    await page.locator('.hcard', { hasText: 'Permissões' }).click();
    await expect(page.locator('.carta h3')).toHaveText('Permissões');
  });
});

test.describe('Tema', () => {
  test('Alternar o tema e manter a escolha ao recarregar', async ({ page }) => {
    const botao = page.locator('#tema');
    const inicial = await page.evaluate(() => document.documentElement.hasAttribute('data-escuro'));
    await botao.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', inicial ? 'light' : 'dark');
    const fundo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', inicial ? 'light' : 'dark');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(fundo);
    await expect(botao).toContainText(inicial ? 'Claro' : 'Escuro');
  });
});
