---
name: vue-security-audit
description: Use ao realizar auditoria de segurança neste frontend Vue 3 (CDN, sem build) — XSS, CDNs sem SRI, SSRF em edge functions, RBAC client-side.
---

# Auditoria de segurança — Vue 3 (CDN, sem build)

1. Nunca usar `v-html` com dado vindo da API ou do usuário sem sanitizar — prefira sempre interpolação de texto (`{{ }}`), que o Vue já escapa.
2. Toda tag `<script>`/`<link>` que carrega de CDN externo (unpkg, jsdelivr, cdnjs, tailwindcss.com) deve fixar uma versão exata (nunca `@latest` ou tag sem versão) e, quando o CDN suportar, incluir `integrity` + `crossorigin` (Subresource Integrity). Um CDN comprometido ou um MITM sem SRI executa JS arbitrário na página.
3. Nunca confiar em gate de UI (`v-if="isAdmin"`, `:disabled="!isAdmin"`) como controle de acesso real — é só UX. Toda ação sensível hate no frontend precisa ter o endpoint correspondente validando o mesmo papel no backend (`[Authorize(Roles=...)]` no PerfumeCloudPro.Api). Ao encontrar um gate de UI novo, confirme o endpoint backend correspondente antes de considerar a feature segura.
4. O token JWT fica em `localStorage` (`assets/js/api.js`) — aceito como trade-off deste projeto (SPA sem cookie httpOnly), mas isso significa que qualquer XSS vira roubo de sessão. Reforça a regra 1 (nunca `v-html` sem sanitizar) e a ausência de `eval`/`Function()` sobre dado remoto.
5. Nenhuma Supabase Edge Function (`supabase/functions/*/index.ts`) deve aceitar uma URL/host arbitrário do cliente e fazer `fetch` no servidor sem checar contra uma allowlist de domínios — isso é SSRF. `verify_jwt = true` no `config.toml` não é suficiente sozinho, porque a anon key é pública (embutida no frontend).
6. CORS de Edge Function (`Access-Control-Allow-Origin`) deve ser restrito ao domínio real do frontend em produção, não `'*'`, quando a function expõe dado sensível.
7. Nunca logar token, senha ou payload de autenticação completo no `console.log`/`console.error` — mensagens de erro devem ser genéricas o suficiente para não vazar detalhe de infraestrutura ao usuário final.
