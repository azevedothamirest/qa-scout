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
    await expect(page.locator('.tag-ex').first()).toHaveText(/exemplo$/);
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

test.describe('Extensão do Chrome', () => {
  test('Mostrar o link da Chrome Web Store na tela inicial da versão web', async ({ page }) => {
    const link = page.getByRole('link', { name: 'Instalar no Chrome ↗' });
    await expect(link).toHaveAttribute('href', 'https://chromewebstore.google.com/detail/qa-scout/goffncpkhonlejcokjgiobomlpiefpin');
    await expect(link).toHaveAttribute('target', '_blank');
  });
});

test.describe('Relatório em PDF', () => {
  test('Imprimir só o documento do relatório, com charter, totais e notas confirmadas', { tag: '@regressao' }, async ({ page }) => {
    await page.getByText('Checkout · pagamento com Pix').click();
    await page.emulateMedia({ media: 'print' });
    const doc = page.locator('.doc');
    await expect(doc).toBeVisible();
    await expect(page.locator('.top')).toBeHidden();
    await expect(page.locator('.report')).toBeHidden();
    await expect(doc.locator('h1')).toHaveText('Checkout · pagamento com Pix');
    await expect(doc.locator('.doc-charter')).toContainText('Explorar o pagamento com Pix no checkout');
    await expect(doc.locator('.doc-kpis')).toContainText('2Bugs');
    await expect(doc.locator('.doc-nota')).toHaveCount(7);
    await expect(doc.locator('.doc-tbs')).toContainText('Teste 55%');
  });
});

