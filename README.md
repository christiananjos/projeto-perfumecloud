# 🧴 PerfumeCloud Pro - Sistema de Gestão de Estoque e Vendas

Sistema web e mobile para gerenciamento de estoque de perfumes importados e árabes, com foco em automação de lucros e controle operacional para Mercado Livre.

## 🚀 Funcionalidades Atualizadas (Dezembro 2025)

- **Controle de Acesso por Nível (RBAC):**
  - **Admin:** Controle total (Inserir, Editar, Excluir, Ajustar Taxas).
  - **Vendedor:** Acesso restrito (Apenas Listagem e Inserção). Botões de edição e exclusão são bloqueados com avisos de permissão.
- **Autenticação por Username:** Sistema de login simplificado usando apenas usuário e senha (sem necessidade de digitar e-mail completo).
- **Cálculo Automatizado de Lucro:** Injeção automática de margem no cadastro de novos itens.
- **Layout Zero Scroll:** Interface otimizada para ocupar 95% da tela vertical, garantindo que os dados principais estejam sempre visíveis sem rolagem em dispositivos móveis.

## 📈 Lógica de Precificação e Lucro

O sistema utiliza uma fórmula global para sugerir o preço de venda no Mercado Livre, garantindo a margem desejada após os custos operacionais.

**Fórmula do Preço Sugerido:**
> `Preço Sugerido = (Custo Base * 1.30) + Taxa Fixa ML`

* **Margem de 30%:** Lucro líquido sobre o valor de custo.
* **Taxa Fixa (R$):** Valor configurável na tela de Ajustes (atualmente definido em **R$ 60,00**).

### Exemplo de Cálculo:
Se um perfume custa **R$ 100,00**:
1.  Lucro (30%): R$ 30,00
2.  Taxa ML: R$ 60,00
3.  **Preço Final: R$ 190,00**

## 🗄️ Estrutura do Banco de Dados (Supabase)

### Tabela `produtos`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | int8 | Identificador único |
| `nome` | text | Nome do Perfume / Marca |
| `custo` | numeric | Preço pago ao fornecedor |
| `inspiracao` | text | Referência olfativa |
| `preco_suger_ml` | numeric | Valor de venda calculado |

### Tabela `vendas`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `produto_id` | int8 | FK para a tabela produtos |
| `nome_produto_snapshot` | text | Nome do item no momento da venda |
| `quantidade` | int4 | Unidades vendidas |
| `preco_venda_unitario`| numeric | Valor real da venda |
| `lucro_liquido` | numeric | Lucro real (Venda - Custo - Taxa) |
| `ml_order_id` | text | ID do pedido no Mercado Livre |
| `tracking_code` | text | Código de rastreio dos Correios |

## 🛠️ Comandos de Manutenção (SQL)

Para resetar todos os preços do estoque conforme a regra de 30% + R$ 60,00:

```sql
UPDATE produtos 
SET preco_suger_ml = ROUND((custo::numeric * 1.30) + 60, 2);