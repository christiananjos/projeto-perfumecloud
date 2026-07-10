---
name: vue-scaffolding
description: Use ao criar novos componentes/telas neste frontend Vue 3 (Options API, CDN, sem build), seguindo o padrão de arquitetura já estabelecido no projeto.
---

# Scaffolding de componentes — Vue 3 (Options API, sem build)

## 0. Garantir que a arquitetura do frontend está definida

Verifique se já existe `docs/arquitetura-frontend.md` no projeto.

- **Se existir**: leia-o e siga a convenção registrada.
- **Se não existir**: investigue a estrutura já em uso (`assets/js/app.js`, `assets/js/components/*.js`) antes de inventar um padrão novo, registre o que encontrar em `docs/arquitetura-frontend.md` e só então prossiga.

## Antes de criar um componente novo

1. Um componente por tela/módulo, registrado em `assets/js/app.js` (`components: {...}`) e adicionado ao array `menu` se for uma tela navegável.
2. Siga a Options API (não introduza Composition API/`<script setup>` isolado — misturar os dois estilos no mesmo projeto sem build aumenta a complexidade sem ganho real aqui).
3. Toda chamada à API passa por `assets/js/api.js` (`apiGet`/`apiPost`/`apiPut`/`apiPatch`/`apiDelete`/`apiUpload`) — nunca chame `fetch` diretamente de um componente.
4. Ações que exigem papel Admin devem: (a) esconder o controle na UI com `v-if`/`:disabled` baseado em `userRole`/`isAdmin`, E (b) confirmar que o endpoint correspondente no backend (`PerfumeCloudPro.Api`) tem `[Authorize(Roles = "Admin")]` — um gate só no frontend não é segurança real (ver skill `vue-security-audit`).
5. Erros de API sempre viram feedback visível ao usuário (`this.$emit('notificar', {...})` ou padrão equivalente já usado no componente) — nunca só `console.error`.
6. Lógica de negócio reaproveitável (cálculo, formatação, normalização) vira uma função exportada em um módulo compartilhado (ex: `assets/js/api.js` ou um novo `assets/js/utils.js`), não duplicada componente a componente.
