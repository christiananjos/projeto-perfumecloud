const DashboardView = {
    template: `
    <div class="animate-fade-in space-y-8 max-w-6xl mx-auto">
        <div v-if="kpis" class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div class="card bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                <p class="text-[10px] text-emerald-600 font-bold uppercase mb-2">Lucro Total</p>
                <p class="text-3xl font-bold text-slate-900">R$ {{ Number(kpis.lucro || 0).toFixed(2) }}</p>
            </div>
            <div class="card bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                <p class="text-[10px] text-blue-600 font-bold uppercase mb-2">Faturamento</p>
                <p class="text-3xl font-bold text-slate-900">R$ {{ Number(kpis.faturamento || 0).toFixed(2) }}</p>
            </div>
            <div class="card bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                <p class="text-[10px] text-purple-600 font-bold uppercase mb-2">Vendas</p>
                <p class="text-3xl font-bold text-slate-900">{{ kpis.qtdVendas || 0 }}</p>
            </div>
        </div>

        <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col lg:flex-row items-center gap-12">
            <div class="w-64 h-64 shrink-0">
                <canvas id="pieChart"></canvas>
            </div>
            <div class="flex-1 w-full space-y-3 text-left">
                <h3 class="font-bold text-lg mb-4 text-slate-900">Top 5 Perfumes (Lucro)</h3>
                <div v-for="(item, idx) in topCinco" :key="idx" 
                     class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span class="font-semibold text-slate-600 text-sm">{{ item.nome }}</span>
                    <span class="font-bold text-blue-600">R$ {{ Number(item.valor).toFixed(2) }}</span>
                </div>
            </div>
        </div>
    </div>`,
    props: ['kpis', 'vendas', 'produtos'],
    data() { return { chart: null } },
    watch: {
        vendas: {
            handler(v) {
                if (v && v.length > 0) {
                    this.$nextTick(() => this.render());
                }
            },
            immediate: true,
            deep: true
        }
    },
    computed: {
        topCinco() {
            if (!this.vendas || this.vendas.length === 0) return [];
            const grupos = {};
            this.vendas.forEach(v => { 
                const nome = v.nome_produto_snapshot || 'Produto';
                const lucro = Number(v.lucro_liquido || 0);
                grupos[nome] = (grupos[nome] || 0) + lucro; 
            });
            return Object.entries(grupos)
                .sort((a,b) => b[1] - a[1])
                .slice(0, 5)
                .map(s => ({ nome: s[0], valor: s[1] }));
        }
    },
    methods: {
        render() {
            const ctx = document.getElementById('pieChart');
            if(!ctx || this.topCinco.length === 0) return;
            if(this.chart) this.chart.destroy();
            this.chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: this.topCinco.map(p => p.nome),
                    datasets: [{
                        data: this.topCinco.map(p => p.valor),
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                        borderWidth: 0
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    cutout: '75%', 
                    plugins: { legend: { display: false } } 
                }
            });
        }
    }
};
export default DashboardView;