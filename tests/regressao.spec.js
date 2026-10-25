// @ts-check
// Suíte de regressão: os fluxos críticos do QA Scout, de ponta a ponta.
// Roda em toda subida (push e pull request) pelo workflow .github/workflows/ci.yml,
// que publica o título de cada teste no resumo da execução.
// Testes de outras suítes que também protegem fluxo crítico levam a tag @regressao.
const { test, expect } = require('@playwright/test');

const regressao = { tag: '@regressao' };

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function iniciarSessao(page, { area = 'Checkout', explorar = 'o checkout', descobrir = 'cobranças em dobro', duracao = '30' } = {}) {
  await page.getByRole('button', { name: 'Começar nova sessão' }).click();
  await page.locator('#c-area').fill(area);
  await page.locator('#c-exp').fill(explorar);
  await page.locator('#c-des').fill(descobrir);
  await page.getByLabel('Duração planejada').fill(duracao);
  await page.getByRole('button', { name: 'Iniciar sessão' }).click();
  await expect(page.locator('#note-in')).toBeVisible();
}

async function registrar(page, texto) {
  await page.locator('#note-in').fill(texto);
  await page.getByRole('button', { name: 'Registrar nota' }).click();
}

async function encerrar(page) {
  await page.getByRole('button', { name: 'Encerrar' }).click();
  await page.getByRole('button', { name: 'Sim, encerrar' }).click();
  await expect(page.locator('#md-out')).toBeVisible();
}

test.describe('Regressão · jornada da sessão', () => {
  test('Concluir sessão do charter ao relatório com notas de todos os tipos', regressao, async ({ page }) => {
    await iniciarSessao(page, { area: 'Pagamento Pix' });
    const tipos = [['bug', 'Bug', 'QR Code expira antes do tempo'], ['duv', 'Dúvida', 'Estorno parcial existe?'],
      ['ide', 'Ideia', 'Mostrar contador do QR'], ['ris', 'Risco', 'Webhook duplicado'], ['obs', 'Observação', 'Tela lenta no 3G']];
    for (const [tipo, , texto] of tipos) {
      await page.locator(`[data-type="${tipo}"]`).click();
      await registrar(page, texto);
    }
    await expect(page.locator('.note')).toHaveCount(5);

    await encerrar(page);
    const kpis = page.locator('.kpis');
    for (const [, rotulo] of tipos) await expect(kpis).toContainText(`1${rotulo}`);
    const md = page.locator('#md-out');
    await expect(md).toHaveValue(/# Sessão exploratória · Pagamento Pix/);
    for (const [, , texto] of tipos) await expect(md).toHaveValue(new RegExp(texto));

    await page.getByRole('button', { name: '← Todas as sessões' }).click();
    const linha = page.locator('.row', { hasText: 'Pagamento Pix' });
    await expect(linha).toBeVisible();
    await expect(linha).toContainText('1 bug');
  });

  test('Trocar o tipo da nota pelos atalhos Alt+1 a Alt+5', regressao, async ({ page }) => {
    await iniciarSessao(page);
    const esperado = ['Bug', 'Dúvida', 'Ideia', 'Risco', 'Observação'];
    for (let i = 0; i < 5; i++) {
      await page.locator('#note-in').focus();
      await page.keyboard.press(`Alt+Digit${i + 1}`);
      await page.locator('#note-in').fill(`nota ${i + 1}`);
      await page.locator('#note-in').press('Control+Enter');
      await expect(page.locator('.note .kind').first()).toHaveText(esperado[i]);
    }
  });

  test('Retomar o cronômetro depois de pausar e recarregar a página', regressao, async ({ page }) => {
    await iniciarSessao(page);
    await registrar(page, 'Antes da pausa');
    await page.getByRole('button', { name: 'Pausar' }).click();
    await page.reload();
    await expect(page.locator('.paused-tag')).toBeVisible();
    await expect(page.locator('.note .txt').first()).toHaveText('Antes da pausa');
    const parado = await page.locator('#clock').textContent();
    await page.getByRole('button', { name: 'Retomar' }).click();
    await expect(page.locator('#clock')).not.toHaveText(parado || '', { timeout: 3000 });
  });

  test('Ignorar nota só com espaços', regressao, async ({ page }) => {
    await iniciarSessao(page);
    await registrar(page, '     ');
    await expect(page.locator('.note')).toHaveCount(0);
  });

  test('Reabrir pelo histórico o relatório de uma sessão concluída', regressao, async ({ page }) => {
    await iniciarSessao(page, { area: 'Login social' });
    await registrar(page, 'Google login falha no Safari');
    await encerrar(page);
    await page.reload();
    await page.locator('.row', { hasText: 'Login social' }).click();
    await expect(page.getByRole('heading', { name: 'Login social' })).toBeVisible();
    await expect(page.locator('#md-out')).toHaveValue(/Google login falha no Safari/);
  });
});

test.describe('Regressão · segurança e dados', () => {
  test('Mostrar HTML digitado como texto, sem executar', regressao, async ({ page }) => {
    await iniciarSessao(page, { area: '<img src=x onerror="window.__xss=1">' });
    await registrar(page, '<img src=x onerror="window.__xss=2"><b>negrito</b>');
    await expect(page.locator('.note .txt').first()).toHaveText('<img src=x onerror="window.__xss=2"><b>negrito</b>');
    await encerrar(page);
    await page.getByRole('button', { name: '← Todas as sessões' }).click();
    expect(await page.evaluate(() => /** @type {any} */ (window).__xss)).toBeUndefined();
    await expect(page.locator('.row img, .note img, h1 img')).toHaveCount(0);
  });

  test('Continuar funcionando em memória quando o armazenamento está bloqueado', regressao, async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => { throw new DOMException('bloqueado', 'SecurityError'); };
    });
    await page.reload();
    await iniciarSessao(page);
    await expect(page.locator('#toast')).toContainText('não permite salvar');
    await registrar(page, 'Nota sem storage');
    await expect(page.locator('.note .txt').first()).toHaveText('Nota sem storage');
  });

  test('Guardar no navegador só a sessão, sem nada enviado para a rede', regressao, async ({ page }) => {
    const externas = [];
    page.on('request', (r) => {
      const u = new URL(r.url());
      if (!['localhost', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(u.hostname) && u.protocol.startsWith('http')) externas.push(r.url());
    });
    await iniciarSessao(page);
    await registrar(page, 'Dado sensível: 123.456.789-00');
    await encerrar(page);
    expect(externas).toEqual([]);
  });
});

test.describe('Regressão · navegação e layout', () => {
  test('Abrir todas as abas sem erro de JavaScript', regressao, async ({ page }) => {
    const erros = [];
    page.on('pageerror', (e) => erros.push(e.message));
    await page.reload();
    for (const aba of ['Heurísticas', 'Método', 'Sessões']) {
      await page.getByRole('button', { name: aba, exact: true }).click();
    }
    await iniciarSessao(page);
    await page.locator('#tema').click();
    expect(erros).toEqual([]);
  });

  test('Manter a página sem rolagem horizontal em todas as telas', regressao, async ({ page }) => {
    const semRolagem = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await semRolagem();
    for (const aba of ['Heurísticas', 'Método']) {
      await page.getByRole('button', { name: aba, exact: true }).click();
      await semRolagem();
    }
    await page.getByRole('button', { name: 'Sessões', exact: true }).click();
    await iniciarSessao(page);
    await registrar(page, 'Nota curta');
    await semRolagem();
    await encerrar(page);
    await semRolagem();
  });
});
