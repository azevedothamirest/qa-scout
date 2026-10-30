// @ts-check
// Servidor MCP do QA Scout: o Claude faz a sessão exploratória pelas ferramentas.
// O nome do arquivo contém "extensao" para rodar no projeto "extensao" do Playwright.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { criarFerramentas } = require('../bin/mcp');

const LOJA = 'http://localhost:4173/tests/fixtures/loja.html';
const ROTULOS = 'http://localhost:4173/tests/fixtures/rotulos.html';

test.describe('MCP · sessão conduzida pelo Claude', () => {
  let perfil, f;
  test.beforeEach(() => {
    perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-scout-mcp-'));
    f = criarFerramentas({ perfil, headless: true, locale: 'pt-BR' });
  });
  test.afterEach(async () => {
    await f.fechar();
    fs.rmSync(perfil, { recursive: true, force: true });
    fs.rmSync(perfil + '-extensao', { recursive: true, force: true });
  });

  test('Conduzir sessão completa pelas ferramentas e devolver o relatório', { tag: '@regressao' }, async () => {
    const inicio = await f.iniciar_sessao({ explorar: 'o checkout', com: 'cupons e Pix', descobrir: 'cobranças erradas', minutos: 15, url: LOJA, area: 'Checkout via MCP' });
    expect(inicio).toContain('Sessão iniciada');
    expect(inicio).toContain('button "Pagar com Pix"');

    await f.preencher({ campo: 'CPF', valor: '123.456.789-09' });
    await f.clicar({ papel: 'button', nome: 'Aplicar cupom' });
    await expect.poll(() => f.ver_capturas()).toContain('Erro de JavaScript: TypeError: cupom.valor is undefined');
    const capturas = await f.ver_capturas();
    expect(capturas).toContain('Preencheu o campo “CPF”');
    expect(capturas).not.toContain('123.456.789-09');

    expect(await f.anotar({ tipo: 'bug', texto: 'Aplicar cupom quebra com TypeError e o desconto não aparece' })).toContain('registrada');
    expect(await f.sugerir_heuristica({ categoria: 'Tours' })).toMatch(/^Tour /);

    const relatorio = await f.encerrar_sessao({ cobertura: 'Cupom e CPF', proximos: 'Pagamento com Pix' });
    expect(relatorio).toContain('# Sessão exploratória · Checkout via MCP');
    expect(relatorio).toContain('Explorar o checkout com cupons e Pix para descobrir cobranças erradas');
    expect(relatorio).toMatch(/## Bugs\n- `\d\d:\d\d` Aplicar cupom quebra com TypeError/);
    expect(await f.ver_capturas()).toBe('Nenhuma sessão em andamento.');
  });

  test('Recusar anotação sem sessão e segunda sessão em andamento', async () => {
    expect(await f.anotar({ tipo: 'bug', texto: 'x' })).toContain('Nenhuma sessão');
    await f.iniciar_sessao({ explorar: 'a loja', descobrir: 'erros' });
    expect(await f.iniciar_sessao({ explorar: 'outra', descobrir: 'coisa' })).toContain('Já existe uma sessão');
  });

  // #31
  test('Registrar cada página aberta com o próprio título ao navegar rápido', async () => {
    await f.iniciar_sessao({ explorar: 'a captura', descobrir: 'erros', url: LOJA });
    await f.clicar({ papel: 'link', nome: 'Ir para o passo 2' });
    await f.navegar({ url: 'http://localhost:4173/tests/fixtures/captura.html' });
    await new Promise(r => setTimeout(r, 2500));
    const capturas = await f.ver_capturas();
    expect(capturas.split('Abriu a página “Captura · Início”').length - 1).toBe(1);
    expect(capturas.split('Abriu a página “Loja fictícia · Checkout”').length - 1).toBe(2);
  });

  test('Preencher o campo pelo rótulo exato mesmo com outro rótulo parecido antes na página', async () => {
    await f.iniciar_sessao({ explorar: 'as notas', descobrir: 'campos trocados', url: ROTULOS });
    const r = await f.preencher({ campo: 'Nota', valor: 'Pix não responde' });
    expect(r).toContain('textbox "Nota"');
    expect(r).toContain('Pix não responde');
    expect(await f.preencher({ campo: 'Campo que não existe', valor: 'x' })).toContain('Não encontrei o campo');
  });

  test('Explicar quando o elemento a clicar não existe na tela', async () => {
    await f.iniciar_sessao({ explorar: 'a loja', descobrir: 'erros', url: LOJA });
    const r = await f.clicar({ texto: 'botão que não existe' });
    expect(r).toContain('Não encontrei o elemento');
    expect(r).toContain('button "Pagar com Pix"');
  });
});

test.describe('MCP · protocolo', () => {
  test('Recusar endereços que não são http ou https', () => {
    const { urlPermitida } = require('../bin/mcp');
    for (const url of ['file:///C:/Windows/win.ini', 'chrome-extension://kmnlnoaakacblihodeehdlbbfcmjaaam/index.html', 'javascript:alert(1)', 'chrome://settings', 'não é url']) {
      expect(() => urlPermitida(url), url).toThrow();
    }
    expect(urlPermitida('https://homolog.exemplo.com/checkout')).toBe('https://homolog.exemplo.com/checkout');
  });

  test('Listar as ferramentas e responder pelo protocolo MCP via stdio', async () => {
    const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
    const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
    const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-scout-mcp-'));
    const transporte = new StdioClientTransport({ command: process.execPath, args: [path.join(__dirname, '..', 'bin', 'qa-scout.js'), 'mcp', '--headless', '--perfil', perfil], stderr: 'ignore' });
    const cliente = new Client({ name: 'teste', version: '1.0.0' });
    try {
      await cliente.connect(transporte);
      const { tools } = await cliente.listTools();
      expect(tools.map(t => t.name).sort()).toEqual(['anotar', 'clicar', 'encerrar_sessao', 'escolher_opcao', 'iniciar_sessao', 'navegar', 'preencher', 'sugerir_heuristica', 'ver_capturas', 'ver_pagina']);
      expect(cliente.getInstructions()).toContain('teste exploratório baseado em sessões');
      const r = await cliente.callTool({ name: 'sugerir_heuristica', arguments: {} });
      expect(r.content[0].text.length).toBeGreaterThan(10);
    } finally {
      await cliente.close();
      fs.rmSync(perfil, { recursive: true, force: true });
    }
  });
});
