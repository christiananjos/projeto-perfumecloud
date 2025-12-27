# ☁️ PerfumeCloud Pro

O **PerfumeCloud Pro** é um sistema de gestão de estoque e vendas de perfumes de alta performance, projetado para revendedores que utilizam plataformas como o Mercado Livre. O sistema oferece uma interface moderna, cálculos automáticos de lucro e integração em tempo real com o banco de dados.

## 🚀 Tecnologias Utilizadas

* **Vue.js 3:** Framework Progressivo para a interface reativa e modular.
* **Supabase:** Backend-as-a-Service (BaaS) para autenticação e banco de dados PostgreSQL.
* **Tailwind CSS:** Framework de estilização utilitária para um design moderno e responsivo.
* **Chart.js:** Visualização de dados para o Dashboard de lucros.
* **FontAwesome:** Ícones vetoriais para a interface.

---

## 📂 Estrutura de Arquivos

A arquitetura foi migrada para um modelo modular baseado em componentes para facilitar a manutenção:

```text
/
├── index.html              # Arquivo principal e configuração do Supabase
├── assets/
│   ├── css/
│   │   └── style.css       # Estilização global e customizações
│   └── js/
│       ├── app.js          # Motor principal (Vue App) e Gerenciamento de Estado
│       └── components/     # Componentes modulares (Telas)
│           ├── Login.js      # Autenticação de usuários
│           ├── Dashboard.js  # Gráficos e indicadores (KPIs)
│           ├── Vender.js     # PDV com cálculo automático de lucro e taxas
│           ├── Estoque.js    # Gestão de produtos (CRUD e Inspirações)
│           └── Historico.js  # Registro de vendas e rastreio de encomendas