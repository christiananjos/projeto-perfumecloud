import { db } from './database.js';
import { APP_CONFIG } from './config.js';

const { createApp, nextTick } = Vue;

createApp({
    data() {
        return {
            loading: false, telaAtual: 'dashboard', menuAberto: false, modalAberto: false,
            isMobile: window.innerWidth < 1024,
            produtos: [], vendas: [],
            vendaInput: { produtoId: '', precoVenda: null, quantidade: 1, precoUnitarioBase: 0, mlOrderId: '', trackingCode: '' },
            filtrosEstoque: { termo: '', precoMax: null },
            currentPage: 1, itemsPerPage: 10,
            novoProduto: { id: null, nome: '', custo: null, inspiracao: '', preco_suger_ml: null },
            dashboardData: { topProdutos: [], cores: APP_CONFIG.CORES },
            pieChartInstance: null,
            feedback: { aberto: false, titulo: '', mensagem: '' },
            confirmDialog: { aberto: false, mensagem: '', acaoConfirmada: null }
        }
    },
    watch: {
        // CÁLCULO AUTOMÁTICO (Margem 30% + Taxa ML)
        'novoProduto.custo'(novoCusto) {
            if (novoCusto > 0 && !this.novoProduto.id) {
                const taxaML = 60.00;
                const margemLucro = 1.30;
                this.novoProduto.preco_suger_ml = parseFloat((novoCusto * margemLucro + taxaML).toFixed(2));
            }
        }
    },
    computed: {
        kpis() {
            const luc = this.vendas.reduce((a, v) => a + (v.lucro_liquido || 0), 0);
            const fat = this.vendas.reduce((a, v) => a + (v.faturamento_total || 0), 0);
            return { lucro: luc, faturamento: fat, qtdVendas: this.vendas.length };
        },
        produtosFiltrados() {
            return this.produtos.filter(p => {
                const busca = (this.filtrosEstoque.termo || '').toLowerCase();
                const termoOk = p.nome.toLowerCase().includes(busca) || (p.inspiracao && p.inspiracao.toLowerCase().includes(busca));
                const precoOk = !this.filtrosEstoque.precoMax || p.custo <= this.filtrosEstoque.precoMax;
                return termoOk && precoOk;
            });
        },
        totalPages() { return Math.ceil(this.produtosFiltrados.length / this.itemsPerPage) || 1; },
        produtosPaginados() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.produtosFiltrados.slice(start, start + this.itemsPerPage);
        },
        itemsRange() {
            const start = (this.currentPage - 1) * this.itemsPerPage + 1;
            const end = Math.min(this.currentPage * this.itemsPerPage, this.produtosFiltrados.length);
            return this.produtosFiltrados.length > 0 ? `${start}-${end}` : '0-0';
        },
        produtoSelecionado() { return this.produtos.find(p => p.id === this.vendaInput.produtoId); }
    },
    methods: {
        formatarMoeda(v) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0); },
        navegar(t) { 
            this.telaAtual = t; 
            if(this.isMobile) this.menuAberto = false; 
            if(t === 'dashboard') nextTick(() => this.renderizarGrafico());
        },
        mudarPagina(dir) { 
            const novaPag = this.currentPage + dir;
            if (novaPag >= 1 && novaPag <= this.totalPages) this.currentPage = novaPag;
        },
        async carregarDados() {
            this.loading = true;
            try {
                const [p, v] = await Promise.all([db.getProdutos(), db.getVendas()]);
                this.produtos = p; this.vendas = v;
                if(this.telaAtual === 'dashboard') nextTick(() => this.renderizarGrafico());
            } catch(e) { console.error(e); } finally { this.loading = false; }
        },
        abrirRastreio(codigo) { window.open(`https://api.linkrastreio.com.br/rastreio?id=${codigo}`, '_blank'); },
        abrirModalNovo() { this.novoProduto = { id: null, nome: '', custo: null, inspiracao: '', preco_suger_ml: null }; this.modalAberto = true; },
        abrirModalEdicao(p) { this.novoProduto = { ...p }; this.modalAberto = true; },
        async salvarProduto() {
            this.loading = true;
            try {
                const { error } = await db.salvarProduto(this.novoProduto);
                if(error) throw error;
                this.modalAberto = false; await this.carregarDados();
                this.feedback = { aberto: true, titulo: 'Sucesso', mensagem: 'Estoque atualizado.' };
            } catch(e) { alert(e.message); } finally { this.loading = false; }
        },
        confirmarExcluirProduto(id) {
            this.confirmDialog = {
                aberto: true, mensagem: 'Remover perfume permanentemente?',
                acaoConfirmada: async () => {
                    this.confirmDialog.aberto = false; this.loading = true;
                    await db.excluirProduto(id); await this.carregarDados();
                    this.feedback = { aberto: true, titulo: 'Removido', mensagem: 'Produto excluído.' };
                }
            };
        },
        confirmarExcluirVenda(id) {
            this.confirmDialog = {
                aberto: true, mensagem: 'Excluir registro de venda?',
                acaoConfirmada: async () => {
                    this.confirmDialog.aberto = false; this.loading = true;
                    await db.deletarVenda(id); await this.carregarDados();
                    this.feedback = { aberto: true, titulo: 'Removido', mensagem: 'Venda excluída.' };
                }
            };
        },
        aplicarPrecoSugerido() {
            if(this.produtoSelecionado) {
                this.vendaInput.precoUnitarioBase = this.produtoSelecionado.preco_suger_ml || 0;
                this.vendaInput.precoVenda = this.vendaInput.precoUnitarioBase * this.vendaInput.quantidade;
            }
        },
        alterarQuantidade(v) {
            if(this.vendaInput.quantidade + v >= 1) {
                this.vendaInput.quantidade += v;
                this.vendaInput.precoVenda = (this.vendaInput.precoUnitarioBase || 0) * this.vendaInput.quantidade;
            }
        },
        async confirmarVenda() {
            if (!this.vendaInput.produtoId || !this.vendaInput.precoVenda) return;
            this.loading = true;
            try {
                const qtd = this.vendaInput.quantidade;
                const total = this.vendaInput.precoVenda;
                const unitario = total / qtd;
                const lucro = total - (this.produtoSelecionado.custo * qtd) - (60 * qtd);
                const { error } = await db.registrarVenda({
                    produto_id: this.vendaInput.produtoId,
                    nome_produto_snapshot: this.produtoSelecionado.nome,
                    quantidade: qtd,
                    preco_venda_unitario: unitario,
                    faturamento_total: total,
                    lucro_liquido: lucro,
                    ml_order_id: this.vendaInput.mlOrderId,
                    tracking_code: this.vendaInput.trackingCode.toUpperCase()
                });
                if(error) throw error;
                this.vendaInput = { produtoId: '', precoVenda: null, quantidade: 1, precoUnitarioBase: 0, mlOrderId: '', trackingCode: '' };
                await this.carregarDados();
                this.feedback = { aberto: true, titulo: 'Venda Salva!', mensagem: 'Registrado com sucesso.' };
            } catch(e) { alert("Erro: " + e.message); } finally { this.loading = false; }
        },
        renderizarGrafico() {
            const ctx = document.getElementById('pieChart');
            if(!ctx || this.vendas.length === 0) return;
            if(this.pieChartInstance) this.pieChartInstance.destroy();
            const grupos = {};
            this.vendas.forEach(v => { grupos[v.nome_produto_snapshot] = (grupos[v.nome_produto_snapshot] || 0) + v.lucro_liquido; });
            const sorted = Object.entries(grupos).sort((a,b) => b[1]-a[1]).slice(0, 5);
            this.dashboardData.topProdutos = sorted.map(s => ({ nome: s[0], valor: s[1] }));
            this.pieChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: { labels: sorted.map(s=>s[0]), datasets: [{ data: sorted.map(s=>s[1]), backgroundColor: this.dashboardData.cores, borderWidth: 2, borderColor: '#ffffff' }] },
                options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }
            });
        }
    },
    mounted() { this.carregarDados(); }
}).mount('#app');