test.describe('Backup das sessões', () => {
  test('Restaurar sessões removidas a partir do backup baixado', { tag: '@regressao' }, async ({ page }) => {
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

  test('Neutralizar HTML e tipos de nota inválidos vindos de um backup', async ({ page }) => {
    const payload = 'x"><h1 id="injetado">HTML INJETADO</h1><a id="falso" href="https://example.com">Entrar</a><img src="x';
    const backup = { app: 'qa-scout', formato: 1, sessions: [{ id: 'poc"><b id="id-injetado">', status: 'done', area: 'Backup malicioso', charter: { explorar: 'a', com: 'b', descobrir: 'c' },
      plannedMin: '<b id="min-injetado">1</b>', elapsedMs: 60000, startedAt: Date.now(), debrief: { test: 50, bug: 25, setup: 25 },
      notes: [{ id: 'n1', type: 'obs', t: 1000, text: 'nota com print falso', imgs: [payload] }, { id: 'n2', type: 'zzz', t: 2000, text: 'tipo desconhecido' }] }] };
    await page.getByLabel('Importar backup').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
    await expect(page.locator('#toast')).toHaveText('1 sessão importada');
    await page.locator('.row', { hasText: 'Backup malicioso' }).click();
    await expect(page.locator('.note', { hasText: 'tipo desconhecido' }).first()).toBeVisible();
    await expect(page.locator('#injetado, #falso, #id-injetado, #min-injetado')).toHaveCount(0);
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
    await expect(page.locator('#form-err')).toBeVisible();
    await expect(page.locator('#form-err')).toContainText('Confira os campos marcados: Explorar, para descobrir.');
    await expect(page.locator('#c-exp')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#c-des')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Diga o que você vai explorar.')).toBeVisible();
    await expect(page.getByText('Diga o que você quer descobrir.')).toBeVisible();
    await expect(page.locator('#c-exp')).toBeFocused();
  });

  test('Tirar o destaque de erro conforme os campos são preenchidos', async ({ page }) => {
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await page.locator('#c-exp').fill('o login');
    await expect(page.locator('#c-exp')).toHaveAttribute('aria-invalid', 'false');
    await expect(page.getByText('Diga o que você vai explorar.')).toBeHidden();
    await expect(page.locator('#form-err')).toBeVisible();
    await page.locator('#c-des').fill('falhas de sessão');
    await expect(page.locator('#form-err')).toBeHidden();
  });

  test('Iniciar sessão com a duração digitada', async ({ page }) => {
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.locator('#c-exp').fill('o login');
    await page.locator('#c-des').fill('falhas de sessão');
    await page.getByLabel('Duração planejada').fill('45');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await expect(page.locator('.charter-card')).toContainText('Explorar o login');
    await expect(page.locator('#clock-sub')).toContainText('de 45 min');
  });

  test('Recusar duração fora de 1 a 480 minutos', async ({ page }) => {
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.locator('#c-exp').fill('o login');
    await page.locator('#c-des').fill('falhas de sessão');
    await page.getByLabel('Duração planejada').fill('0');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await expect(page.getByText('Use um tempo entre 1 e 480 minutos.')).toBeVisible();
    await expect(page.locator('#form-err')).toHaveText('Falta pouco para começar. Confira os campos marcados: Duração planejada.');
    await expect(page.locator('.charter-card')).toHaveCount(0);
  });

  test('Listar no resumo só os campos que falharam, incluindo a duração', async ({ page }) => {
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.locator('#c-des').fill('bugs');
    await page.getByLabel('Duração planejada').fill('-5');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await expect(page.locator('#form-err')).toHaveText('Falta pouco para começar. Confira os campos marcados: Explorar, Duração planejada.');
    await expect(page.locator('#form-err')).not.toContainText('vermelho');
  });

  test('Manter os erros do charter ao trocar de aba e voltar', async ({ page }) => {
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.getByLabel('Duração planejada').fill('-5');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await page.getByRole('link', { name: 'Heurísticas', exact: true }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Nova sessão' }).click();
    await expect(page.getByLabel('Duração planejada')).toHaveValue('-5');
    await expect(page.getByLabel('Duração planejada')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Use um tempo entre 1 e 480 minutos.')).toBeVisible();
    await expect(page.locator('#form-err')).toBeVisible();
  });
});

test.describe('Sessão em campo', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.locator('#c-exp').fill('o checkout');
    await page.locator('#c-des').fill('cobranças em dobro');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
  });

  // #74
  test('Registrar como observação a nota sem tipo escolhido', async ({ page }) => {
    await page.locator('#note-in').fill('/bug pagamento recusado');
    await page.locator('#note-in').press('Control+Enter');
    await page.locator('#note-in').fill('tela demora a carregar');
    await page.locator('#note-in').press('Control+Enter');
    await expect(page.locator('.note', { hasText: 'pagamento recusado' }).locator('.kind')).toHaveText('Bug');
    await expect(page.locator('.note', { hasText: 'tela demora a carregar' }).locator('.kind')).toHaveText('Observação');
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

  test('Chamar a aba da sessão de "Sessão ativa" enquanto ela roda', async ({ page }) => {
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Sessão ativa' })).toHaveAttribute('aria-current', 'page');
  });

  test('Esvaziar a região de status quando o aviso some, mesmo depois de trocar de tela', async ({ page }) => {
    await page.getByRole('button', { name: 'Registrar nota' }).click();
    await expect(page.locator('#toast')).toContainText('Escreva algo');
    await page.getByRole('link', { name: 'Heurísticas', exact: true }).click();
    await expect(page.locator('#toast')).toHaveText('');
  });

  test('Mostrar 1 min no relatório de sessão encerrada em segundos', async ({ page }) => {
    await page.locator('#note-in').fill('Bug rápido');
    await page.locator('#note-in').press('Control+Enter');
    await page.getByRole('button', { name: 'Encerrar' }).click();
    await page.getByRole('button', { name: 'Sim, encerrar' }).click();
    await expect(page.locator('#md-out')).toHaveValue(/\| Duração \| 1 de 60 min \|/);
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
    await page.locator('#note-in').fill('/bug Desconto aplicado duas vezes');
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
    await page.getByRole('link', { name: 'Heurísticas', exact: true }).click();
  });

  test('Puxar outra carta diferente da atual', async ({ page }) => {
    const antes = await page.locator('.carta h2').textContent();
    await page.getByRole('button', { name: /Puxar outra carta/ }).click();
    await expect(page.locator('.carta h2')).not.toHaveText(antes || '');
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
    const titulo = await page.locator('.carta h2').textContent();
    await page.getByRole('button', { name: 'Começar sessão com esta carta' }).click();
    await expect(page.getByLabel('com', { exact: true })).toHaveValue(new RegExp(`heurística “${titulo}”`));
  });

  test('Anotar a carta como ideia durante a sessão', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Nova sessão' }).click();
    await page.getByLabel('Explorar').fill('o login');
    await page.getByLabel('para descobrir').fill('falhas de sessão');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await page.getByRole('link', { name: 'Heurísticas', exact: true }).click();
    const titulo = await page.locator('.carta h2').textContent();
    await page.getByRole('button', { name: 'Anotar como ideia na sessão' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Sessão ativa' }).click();
    await expect(page.locator('.note.t-ide')).toContainText(`Heurística “${titulo}”`);
  });

  test('Abrir uma carta pela lista completa', async ({ page }) => {
    await page.getByRole('button', { name: 'Ver todas' }).click();
    await page.locator('.hcard', { hasText: 'Permissões' }).click();
    await expect(page.locator('.carta h2')).toHaveText('Permissões');
  });
});

test.describe('Método', () => {
  test('Virar o flashcard ao clicar e voltar ao clicar de novo', async ({ page }) => {
    await page.locator('#tab-metodo').click();
    const carta = page.locator('#m-sbtm');
    await expect(carta).toHaveAttribute('aria-pressed', 'false');
    await carta.click();
    await expect(carta).toHaveAttribute('aria-pressed', 'true');
    await expect(carta.locator('.fc-verso')).toHaveAttribute('aria-hidden', 'false');
    await carta.click();
    await expect(carta).toHaveAttribute('aria-pressed', 'false');
  });

  test('Virar o flashcard pelo teclado', async ({ page }) => {
    await page.locator('#tab-metodo').click();
    await page.locator('#m-charter').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#m-charter')).toHaveAttribute('aria-pressed', 'true');
  });

  test('Abrir o método com a carta do charter já virada pela ajuda do formulário', async ({ page }) => {
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.getByRole('button', { name: 'Por que charter?' }).click();
    await expect(page.locator('#m-charter')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#m-sbtm')).toHaveAttribute('aria-pressed', 'false');
  });
});

test.describe('Tema', () => {
  test('Abrir no tema escuro na primeira visita', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('data-escuro', '');
    await expect(page.locator('#tema')).toContainText('Escuro');
  });

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

test.describe('MCP', () => {
  test('Mostrar como instalar o MCP no terminal e copiar um pedido de exemplo', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await page.getByRole('link', { name: 'MCP', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Explore em dupla com o Claude/ })).toBeVisible();
    await expect(page.getByText('Roda no terminal do seu computador.')).toBeVisible();
    await expect(page.getByText('claude mcp add qa-scout -- npx -y github:azevedothamirest/qa-scout mcp')).toBeVisible();
    await page.getByRole('button', { name: 'Copiar pedido: Sessão com charter' }).click();
    await expect(page.locator('#toast')).toHaveText(/Copiado|Ctrl\+C/);
    await expect(page.getByRole('link', { name: /Guia completo do MCP/ })).toHaveAttribute('href', /docs\/mcp\.md$/);
  });
});

test.describe('Servidor local', () => {
  test('Recusar caminhos que saem das pastas servidas', async ({ request }) => {
    for (const url of ['/tests/fixtures/..%5c..%5cCLAUDE.md', '/..%5c..%5cpackage.json', '/tests/fixtures/..%2f..%2fCLAUDE.md', '/%E0%A4%A']) {
      expect((await request.get(url)).status(), url).toBe(404);
    }
    expect((await request.get('/tests/fixtures/loja.html')).status()).toBe(200);
  });
});

test.describe('Acessibilidade', () => {
  test('Ligar Editar e Excluir ao texto da própria nota', async ({ page }) => {
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.locator('#c-exp').fill('o checkout');
    await page.locator('#c-des').fill('falhas');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await page.locator('#note-in').fill('Primeira nota');
    await page.getByRole('button', { name: 'Registrar nota' }).click();
    await page.locator('#note-in').fill('Segunda nota');
    await page.getByRole('button', { name: 'Registrar nota' }).click();
    // Cada botão aponta (aria-describedby) para o texto da nota em que está.
    const descricao = b => b.evaluate(el => document.getElementById(el.getAttribute('aria-describedby')).textContent);
    expect(await descricao(page.locator('.note', { hasText: 'Primeira nota' }).getByRole('button', { name: 'Excluir' }))).toBe('Primeira nota');
    expect(await descricao(page.locator('.note', { hasText: 'Segunda nota' }).getByRole('button', { name: 'Editar' }))).toBe('Segunda nota');
  });

  test('Chamar de "Voltar à sessão" a saída da confirmação de encerrar', async ({ page }) => {
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.locator('#c-exp').fill('o checkout');
    await page.locator('#c-des').fill('falhas');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await page.getByRole('button', { name: 'Encerrar', exact: true }).click();
    await page.getByRole('button', { name: 'Voltar à sessão' }).click();
    await expect(page.locator('#note-in')).toBeVisible();
  });
});

test.describe('Acessibilidade · nomes', () => {
  test('Dar nome curto ao card de sessão de exemplo e separar o selo do título', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Abrir sessão Checkout · pagamento com Pix, exemplo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Checkout · pagamento com Pix · exemplo' })).toBeVisible();
  });

  test('Tirar o atalho do nome do botão de puxar carta', async ({ page }) => {
    await page.locator('#tab-deck').click();
    await expect(page.getByRole('button', { name: 'Puxar outra carta', exact: true })).toHaveAttribute('aria-keyshortcuts', 'Space');
  });
});

test.describe('Acessibilidade · títulos', () => {
  // Uma tela tem um h1 e nenhum título pula nível (h1 → h3) (#53).
  async function niveis(page) {
    return page.evaluate(() => [...document.querySelectorAll('main h1, main h2, main h3, main h4')]
      .filter(e => e.offsetParent || e.classList.contains('sr-only')).map(e => +e.tagName[1]));
  }
  function confere(n) {
    expect(n.filter(x => x === 1)).toHaveLength(1);
    n.forEach((x, i) => { if (i) expect(x - n[i - 1]).toBeLessThanOrEqual(1); });
  }
  test('Começar cada tela por um h1 sem pular níveis de título', async ({ page }) => {
    confere(await niveis(page));
    for (const tela of ['deck', 'metodo', 'mcp']) {
      await page.locator(`#tab-${tela}, [data-go="${tela}"]`).first().click();
      confere(await niveis(page));
    }
    await page.locator('[data-go="home"]').first().click();
    await page.locator('[data-open="ex-pix"]').click();
    confere(await niveis(page));
    await page.locator('[data-go="home"]').first().click();
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    confere(await niveis(page));
    await page.locator('#c-exp').fill('o checkout');
    await page.locator('#c-des').fill('falhas');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    confere(await niveis(page));
  });
});

test.describe('Acessibilidade · navegação e debriefing', () => {
  test('Levar o foco ao conteúdo pelo link "Pular para o conteúdo" no primeiro Tab', async ({ page }) => {
    await page.keyboard.press('Tab');
    const pular = page.getByRole('link', { name: 'Pular para o conteúdo' });
    await expect(pular).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#app')).toBeFocused();
  });

  test('Anunciar a porcentagem dos sliders e a nova divisão do tempo', async ({ page }) => {
    await page.locator('[data-open="ex-pix"]').click();
    const teste = page.getByRole('slider', { name: 'Teste' });
    await expect(teste).toHaveAttribute('aria-valuetext', '55%');
    await teste.focus();
    await page.keyboard.press('ArrowRight');
    await expect(teste).toHaveAttribute('aria-valuetext', '60%');
    await expect(page.locator('#anuncio')).toHaveText(/^Teste 60%, Bug \d+%, Setup \d+%$/);
  });

  test('Dar pelo menos 24 px de altura aos links do rodapé', async ({ page }) => {
    for (const a of await page.locator('.rodape a').all()) expect((await a.boundingBox()).height).toBeGreaterThanOrEqual(24);
  });
});

test.describe('Página MCP', () => {
  test('Levar "veja o guia de instalação" ao guia do Claude Desktop', async ({ page }) => {
    await page.locator('#tab-mcp').click();
    await expect(page.getByRole('link', { name: 'veja o guia de instalação' })).toHaveAttribute('href', /docs\/mcp\.md#instalar$/);
  });
});

test.describe('Histórico · resumo', () => {
  test('Deixar as sessões de exemplo fora dos números da home', async ({ page }) => {
    const resumo = page.getByLabel('Resumo das sessões');
    await expect(resumo).toContainText('0sessões concluídas');
    await expect(resumo).toContainText('0bugs encontrados');
  });
});

test.describe('Navegação', () => {
  test('Voltar à tela anterior pelo botão Voltar do navegador', async ({ page }) => {
    await page.getByRole('link', { name: 'Heurísticas', exact: true }).click();
    await expect(page).toHaveURL(/#\/heuristicas$/);
    await page.getByRole('link', { name: 'MCP', exact: true }).click();
    await expect(page).toHaveURL(/#\/mcp$/);
    await page.goBack();
    await expect(page.locator('#tab-deck')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Travou?');
  });

  test('Abrir direto o relatório pelo endereço da tela', async ({ page }) => {
    await page.goto('/#/relatorio/ex-pix');
    await expect(page.getByRole('heading', { level: 1, name: 'Checkout · pagamento com Pix' })).toBeVisible();
  });

  test('Cair nas sessões quando o relatório do endereço não existe', async ({ page }) => {
    await page.goto('/#/relatorio/nao-existe');
    await expect(page.locator('#tab-home')).toHaveAttribute('aria-current', 'page');
  });

  test('Trocar o idioma sem sair da tela atual', async ({ page }) => {
    await page.locator('[data-open="ex-pix"]').click();
    await page.locator('#idioma').click();
    await page.locator('[data-idioma="en"]').click();
    await expect(page).toHaveURL(/#\/relatorio\/ex-pix$/);
    await expect(page.getByText('Session report', { exact: false }).first()).toBeVisible();
    await expect(page.locator('.abertura')).toHaveCount(0);
  });

  test('Guardar o charter digitado ao trocar o idioma', async ({ page }) => {
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.locator('#c-exp').fill('o carrinho');
    await page.locator('#idioma').click();
    await page.locator('[data-idioma="es"]').click();
    await expect(page.locator('#c-exp')).toHaveValue('o carrinho');
  });
});

test.describe('Sessão esquecida', () => {
  test('Pausar a sessão sozinha quando acaba o tempo planejado', async ({ page }) => {
    await page.clock.install();
    await page.reload();
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.locator('#c-exp').fill('o checkout');
    await page.locator('#c-des').fill('falhas');
    await page.getByLabel('Duração planejada').fill('1');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await page.clock.runFor(61_000);
    await expect(page.getByRole('button', { name: 'Retomar' })).toBeVisible();
    await expect(page.locator('#clock')).toHaveText('01:00');
    await expect(page.locator('#clock-sub')).toHaveText('Tempo esgotado. Retome para prorrogar ou encerre.');
  });

  test('Prorrogar sem pausar de novo depois de retomar a sessão esgotada', async ({ page }) => {
    await page.clock.install();
    await page.reload();
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.locator('#c-exp').fill('o checkout');
    await page.locator('#c-des').fill('falhas');
    await page.getByLabel('Duração planejada').fill('1');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await page.clock.runFor(61_000);
    await page.getByRole('button', { name: 'Retomar' }).click();
    await page.clock.runFor(30_000);
    await expect(page.getByRole('button', { name: 'Pausar' })).toBeVisible();
    await expect(page.locator('#clock-sub')).toContainText('além do planejado');
  });

  test('Encontrar pausada a sessão esquecida aberta depois de recarregar', async ({ page }) => {
    await page.clock.install();
    await page.reload();
    await page.getByRole('button', { name: 'Começar nova sessão' }).click();
    await page.locator('#c-exp').fill('o checkout');
    await page.locator('#c-des').fill('falhas');
    await page.getByLabel('Duração planejada').fill('1');
    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    // Simula a aba fechada: o relógio anda sem o app rodando.
    await page.evaluate(() => { const st = JSON.parse(localStorage.getItem('qascout.v1')); const s = st.sessions.find(x => x.id === st.activeId); s.runStartedAt -= 3 * 3600_000; localStorage.setItem('qascout.v1', JSON.stringify(st)); });
    await page.reload();
    await expect(page.getByRole('button', { name: 'Retomar' })).toBeVisible();
    await expect(page.locator('#clock')).toHaveText('01:00');
  });
});

test.describe('Apoio opcional', () => {
  test('Abrir a abinha do café ao passar o mouse e levar ao Ko-fi', async ({ page, isMobile }) => {
    const aba = page.getByRole('link', { name: 'Pagar um café (opcional) ↗' });
    await expect(aba).toHaveAttribute('href', 'https://ko-fi.com/tazevedo');
    const fechada = (await aba.boundingBox()).width;
    expect(fechada).toBeLessThanOrEqual(42);
    if (!isMobile) {
      await aba.hover();
      await expect.poll(async () => (await aba.boundingBox()).width).toBeGreaterThan(120);
    }
  });
});

test.describe('Relatório em PDF · elementos de tela', () => {
  test('Esconder o "Pular para o conteúdo" na impressão mesmo com o foco nele', async ({ page }) => {
    await page.locator('[data-open="ex-pix"]').click();
    await page.locator('#pular').focus();
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('#pular')).toBeHidden();
  });
});
