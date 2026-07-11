# PerfumeCloud Pro — Frontend

## Visão geral
SPA de gestão de vendas/estoque/precificação de perfumes (canais Mercado Livre e Shopee). Construído com **Vue 3 via CDN** (sem bundler para JS — ES modules direto no navegador) e **Tailwind CSS via CLI** (CSS gerado no CI a cada deploy, ver `docs/arquitetura-frontend.md`). Consome a API do backend .NET (`PerfumeCloudPro.Api`, repositório separado em `c:\Projetos\backend`) para **todas** as funções — o frontend não depende mais de Supabase (removido nesta base).

A arquitetura já está em uso neste projeto e está documentada em `docs/arquitetura-frontend.md`. A skill `vue-scaffolding` deve ler esse arquivo diretamente ao criar novos componentes.

## Comandos úteis
- `npm run build:css` — gera o CSS do Tailwind (necessário antes de servir localmente, já que não há mais CDN do Tailwind).
- Servir localmente: `npx serve -l 3000` (ou `python -m http.server 3000`) — **use a porta 3000** (ou 5173/5500), o CORS do backend não libera a porta 8000.
- `npm test` — testes unitários (Vitest).
- `npm run test:e2e` — testes e2e (Playwright) contra o backend real; exige backend rodando e credenciais de teste em variáveis de ambiente (ver `docs/arquitetura-frontend.md`).

## Convenções
- Um componente por tela em `assets/js/components/`, registrado em `assets/js/app.js`.
- Toda chamada à API passa por `assets/js/api.js` — nunca `fetch` direto num componente.
- Options API (Vue), não misturar com Composition API/`<script setup>`.
- `changes/NNN-nome-da-feature/` a partir de `changes/_template-nova-feature/` para novas features, numeração sequencial de 3 dígitos.

## Notas para o Claude
- **RBAC é validado no backend, não aqui.** Todo gate de UI (`v-if="isAdmin"`) precisa ter o endpoint correspondente com `[Authorize(Roles = "Admin")]` no backend — um gate só no frontend não é segurança (ver skill `vue-security-audit` e `docs/arquitetura-frontend.md`).
- Hook de segurança em `.claude/hooks/check-secrets-before-commit.sh` bloqueia `git commit` se o diff staged parecer conter segredo — heurística, não substitui revisão manual.
- Erros de API sempre viram feedback visível ao usuário, nunca só `console.error` silencioso.
