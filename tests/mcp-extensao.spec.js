// @ts-check
// Servidor MCP do QA Scout: o Claude faz a sessão exploratória pelas ferramentas.
// O nome do arquivo contém "extensao" para rodar no projeto "extensao" do Playwright.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { criarFerramentas } = require('../bin/mcp');

const LOJA = 'http://localhost:4173/tests/fixtures/loja.html';

test.describe('MCP · sessão conduzida pelo Claude', () => {
  let perfil, f;
  test.beforeEach(() => {
    perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-scout-mcp-'));
    f = criarFerramentas({ perfil, headless: true });
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
});

test.describe('MCP · protocolo', () => {
  test('Listar as ferramentas e responder pelo protocolo MCP via stdio', { tag: '@regressao' }, async () => {
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
