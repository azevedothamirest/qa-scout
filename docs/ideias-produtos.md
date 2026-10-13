# Ideias de produtos para QAs

Lista levantada em outubro de 2026, além de QA Pulse e QA Sidekick. As escolhidas para construir foram a **7 (QA Scout, este projeto)** e depois a **3 (massa de dados brasileira)**.

| # | Ideia | Para quem | Diferencial | Principal risco |
|---|---|---|---|---|
| 1 | Caçador de flaky tests | Times com muitos E2E no CI | Sugerir a causa provável com IA, não só detectar | Concorrência (BuildPulse, Trunk, Datadog); precisa de muitos dados |
| 2 | Migração Cypress → Playwright | Times com suíte Cypress grande | Experiência real de migração da Thamires; pode virar consultoria | Mercado finito; IAs genéricas já fazem parte |
| 3 | **Massa de dados brasileira** | QAs e devs de fintech, e-commerce, governo | Entidades coerentes (CPF, CNPJ, boleto, Pix, CEP) e anonimização LGPD | Parte simples é fácil de copiar |
| 4 | Bug report automático | QAs manuais e PMs | IA escrevendo o report no padrão do time | Mais concorrida (Jam.dev, Marker.io) |
| 5 | Análise de impacto por PR | Times com regressão grande | Une código, card e suíte existente | Difícil acertar com precisão |
| 6 | Vigia de contratos e mensageria | Times com microsserviços e filas | Plugar e usar, cobrindo OpenAPI e AsyncAPI | Nicho técnico, venda lenta |
| 7 | **Companheiro de teste exploratório** | QAs que fazem exploratório | Simples, bonito, em português | Difícil cobrar caro; bom como freemium |
| 8 | Relatório de go/no-go | QA leads e gestores | Linguagem de negócio | Depende de muitas integrações |

## Próximo produto: massa de dados brasileira

Ordem sugerida:
1. Gerador de CPF, CNPJ e CEP coerentes entre si, com perfis prontos (cliente PF, empresa MEI)
2. Boleto e chave/QR Code Pix válidos
3. Anonimização de dumps seguindo a LGPD

Como validar sem empresa: algoritmos públicos de validação (dígitos verificadores, linha digitável, BR Code do Pix) cobertos por testes automatizados, e sandboxes de gateways de pagamento (Mercado Pago, Asaas, Efí).
