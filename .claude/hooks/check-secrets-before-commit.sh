#!/usr/bin/env bash
# Hook PreToolUse (matcher: Bash) — bloqueia `git commit` se o diff staged parecer conter segredo.
#
# Isto é um exemplo heurístico (grep por padrões comuns), não uma ferramenta de segurança
# completa. Para cobertura real, considere uma ferramenta dedicada (gitleaks, trufflehog) além
# deste hook. Ajuste os padrões abaixo ao seu projeto.
#
# Verifique também, na documentação atual do Claude Code, os códigos de saída esperados por um
# hook PreToolUse na sua versão instalada (aqui assume-se exit 2 = bloqueia e mostra o motivo ao
# agente; exit 0 = permite).

payload="$(cat)"

# Só age em chamadas de `git commit` — ignora todo o resto do tráfego de PreToolUse:Bash.
echo "$payload" | grep -q '"command"[^}]*git commit' || exit 0

diff="$(git diff --cached 2>/dev/null)"
[ -z "$diff" ] && exit 0

pattern='BEGIN (RSA |EC )?PRIVATE KEY|api[_-]?key["'"'"' ]*[:=]["'"'"' ]*[A-Za-z0-9_-]{16,}|password["'"'"' ]*[:=]["'"'"' ]*[^"'"'"'[:space:]]{4,}|Pwd=[^;]{4,};|AKIA[0-9A-Z]{16}'

if echo "$diff" | grep -Eiq "$pattern"; then
  echo "Commit bloqueado: o diff staged parece conter um segredo (chave de API, senha ou connection string). Remova o segredo (use variável de ambiente / secrets manager) antes de commitar." >&2
  exit 2
fi

exit 0
