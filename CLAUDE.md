# PerfumeCloud Pro — Frontend

## Visão geral
SPA de gestão de vendas/estoque/precificação de perfumes (canais Mercado Livre e Shopee). Construído com **Vue 3 via CDN**, **Tailwind CSS (CDN)**, Chart.js e Font Awesome — **sem etapa de build, sem `package.json`** até a introdução dos testes (ver `docs/arquitetura-frontend.md`). Serve arquivos estáticos direto; consome a API do backend .NET (`PerfumeCloudPro.Api`, repositório separado em `c:\Projetos\backend`).

A arquitetura já está em uso neste projeto e está documentada em `docs/arquitetura-frontend.md`. A skill `vue-scaffolding` deve ler esse arquivo diretamente ao criar novos componentes.

## Comandos úteis
- Servir localmente: `python -m http.server 8000` ou `npx serve` (não há build).
- `supabase start` — inicia Postgres + API local para as Edge Functions.
- `npm test` — testes unitários (Vitest), rodam à parte do deploy estático (ver `docs/arquitetura-frontend.md`).

## Convenções
- Um componente por tela em `assets/js/components/`, registrado em `assets/js/app.js`.
- Toda chamada à API passa por `assets/js/api.js` — nunca `fetch` direto num componente.
- Options API (Vue), não misturar com Composition API/`<script setup>`.
- `changes/NNN-nome-da-feature/` a partir de `changes/_template-nova-feature/` para novas features, numeração sequencial de 3 dígitos.

## Notas para o Claude
- **RBAC é validado no backend, não aqui.** Todo gate de UI (`v-if="isAdmin"`) precisa ter o endpoint correspondente com `[Authorize(Roles = "Admin")]` no backend — um gate só no frontend não é segurança (ver skill `vue-security-audit` e `docs/arquitetura-frontend.md`).
- Hook de segurança em `.claude/hooks/check-secrets-before-commit.sh` bloqueia `git commit` se o diff staged parecer conter segredo — heurística, não substitui revisão manual.
- Erros de API sempre viram feedback visível ao usuário, nunca só `console.error` silencioso.
