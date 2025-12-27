const DashboardView = {
    template: `
    <div class="animate-fade-in space-y-10 max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div class="card"><p class="text-[10px] text-emerald-600 font-bold uppercase mb-2">Lucro Total</p><p class="text-4xl font-bold tracking-tighter text-slate-900">R$ {{ kpis.lucro.toFixed(2) }}</p></div>
            <div class="card"><p class="text-[10px] text-accent font-bold uppercase mb-2">Faturamento</p><p class="text-4xl font-bold tracking-tighter text-slate-900">R$ {{ kpis.faturamento.toFixed(2) }}</p></div>
            <div class="card"><p class="text-[10px] text-purple-600 font-bold uppercase mb-2">Vendas</p><p class="text-4xl font-bold tracking-tighter text-slate-900">{{ kpis.qtdVendas }}</p></div>
        </div>
        <div class="card flex flex-col md:flex-row items-center gap-16">
            <div class="w-72 h-72 shrink-0"><canvas id="pieChart"></canvas></div>
            <div class="flex-1 w-full space-y-4">
                <h3 class="font-bold text-lg mb-6 text-slate-900">Top Perfumes Vendidos</h3>
                <div v-for="(item, idx) in topCinco" :key="idx" class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span class="font-semibold text-slate-700">{{ item.nome }}</span>
                    <span class="font-bold text-primary">R$ {{ item.valor.toFixed(2) }}</span>
                </div>
            </div>
        </div>
    </div>`,
    props: ['kpis', 'vendas'],
    data() { return { chart: null } },
    computed: {
        topCinco() {
            const grupos = {};
            this.vendas.forEach(v => { grupos[v.nome_produto_snapshot] = (grupos[v.nome_produto_snapshot] || 0) + v.lucro_liquido; });
            return Object.entries(grupos).sort((a,b) => b[1]-a[1]).slice(0, 5).map(s => ({ nome: s[0], valor: s[1] }));
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
                        borderWidth: 2
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }
            });
        }
    },
    mounted() { setTimeout(() => this.render(), 300); }
};
export default DashboardView;