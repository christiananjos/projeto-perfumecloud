# Arquitetura do Frontend — PerfumeCloud Pro

> Documentado retroativamente a partir do código existente em 2026-07. Não foi escolhida via bootstrap do zero — o projeto já estava implementado quando esta documentação foi criada.

## Padrão

SPA em **Vue 3 (Options API)**, carregado via `<script>` de CDN (`unpkg.com/vue@3.4.38`, com SRI) — **sem bundler de JS**. Chart.js e Font Awesome também via CDN com SRI. **Tailwind CSS é gerado via CLI** (`npm run build:css`), não é mais carregado do Play CDN — o CSS gerado (`assets/css/tailwind.css`) não é commitado.

**Deploy**: Azure Static Web Apps, workflow gerado automaticamente pelo próprio Azure ao conectar o recurso ao repositório GitHub (`.github/workflows/azure-static-web-apps-*.yml`) — comando de build customizado `npm run build:css`, app location `/`. **Importante**: existia um `deploy.yml` antigo apontando para uma Azure App Service chamada `marketplacemanagement` — só que esse é o nome do recurso do **backend** (.NET API, ver `master_marketplacemanagement.yml` no repo do backend); rodar aquele workflow teria sobrescrito o deploy da API com os arquivos estáticos do frontend. Removido junto com `nginx.conf` (que era da mesma abordagem abandonada, App Service com container).

## Estrutura

- `index.html` — shell da SPA, monta o componente raiz em `#app`, define `window.API_URL`.
- `assets/js/app.js` — instância Vue raiz: estado global (`produtos`, `vendas`, `canais`, `tipos`, `taxas`), roteamento simples via `telaAtual` (troca de componente dinâmico, não usa Vue Router), autenticação (`session`, `userRole`).
- `assets/js/api.js` — client HTTP único: injeta `Authorization: Bearer <token>` em toda chamada, normaliza respostas (mojibake de encoding), gerencia JWT em `localStorage`.
- `assets/js/components/*.js` — um componente por tela (Login, Dashboard, Estoque, Vender, Historico, Configuracoes, AnaliseView, EstrategiaAds), registrados em `app.js`.

**Sem dependência de Supabase**: todas as telas consomem exclusivamente a API do backend .NET via `assets/js/api.js`. O Scanner ML (`AnaliseView`) chamava antes uma Supabase Edge Function (`window.supabase.functions.invoke(...)`); essa lógica (allowlist de domínios do Mercado Livre + scraping/parsing do HTML) foi portada para `POST /api/analise-anuncio` no backend (`PerfumeCloudPro.Infrastructure/MercadoLivre/AnaliseAnuncioService.cs`, ver `docs/arquitetura-backend.md` no repo do backend). **Achado da migração**: `window.supabase` nunca foi inicializado em lugar nenhum do projeto (nenhum script carregava `@supabase/supabase-js`) — o Scanner ML já estava quebrado em produção (lançaria `TypeError`) antes desta migração, então não havia comportamento funcional a preservar, só a recriar corretamente.

## Autenticação e autorização

- Login com usuário+senha (convertido para e-mail fake `usuario@meusistema.com`), token JWT emitido pelo backend `.NET` e guardado em `localStorage`.
- **RBAC (Admin/Vendedor) é decidido e validado no backend** (`PerfumeCloudPro.Api`, ver `docs/arquitetura-backend.md` no repo `c:\Projetos\backend`) — o papel vem do claim `role` do JWT. O frontend usa esse papel (`userRole`/`isAdmin`) só para **esconder/mostrar controles de UI**; isso é UX, não segurança — a validação real é o `[Authorize(Roles = "Admin")]` no endpoint correspondente.
- Antes da auditoria de 2026-07, o backend não tinha essa distinção real (todo usuário virava Admin) — corrigido junto com esta auditoria (ver commit `fix(security): implementa RBAC real` no repo do backend).

