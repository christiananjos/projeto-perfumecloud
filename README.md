# PerfumeCloud Pro — Sistema de Gestão de Vendas

Sistema web para gerenciamento de estoque, vendas e precificação de perfumes nos canais Mercado Livre e Shopee. Construído com Vue 3 via CDN, sem etapa de build.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | Vue 3 (CDN), Tailwind CSS (CDN), Chart.js, Font Awesome 6 |
| Backend | Azure Web Services (API REST) |
| Edge Functions | Supabase + Deno (scraper de anúncios ML) |
| Autenticação | JWT armazenado em localStorage |

---

## Como rodar localmente

O projeto é HTML/JS puro — não há `package.json` nem etapa de build. Basta servir os arquivos estáticos:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Acesse em `http://localhost:8000`.

A URL da API está definida em `index.html`:
```javascript
window.API_URL = 'https://marketplacemanagement-hzhygwdfaxfnbnga.brazilsouth-01.azurewebsites.net'
```

### Supabase local (Edge Functions)

```bash
supabase start   # inicia PostgreSQL + API local
```

---

## Estrutura de arquivos

```
projeto-perfumecloud/
├── index.html                    # SPA principal
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── app.js                # Instância Vue 3 + roteamento
│       ├── api.js                # Client HTTP com JWT
│       └── components/
│           ├── Login.js
│           ├── Dashboard.js
│           ├── Estoque.js
│           ├── Vender.js
│           ├── Historico.js
│           ├── Configuracoes.js
│           ├── AnaliseView.js
│           └── EstrategiaAds.js
└── supabase/
    └── functions/analisar-anuncio/   # Edge Function Deno
```

---

## Módulos do sistema

### Dashboard
KPIs de faturamento, lucro e quantidade de vendas com comparação percentual ao mês anterior. Gráfico de barras (últimos 6 meses) e donut (top 5 produtos por lucro). Filtro por mês.

### Vender
Registro rápido de vendas com autocomplete de produtos. Calcula lucro líquido em tempo real. Aceita Order ID do ML e código de rastreio como campos opcionais.

### Histórico
Lista paginada de vendas com filtro por canal (ML/Shopee) e busca por texto. Admin pode editar e excluir registros.

### Estoque
CRUD de produtos com cálculo automático de preço sugerido para ML e Shopee. Tabela paginada (10/20/50 itens) com filtros por nome e preço.

### Scanner ML (`AnaliseView`)
Analisa anúncios do Mercado Livre via URL. Detecta: produto CBT (China), fora de cobertura de entrega, reputação do vendedor e status Mercado Líder. Usa Supabase Edge Function.

### Estratégia Ads (`EstrategiaAds`)
Upload de relatórios CSV/XLSX de campanhas. Dois modos de análise:
- **Rentabilidade** — margem estável, ROAS conservador
- **Visibilidade** — margem 5%, ROAS agressivo para ranking

### Configurações
Ajuste de taxas globais (comissão % e frete fixo do ML) com aplicação em massa a todos os produtos. Gerenciamento de canais de venda.

---

## Precificação

**Mercado Livre:**
```
Preço Sugerido = (Custo × 1.30) + Taxa Fixa ML
```
Exemplo: custo R$ 100 → margem R$ 30 + taxa R$ 60 = **R$ 190**

**Shopee (4 faixas):**
| Faixa | Comissão | Taxa Fixa |
|---|---|---|
| Até R$ 79,99 | 20% | R$ 4 |
| R$ 80–99,99 | 14% | R$ 16 |
| R$ 100–199,99 | 14% | R$ 20 |
| Acima de R$ 200 | 14% | R$ 26 |

---

## Controle de acesso (RBAC)

| Ação | Admin | Vendedor |
|---|---|---|
| Visualizar dashboard e histórico | ✅ | ✅ |
| Registrar venda | ✅ | ✅ |
| Criar produto | ✅ | ❌ |
| Editar / excluir produto | ✅ | ❌ |
| Ajustar taxas e canais | ✅ | ❌ |
| Editar / excluir venda | ✅ | ❌ |

A role é extraída do claim do JWT retornado pelo backend.

---

## Autenticação

Login com **usuário + senha** (sem e-mail). O frontend converte internamente para `username@meusistema.com` antes de enviar ao backend. O token JWT é armazenado em `localStorage` e enviado em todas as requisições via `Authorization: Bearer <token>`.

---

## Principais endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Autenticação |
| GET/POST | `/api/produtos` | Listar / criar produto |
| PUT | `/api/produtos/:id` | Editar produto |
| PATCH | `/api/produtos/:id/inativar` | Desativar produto |
| GET/POST | `/api/vendas` | Listar / registrar venda |
| PUT/DELETE | `/api/vendas/:id` | Editar / excluir venda |
| GET | `/api/configuracoes` | Obter taxas globais |
| PATCH | `/api/configuracoes/ml/aplicar-em-todos` | Aplicar taxas em massa |
| GET/POST | `/api/canais` | Listar / criar canal |
| PATCH | `/api/canais/:id/desativar` | Desativar canal |
