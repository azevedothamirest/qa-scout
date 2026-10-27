# Navegador de teste: um comando e pronto

[← Voltar para o README](../README.md)

Sem instalar nada no seu Chrome. Com o Node instalado:

```bash
npx github:azevedothamirest/qa-scout https://endereco-do-sistema-em-teste
```

Ou, com o projeto clonado: `npm install` e depois `npm run navegador -- https://endereco-do-sistema-em-teste`.

Abre um navegador de teste separado, com o painel do QA Scout numa janela à esquerda e o sistema à direita. Nele, **todas as abas são acompanhadas**: comece a sessão e explore, os cliques viram observações com print (no máximo 1 por segundo, com o ponto clicado marcado).

- O valor digitado nos campos nunca é lido nem guardado, e sessão pausada não registra nada.
- Seu Chrome do dia a dia não é tocado.
- O perfil fica em `~/.qa-scout/perfil` e guarda os logins entre uma sessão e outra.
- Na primeira vez, o comando baixa o Chromium sozinho.
