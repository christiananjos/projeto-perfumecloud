const DashboardView = {
  template: `
    <div class="animate-fade-in space-y-8 max-w-6xl mx-auto">

        <!-- Cabeçalho + filtro de mês -->
        <div class="flex items-center justify-between flex-wrap gap-3">
            <h2 class="text-lg font-bold text-slate-700">Dashboard</h2>
            <div class="flex items-center gap-2">
                <label class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Mês</label>
                <select v-model="mesSelecionado" class="input-soft !py-2 !text-xs font-bold border-slate-200 text-slate-700 rounded-xl">
                    <option v-for="m in mesesOpcoes" :key="m" :value="m">{{ formatarMes(m) }}</option>
                </select>
            </div>
        </div>

        <!-- KPI cards com badge de variação -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div class="card bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                <p class="text-[10px] text-blue-600 font-bold uppercase mb-2">Faturamento</p>
                <p class="text-3xl font-bold text-slate-900">R$ {{ kpisMes.faturamento.toFixed(2) }}</p>
                <p v-if="variacoes.faturamento !== null" class="text-xs mt-2 font-bold" :class="variacaoClass(variacoes.faturamento)">
                    {{ variacaoIcon(variacoes.faturamento) }} {{ Math.abs(variacoes.faturamento) }}% vs mês anterior
                </p>
                <p v-else class="text-xs mt-2 text-gray-300">— sem dados anteriores</p>
            </div>
            <div class="card bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                <p class="text-[10px] text-emerald-600 font-bold uppercase mb-2">Lucro Total</p>
                <p class="text-3xl font-bold text-slate-900">R$ {{ kpisMes.lucro.toFixed(2) }}</p>
                <p v-if="variacoes.lucro !== null" class="text-xs mt-2 font-bold" :class="variacaoClass(variacoes.lucro)">
                    {{ variacaoIcon(variacoes.lucro) }} {{ Math.abs(variacoes.lucro) }}% vs mês anterior
                </p>
                <p v-else class="text-xs mt-2 text-gray-300">— sem dados anteriores</p>
            </div>
            <div class="card bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                <p class="text-[10px] text-purple-600 font-bold uppercase mb-2">Vendas</p>
                <p class="text-3xl font-bold text-slate-900">{{ kpisMes.qtdVendas }}</p>
                <p v-if="variacoes.qtdVendas !== null" class="text-xs mt-2 font-bold" :class="variacaoClass(variacoes.qtdVendas)">
                    {{ variacaoIcon(variacoes.qtdVendas) }} {{ Math.abs(variacoes.qtdVendas) }}% vs mês anterior
                </p>
                <p v-else class="text-xs mt-2 text-gray-300">— sem dados anteriores</p>
            </div>
        </div>

        <!-- Gráfico de evolução (últimos 6 meses) -->
        <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
            <h3 class="font-bold text-lg mb-6 text-slate-900">Evolução — últimos 6 meses</h3>
            <div style="height: 220px; position: relative;">
                <canvas id="barChart"></canvas>
            </div>
        </div>

        <!-- Pie + Top 5 filtrado pelo mês -->
        <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col lg:flex-row items-center gap-12">
            <div class="w-64 h-64 shrink-0">
                <canvas id="pieChart"></canvas>
            </div>
            <div class="flex-1 w-full space-y-3 text-left">
                <h3 class="font-bold text-lg mb-4 text-slate-900">Top 5 mais vendidos (Lucro)</h3>
                <p v-if="topCinco.length === 0" class="text-sm text-slate-400 py-4">Nenhuma venda registrada neste mês.</p>
                <div v-for="(item, idx) in topCinco" :key="idx"
                     class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span class="font-semibold text-slate-600 text-sm">{{ item.nome }}</span>
                    <span class="font-bold text-blue-600">R$ {{ Number(item.valor).toFixed(2) }}</span>
                </div>
            </div>
        </div>
    </div>`,

  props: ["kpis", "vendas", "produtos"],

  data() {
    const hoje = new Date();
    return {
      mesSelecionado: `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`,
      chart: null,
      barChart: null,
    };
  },

  watch: {
    vendas: {
      handler(v) {
        if (v && v.length > 0) {
          // Ajusta mês padrão para o mais recente disponível caso o mês atual não tenha vendas
          if (
            !this.mesesOpcoes.includes(this.mesSelecionado) &&
            this.mesesOpcoes.length > 0
          ) {
            this.mesSelecionado = this.mesesOpcoes[0];
          }
          this.$nextTick(() => {
            this.renderPie();
            this.renderBar();
          });
        }
      },
      immediate: true,
      deep: true,
    },
    mesSelecionado() {
      this.$nextTick(() => {
        this.renderPie();
        this.renderBar();
      });
    },
  },

  computed: {
    mesesOpcoes() {
      if (!this.vendas) return [];
      const set = new Set();
      this.vendas.forEach((v) => {
        const d = new Date(v.createdAt);
        set.add(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        );
      });
      return Array.from(set).sort().reverse();
    },

    vendasFiltradas() {
      if (!this.vendas) return [];
      return this.vendas.filter(
        (v) => this.ymDe(v.createdAt) === this.mesSelecionado,
      );
    },

    vendasMesAnterior() {
      if (!this.vendas) return [];
      const ymAnterior = this.ymAnterior(this.mesSelecionado);
      return this.vendas.filter((v) => this.ymDe(v.createdAt) === ymAnterior);
    },

    kpisMes() {
      return this.calcKpis(this.vendasFiltradas);
    },

    kpisMesAnterior() {
      return this.calcKpis(this.vendasMesAnterior);
    },

    variacoes() {
      const delta = (atual, anterior) => {
        if (anterior === 0) return null;
        return Number((((atual - anterior) / anterior) * 100).toFixed(1));
      };
      return {
        faturamento: delta(
          this.kpisMes.faturamento,
          this.kpisMesAnterior.faturamento,
        ),
        lucro: delta(this.kpisMes.lucro, this.kpisMesAnterior.lucro),
        qtdVendas: delta(
          this.kpisMes.qtdVendas,
          this.kpisMesAnterior.qtdVendas,
        ),
      };
    },

    topCinco() {
      const grupos = {};
      this.vendasFiltradas.forEach((v) => {
        const nomeOriginal = v.nomeProdutoSnapshot || "Produto";
        const chave = nomeOriginal.trim().toUpperCase();
        const lucro = Number(v.lucroLiquido || 0);
        if (!grupos[chave])
          grupos[chave] = { nomeParaExibir: nomeOriginal, totalLucro: 0 };
        grupos[chave].totalLucro += lucro;
      });
      return Object.values(grupos)
        .sort((a, b) => b.totalLucro - a.totalLucro)
        .slice(0, 5)
        .map((g) => ({ nome: g.nomeParaExibir, valor: g.totalLucro }));
    },

    dadosTendencia() {
      // Últimos 6 meses a partir do mês selecionado
      const [ano, mes] = this.mesSelecionado.split("-").map(Number);
      const meses = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(ano, mes - 1 - i, 1);
        meses.push(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        );
      }
      const agrupado = {};
      if (this.vendas) {
        this.vendas.forEach((v) => {
          const ym = this.ymDe(v.createdAt);
          if (meses.includes(ym)) {
            if (!agrupado[ym]) agrupado[ym] = { faturamento: 0, lucro: 0 };
            agrupado[ym].faturamento += Number(v.faturamentoTotal || 0);
            agrupado[ym].lucro += Number(v.lucroLiquido || 0);
          }
        });
      }
      return {
        labels: meses.map((ym) => this.formatarMes(ym)),
        faturamento: meses.map((ym) => agrupado[ym]?.faturamento ?? 0),
        lucro: meses.map((ym) => agrupado[ym]?.lucro ?? 0),
      };
    },
  },

  methods: {
    ymDe(dateStr) {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    },

    ymAnterior(ym) {
      const [ano, mes] = ym.split("-").map(Number);
      const d = new Date(ano, mes - 2, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    },

    calcKpis(lista) {
      return {
        faturamento: lista.reduce(
          (s, v) => s + Number(v.faturamentoTotal || 0),
          0,
        ),
        lucro: lista.reduce((s, v) => s + Number(v.lucroLiquido || 0), 0),
        qtdVendas: lista.length,
      };
    },

    variacaoClass(val) {
      if (val === null) return "text-gray-400";
      return val >= 0 ? "text-emerald-600" : "text-red-500";
    },

    variacaoIcon(val) {
      if (val === null) return "";
      return val >= 0 ? "↑" : "↓";
    },

    formatarMes(ym) {
      const [y, m] = ym.split("-");
      return new Date(y, m - 1, 1)
        .toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
        .replace(".", "");
    },

    renderPie() {
      const ctx = document.getElementById("pieChart");
      if (!ctx) return;
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      if (this.topCinco.length === 0) return;
      this.chart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: this.topCinco.map((p) => p.nome),
          datasets: [
            {
              data: this.topCinco.map((p) => p.valor),
              backgroundColor: [
                "#3b82f6",
                "#10b981",
                "#f59e0b",
                "#ef4444",
                "#8b5cf6",
              ],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "75%",
          plugins: { legend: { display: false } },
        },
      });
    },

    renderBar() {
      const ctx = document.getElementById("barChart");
      if (!ctx) return;
      if (this.barChart) {
        this.barChart.destroy();
        this.barChart = null;
      }
      const d = this.dadosTendencia;
      this.barChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: d.labels,
          datasets: [
            {
              label: "Faturamento",
              data: d.faturamento,
              backgroundColor: "rgba(59,130,246,0.75)",
              borderRadius: 8,
              borderSkipped: false,
            },
            {
              label: "Lucro",
              data: d.lucro,
              backgroundColor: "rgba(16,185,129,0.75)",
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: { color: "#64748b", font: { size: 11 }, boxWidth: 12 },
            },
            tooltip: {
              callbacks: { label: (c) => ` R$ ${Number(c.raw).toFixed(2)}` },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#94a3b8", font: { size: 11 } },
            },
            y: {
              grid: { color: "#f1f5f9" },
              ticks: {
                color: "#94a3b8",
                font: { size: 11 },
                callback: (v) => `R$ ${v}`,
              },
            },
          },
        },
      });
    },
  },

  unmounted() {
    if (this.chart) this.chart.destroy();
    if (this.barChart) this.barChart.destroy();
  },
};
export default DashboardView;