## Testes (baseline inicial, 2026-07)

Antes desta auditoria, o projeto não tinha `package.json` nem nenhum teste. Foi introduzido **Vitest** rodando à parte do deploy (não adiciona bundler nem etapa de build ao `index.html`/produção — ver `package.json` na raiz, cuja única finalidade é rodar os testes). Rodar com `npm test` (ou `npm run test:coverage` para relatório de cobertura).

- `assets/js/venda-utils.test.js` — 100% de cobertura em `canalLabel`, `precoSugeridoPorCanal`, `custoProduto`, `calcularLucroVenda` (inclui teste de regressão do número mágico `canalId === 2` removido na revisão de código).
- `assets/js/api.test.js` — `normalizeRole`, `normalizeText` (correção de mojibake) e `buildSessionFromToken`, incluindo teste de regressão do fallback de papel inseguro (`"vendedor"` em vez de `"admin"` quando o JWT não tem claim de papel).
- **Não testado por escolha**: os wrappers HTTP (`apiGet`/`apiPost`/.../`loginApi`) — são finos o suficiente (delegam a `fetch`) que testá-los exigiria mockar rede sem validar lógica de negócio real; ficam para uma eventual suíte de integração/e2e contra um backend real ou mockado.

## Achados de segurança e recomendações (auditoria 2026-07)

- **SSRF na Edge Function `analisar-anuncio`** — aceitava qualquer `url` do cliente e fazia `fetch` no servidor sem validar domínio (`verify_jwt=true` não protege, pois a anon key é pública). Corrigido: `isAllowedUrl()` restringe a domínios do Mercado Livre (`mercadolivre.com.br` e subdomínios) e exige HTTPS antes de qualquer fetch. **Atualização**: a Edge Function foi removida (ver seção "Estrutura" acima) — essa mesma validação de allowlist agora vive em `AnaliseAnuncioService.IsAllowedUrl` no backend .NET.
- **Fallback de papel inseguro** — `api.js` (`buildSessionFromToken`) e `Login.js` tratavam a ausência do claim `role` no JWT como `"admin"`, dando privilégio máximo por padrão. Corrigido para usar o fallback já seguro de `normalizeRole` (`"vendedor"`).
- **CDNs sem versão fixa nem SRI** — Vue, Chart.js e Font Awesome carregam de versão fixa (`vue@3.4.38`, `chart.js@4.4.4`, `font-awesome@6.4.0`) com `integrity`+`crossorigin`. **Tailwind não pôde receber SRI enquanto era Play CDN** (`cdn.tailwindcss.com` não envia `Access-Control-Allow-Origin`, `crossorigin="anonymous"` bloqueava o carregamento por CORS). **Atualização**: migrado para Tailwind CLI (`npm run build:css`, gerado no CI) — o problema de SRI/CORS deixa de existir porque o CSS agora é um asset do próprio domínio, não um script de terceiro.
- **RBAC client-side (`isAdmin`) é só UI** — ver seção "Autenticação e autorização" acima. Validado e corrigido no backend nesta mesma auditoria.
- **Historico.js**: botão de editar venda não tinha nenhum gate de `isAdmin` (nem visual) — qualquer usuário logado via UI conseguia abrir a edição. Corrigido na revisão de código (ver commit de code review).
- JWT em `localStorage` — aceito como trade-off do projeto (SPA sem cookie httpOnly); mitigação é nunca introduzir `v-html` com dado não confiável (ver skill `vue-security-audit`).

## Build do CSS (Tailwind CLI, 2026-07)

