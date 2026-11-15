# Onde paramos (15/11)

Branch `fix/layout-captura` (commit WIP, ainda não enviado ao GitHub).

## Feito
- Responsividade: o título longo da aba acompanhada esticava o card "Captura automática" (sobrepunha o diário e criava rolagem lateral). Correção em `app/app.css` (`.side` e `.captura .abas` com `minmax(0,1fr)`). Teste "Painel estreito" falha sem a correção e passa com ela.
- Painel fechado: a captura já continuava; agora a aba acompanhada mostra um aviso flutuante (canto inferior direito, shadow root fechado) com "QA Scout registrando", nº de registros novos, o último e o botão "Abrir painel".
  - `app.js`: o painel abre a porta `painel` (`chrome.runtime.connect`).
  - `background.js`: conta os painéis abertos, mantém `qascout.indicador` no storage, `abrirPainel` e esconde o aviso antes do print.
  - `content.js`: monta o aviso nos 4 idiomas e ignora o clique nele.
  - Teste "Painel fechado" passando.

## Falta
1. Rodar `npm test` completo (os navegadores do Playwright precisaram de links em /opt/pw-browsers após o reset).
2. Conferir o aviso no navegador de teste (modo popup) e em celular/tema claro.
3. Ver se a tela de abertura (splash) deve pular ao reabrir o painel (4º print).
4. Abas cortadas no painel bem estreito (3º print).
5. Subir a versão para 1.2.0 (a 1.1.1 já está publicada na loja), abrir as issues e o PR e gerar o pacote.
6. Apagar este arquivo antes do PR.
