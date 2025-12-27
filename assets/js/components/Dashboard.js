const DashboardView = {
    template: `
    <div class="animate-fade-in space-y-10 max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div class="card">
                <p class="text-[10px] text-emerald-600 font-bold uppercase mb-2">Lucro Total</p>
                <p class="text-4xl font-bold tracking-tighter text-slate-900">R$ {{ kpis.lucro.toFixed(2) }}</p>
            </div>
            <div class="card">
                <p class="text-[10px] text-accent font-bold uppercase mb-2">Faturamento</p>
                <p class="text-4xl font-bold tracking-tighter text-slate-900">R$ {{ kpis.faturamento.toFixed(2) }}</p>
            </div>
            <div class="card">
                <p class="text-[10px] text-purple-600 font-bold uppercase mb-2">Vendas</p>
                <p class="text-4xl font-bold tracking-tighter text-slate-900">{{ kpis.qtdVendas }}</p>
            </div>
        </div>

        <div class="card flex flex-col md:flex-row items-center gap-16">
            <div class="w-72 h-72 shrink-0">
                <canvas id="pieChart"></canvas>
            </div>
            <div class="flex-1 w-full space-y-4">
                <h3 class="font-bold text-lg mb-6 text-slate-900">Top Perfumes Vendidos (Lucro)</h3>
                <div v-for="(item, idx) in topCinco" :key="idx" 
                     class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span class="font-semibold text-slate-700">{{ item.nome }}</span>
                    <span class="font-bold text-primary">R$ {{ item.valor.toFixed(2) }}</span>
                </div>
                
                <div v-if="topCinco.length === 0" class="text-center py-10 text-gray-400 italic">
                    Nenhuma venda registrada para gerar o gráfico.
                </div>
            </div>
        </div>
    </div>`,
    props: ['kpis', 'vendas'],
    data() { 
        return { 
            chart: null 
        } 
    },
    watch: {
        // Observa a chegada dos dados das vendas
        vendas: {
            handler(novasVendas) {
                if (novasVendas && novasVendas.length > 0) {
                    // Espera o Vue atualizar o DOM antes de renderizar o Chart.js
                    this.$nextTick(() => {
                        this.render();
                    });
                }
            },
            immediate: true // Executa a lógica assim que o componente é criado
        }
    },
    computed: {
        topCinco() {
            if (!this.vendas || this.vendas.length === 0) return [];
            
            const grupos = {};
            this.vendas.forEach(v => { 
                const nome = v.nome_produto_snapshot || 'Desconhecido';
                grupos[nome] = (grupos[nome] || 0) + (v.lucro_liquido || 0); 
            });

            return Object.entries(grupos)
                .sort((a, b) => b[1] - a[1]) // Ordena pelo maior lucro
                .slice(0, 5) // Pega os 5 melhores
                .map(s => ({ nome: s[0], valor: s[1] }));
        }
    },
    methods: {
        render() {
            const ctx = document.getElementById('pieChart');
            if (!ctx || this.topCinco.length === 0) return;
            
            // Destrói o gráfico anterior se ele já existir para evitar sobreposição
            if (this.chart) {
                this.chart.destroy();
            }
            
            this.chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: this.topCinco.map(p => p.nome),
                    datasets: [{
                        data: this.topCinco.map(p => p.valor),
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                        borderWidth: 2,
                        hoverOffset: 10
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    cutout: '65%', 
                    plugins: { 
                        legend: { display: false } 
                    } 
                }
            });
        }
    },
    beforeUnmount() {
        // Limpa o gráfico da memória ao sair da tela
        if (this.chart) {
            this.chart.destroy();
        }
    }
};

export default DashboardView;