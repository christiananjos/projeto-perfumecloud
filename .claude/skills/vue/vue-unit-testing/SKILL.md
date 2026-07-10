---
name: vue-unit-testing
description: Use ao escrever ou revisar testes unitários neste frontend (Vitest). Projeto não tem etapa de build em produção — os testes rodam à parte, via Node, e não afetam o deploy estático.
---

# Testes unitários — Vitest (projeto sem build em produção)

1. Os testes vivem em `assets/js/**/*.test.js` (ou pasta `tests/`, conforme convenção já estabelecida no projeto) e rodam com `npm test` (Vitest) — isso não introduz uma etapa de build no deploy: o `index.html` continua carregando os arquivos `.js` direto via `<script type="module">`, sem bundler.
2. Priorize testar lógica pura extraída para funções (ex: `normalizeRole`, `buildSessionFromToken`, cálculo de preço sugerido, normalização de texto) — são as partes de maior valor e mais fáceis de isolar, já que os componentes Vue aqui não têm um harness de montagem (sem `@vue/test-utils`/JSDOM configurado seria um passo à parte, maior).
3. Siga o padrão AAA (Arrange, Act, Assert) e nomeie o teste descrevendo cenário e resultado esperado.
4. Use `describe`/`it` com casos parametrizados (`it.each`) em vez de duplicar testes quase idênticos.
5. Não teste o Vue em si (ex: se `v-if` funciona) — isso é responsabilidade do framework. Teste a lógica que o projeto escreveu.
6. Ao extrair uma função para tornar algo testável, prefira `export function` em vez de reimplementar a lógica no teste — o teste deve validar o código real usado pelo componente, nunca uma cópia.
7. Rode `npm test -- --coverage` antes de considerar a tarefa concluída; não persiga 100% — cubra os caminhos de decisão relevantes (erro, borda, fallback), não getters triviais.
