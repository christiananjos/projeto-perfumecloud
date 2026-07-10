# Arquitetura do Frontend — PerfumeCloud Pro

> Documentado retroativamente a partir do código existente em 2026-07. Não foi escolhida via bootstrap do zero — o projeto já estava implementado quando esta documentação foi criada.

## Padrão

SPA em **Vue 3 (Options API)**, carregado via `<script>` de CDN (`unpkg.com/vue@3`) — **sem bundler, sem `package.json`, sem etapa de build** em produção. Tailwind CSS e Chart.js também via CDN. Servido como arquivos estáticos (Azure App Service, ver `.github/workflows/deploy.yml` e `.github/workflows/nginx.conf`).

## Estrutura

- `index.html` — shell da SPA, monta o componente raiz em `#app`, define `window.API_URL`.
- `assets/js/app.js` — instância Vue raiz: estado global (`produtos`, `vendas`, `canais`, `tipos`, `taxas`), roteamento simples via `telaAtual` (troca de componente dinâmico, não usa Vue Router), autenticação (`session`, `userRole`).
- `assets/js/api.js` — client HTTP único: injeta `Authorization: Bearer <token>` em toda chamada, normaliza respostas (mojibake de encoding), gerencia JWT em `localStorage`.
- `assets/js/components/*.js` — um componente por tela (Login, Dashboard, Estoque, Vender, Historico, Configuracoes, AnaliseView, EstrategiaAds), registrados em `app.js`.
- `supabase/functions/analisar-anuncio/` — Edge Function Deno, proxy de scraping de anúncios do Mercado Livre (chamada pelo `AnaliseView`).

## Autenticação e autorização

- Login com usuário+senha (convertido para e-mail fake `usuario@meusistema.com`), token JWT emitido pelo backend `.NET` e guardado em `localStorage`.
- **RBAC (Admin/Vendedor) é decidido e validado no backend** (`PerfumeCloudPro.Api`, ver `docs/arquitetura-backend.md` no repo `c:\Projetos\backend`) — o papel vem do claim `role` do JWT. O frontend usa esse papel (`userRole`/`isAdmin`) só para **esconder/mostrar controles de UI**; isso é UX, não segurança — a validação real é o `[Authorize(Roles = "Admin")]` no endpoint correspondente.
- Antes da auditoria de 2026-07, o backend não tinha essa distinção real (todo usuário virava Admin) — corrigido junto com esta auditoria (ver commit `fix(security): implementa RBAC real` no repo do backend).

## Testes (baseline inicial, 2026-07)

Antes desta auditoria, o projeto não tinha `package.json` nem nenhum teste. Foi introduzido **Vitest** rodando à parte do deploy (não adiciona bundler nem etapa de build ao `index.html`/produção — ver `package.json` na raiz). Cobertura inicial: funções puras extraídas de `assets/js/api.js` (normalização de papel, decodificação de sessão a partir do JWT, normalização de texto/mojibake).

## Convenção para novas features

- Um componente por tela, registrado em `assets/js/app.js`, adicionado ao array `menu` se navegável.
- Toda chamada à API passa por `assets/js/api.js` — nunca `fetch` direto num componente.
- Ação Admin-only precisa de gate na UI **e** `[Authorize(Roles = "Admin")]` no endpoint do backend correspondente — nunca confiar só no gate client-side.
- `changes/NNN-nome-da-feature/` a partir de `changes/_template-nova-feature/`, numeração sequencial de 3 dígitos.
