import { apiUpload } from "../api.js";

const EstrategiaAdsView = {
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">

      <div>
        <h2 class="text-2xl font-black tracking-tighter text-slate-900">Estratégia Ads</h2>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Análise de relatórios Shopee • Mercado Livre</p>
      </div>

      <!-- Upload Card -->
      <div class="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-6">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Envie o relatório exportado (.csv ou .xlsx)</p>

        <label class="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl p-10 cursor-pointer hover:border-blue-400 transition-colors"
               :class="arquivo ? 'border-blue-400 bg-blue-50' : ''">
          <i class="fa-solid fa-file-arrow-up text-3xl" :class="arquivo ? 'text-blue-500' : 'text-slate-300'"></i>
          <span class="text-sm font-bold text-slate-500">{{ arquivo ? arquivo.name : 'Clique para selecionar o arquivo' }}</span>
          <input type="file" accept=".csv,.xlsx,.xls" class="hidden" @change="onArquivo">
        </label>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estoque Físico (opcional)</label>
            <input v-model="estoqueFisico" type="text" placeholder="Ex: 2 Salvo, 3 Club de Nuit" class="input-soft">
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produtos no Fornecedor (opcional)</label>
            <input v-model="produtosFornecedor" type="text" placeholder="Ex: Lattafa Asad, Armaf Club" class="input-soft">
          </div>
        </div>

        <button @click="analisar" :disabled="!arquivo || carregando"
          class="btn-primary w-full py-5 text-sm font-bold uppercase tracking-widest shadow-xl disabled:opacity-50">
          <span v-if="carregando"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Analisando com IA...</span>
          <span v-else><i class="fa-solid fa-magnifying-glass-chart mr-2"></i>Analisar Relatório</span>
        </button>
      </div>

      <!-- Resultados -->
      <div v-if="resultado" class="space-y-6">

        <!-- KPIs -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Canal</p>
            <p class="text-lg font-black text-slate-900">{{ resultado.canal || '-' }}</p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ROAS Geral</p>
            <p class="text-lg font-black" :class="resultado.roasGeral >= 20 ? 'text-emerald-600' : 'text-red-500'">{{ resultado.roasGeral }}x</p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Prejuízo Crítico</p>
            <p class="text-lg font-black text-red-500">{{ resultado.diagnostico?.prejuizoReal?.length || 0 }}</p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Saudáveis</p>
            <p class="text-lg font-black text-emerald-600">{{ resultado.diagnostico?.lucros?.length || 0 }}</p>
          </div>
        </div>

        <!-- Resumo -->
        <div class="bg-slate-900 text-white rounded-[2rem] p-8">
          <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Resumo Executivo</p>
          <p class="text-sm leading-relaxed text-slate-300">{{ resultado.resumoExecutivo }}</p>
        </div>

        <!-- Tabela de Execução -->
        <div class="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Plano de Execução</p>
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-gray-100">
                  <th class="text-left font-black text-slate-400 uppercase tracking-widest py-2 pr-4">Produto</th>
                  <th class="text-center font-black text-slate-400 uppercase tracking-widest py-2 px-2">Status</th>
                  <th class="text-center font-black text-slate-400 uppercase tracking-widest py-2 px-2">ACOS</th>
                  <th class="text-center font-black text-slate-400 uppercase tracking-widest py-2 px-2">Meta ROAS</th>
                  <th class="text-left font-black text-slate-400 uppercase tracking-widest py-2 pl-4">Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in resultado.tabelaExecucao" :key="item.produto" class="border-b border-gray-50">
                  <td class="py-3 pr-4 font-bold text-slate-800">{{ item.produto }}</td>
                  <td class="py-3 px-2 text-center">
                    <span class="px-2 py-1 rounded-lg font-black uppercase text-[9px]"
                      :class="{
                        'bg-red-100 text-red-600':    item.statusReal === 'PREJUIZO CRITICO',
                        'bg-yellow-100 text-yellow-700': item.statusReal === 'ALERTA',
                        'bg-emerald-100 text-emerald-600': item.statusReal === 'SAUDAVEL',
                        'bg-gray-100 text-gray-500':  item.statusReal === 'SEM VENDAS',
                      }">{{ item.statusReal }}</span>
                  </td>
                  <td class="py-3 px-2 text-center font-bold text-slate-600">{{ item.acosReal != null ? item.acosReal + '%' : '-' }}</td>
                  <td class="py-3 px-2 text-center font-black text-blue-600">{{ item.novaMetaRoas != null ? item.novaMetaRoas + 'x' : '-' }}</td>
                  <td class="py-3 pl-4 font-bold text-slate-500">{{ item.acao }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Plano 5 Minutos -->
        <div v-if="resultado.planoAcao5Min?.length" class="bg-blue-50 rounded-[2rem] p-6 border border-blue-100">
          <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Plano de Ação • 5 Minutos</p>
          <ul class="space-y-2">
            <li v-for="acao in resultado.planoAcao5Min" :key="acao" class="text-sm text-slate-700 font-medium">{{ acao }}</li>
          </ul>
        </div>

      </div>
    </div>`,

  data() {
    return {
      arquivo: null,
      estoqueFisico: "",
      produtosFornecedor: "",
      carregando: false,
      resultado: null,
    };
  },

  methods: {
    onArquivo(e) {
      this.arquivo = e.target.files[0] || null;
    },

    async analisar() {
      if (!this.arquivo) return;
      this.carregando = true;
      this.resultado = null;
      try {
        const form = new FormData();
        form.append("arquivo", this.arquivo);
        if (this.estoqueFisico)
          form.append("estoqueFisico", this.estoqueFisico);
        if (this.produtosFornecedor)
          form.append("produtosFornecedor", this.produtosFornecedor);

        this.resultado = await apiUpload(
          "/api/estrategia/analisar-ads/upload",
          form,
        );
      } catch (err) {
        alert("Erro na análise: " + err.message);
      } finally {
        this.carregando = false;
      }
    },
  },
};

export default EstrategiaAdsView;