- Fonte: `assets/css/tailwind.src.css` (diretivas `@tailwind base/components/utilities`). `tailwind.config.js` escaneia `./index.html` **e** `./assets/js/**/*.js` — os templates Vue ficam como string dentro dos `.js` (`template: \`...\``), então o scanner de conteúdo do Tailwind precisa cobrir esses arquivos, não só o HTML.
- Gerado: `assets/css/tailwind.css` (minificado, via `npm run build:css`) — **não commitado** (`.gitignore`), gerado no CI a cada deploy pelo workflow do Azure Static Web Apps (comando de build customizado `npm run build:css`).
- **Rodar localmente**: `npm run build:css` antes de servir os arquivos estáticos, ou `npm run watch:css` em paralelo durante desenvolvimento (o CSS não fica mais disponível "de graça" via CDN).
- Ordem de carregamento em `index.html`: `tailwind.css` antes de `style.css` (customizações do projeto podem sobrescrever utilitários do Tailwind por cascata).
- Risco conhecido: o scanner de conteúdo do Tailwind não detecta classes montadas dinamicamente via concatenação de string em runtime (ex: `'bg-' + cor + '-500'`) — verificado nesta migração que o projeto não usa esse padrão (só bindings de `:style` com `corHex`/`cor_hex`, não classes Tailwind dinâmicas).

## Revisão de código (auditoria 2026-07)

- **`assets/js/venda-utils.js` (novo)** — extrai lógica antes duplicada entre `Vender.js` e o modal "Venda Rápida" de `Historico.js` (`canalLabel`, `precoSugeridoPorCanal`, `custoProduto`, `calcularLucroVenda`). Elimina o número mágico `canalId === 2` (assumia Shopee = ID 2, frágil já que canais são criados dinamicamente em `Configuracoes.js`) — agora resolve pelo nome do canal.
- **`Historico.js`**: botão de editar venda não tinha nenhum gate de admin (nem visual); adicionado. `confirmarExclusao` fechava o modal mesmo quando a exclusão falhava (parecia ter funcionado); corrigido para só fechar no sucesso. `confirmarEdicao`/`confirmarExclusao`/`copiarCodigo` só logavam no console sem avisar o usuário; agora emitem `notificar` de erro.
- **`Configuracoes.js`**: `adicionarCanal`/`excluirCanal`/`adicionarTipo`/`excluirTipo` não tinham checagem de `isAdmin` (só o botão ficava escondido); adicionado guard nos métodos. Todos os `catch` silenciosos agora notificam o usuário.
- **`Estoque.js`**: `excluir` não tratava erro da API (exceção não tratada, sem feedback); corrigido com try/catch + notificação, e guard de `isAdmin` no método.
- **`AnaliseView.js`**: erro do Scanner era descartado (`throw new Error()` sem mensagem, `catch` só mostrava alerta genérico); agora loga o erro real e propaga a mensagem quando disponível. `Object.values(data.alertas_criticos)` podia estourar se o campo viesse ausente da API — corrigido com fallback `{}`.
- **`EstrategiaAds.js`**: upload de relatório não validava tipo/tamanho do arquivo antes de enviar (só o atributo `accept` do input, trivialmente contornável) — adicionada validação de extensão e tamanho máximo (10MB). Removido campo `estoqueParado` (dead code, nunca vinculado a nenhum input do template).
- **`Login.js`**: `mounted()` sempre mostrava "Usuário desconectado", mesmo no primeiro carregamento da página (nunca logout de verdade). Corrigido com uma flag em `sessionStorage` setada por `fazerLogout()` em `app.js`, consumida uma única vez.
- Verificado com smoke test headless (Playwright) após as mudanças: app carrega sem erros de console, tela de login renderiza corretamente.

## Convenção para novas features

- Um componente por tela, registrado em `assets/js/app.js`, adicionado ao array `menu` se navegável.
- Toda chamada à API passa por `assets/js/api.js` — nunca `fetch` direto num componente.
- Ação Admin-only precisa de gate na UI **e** `[Authorize(Roles = "Admin")]` no endpoint do backend correspondente — nunca confiar só no gate client-side.
- `changes/NNN-nome-da-feature/` a partir de `changes/_template-nova-feature/`, numeração sequencial de 3 dígitos.
