---
name: vue-code-review
description: Use ao revisar mudanças em componentes Vue 3 (Options API, CDN, sem build) deste projeto — erros engolidos, duplicação, mutação de estado, memory leaks.
---

# Revisão de código — Vue 3 (Options API, sem build)

Ao revisar um componente (`assets/js/components/*.js`) ou `app.js`/`api.js`, verifique especificamente:

1. `catch` que só faz `console.error(err)` sem avisar o usuário (via `this.$emit('notificar', ...)` ou equivalente) — o usuário fica sem feedback de que a ação falhou. Toda ação que muta dado (criar/editar/excluir) precisa notificar sucesso E falha.
2. Bloco `finally` que fecha modal/reseta estado mesmo quando a operação falhou — isso engana o usuário fazendo parecer que a ação teve sucesso. Só feche/resete no caminho de sucesso.
3. Promises sem tratamento de erro (`navigator.clipboard.writeText(...)` sem `.catch`, `fetch` sem `try/catch` ao redor).
4. Lógica de negócio duplicada entre componentes (ex: cálculo de lucro, identificação de canal por ID mágico como `canalId === 2`) — candidata a virar um util compartilhado em `assets/js/`. Nunca hardcode um ID de canal/tipo; resolva pelo nome ou por uma constante nomeada.
5. `setInterval`/`setTimeout`/listener registrado em `mounted()` sem limpeza correspondente em `unmounted()`/`beforeUnmount()` — memory leak ao navegar entre telas.
6. Mutação direta de uma prop recebida do componente pai (Vue avisa em dev, mas confirme que o dado é sempre emitido de volta via `$emit`, nunca reatribuído localmente).
7. Campo de formulário (`accept=".csv,.xlsx"`, `type="file"`) sem validação real de tipo/tamanho antes do upload — o atributo HTML é só uma dica de UI, trivialmente contornável.
8. Dead code: dado declarado em `data()` que nunca é lido em nenhum lugar do template ou de outro método.
