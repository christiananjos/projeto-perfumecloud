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

        <!-- Modo de Análise -->
        <div class="space-y-2">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modo de Análise</p>
          <div class="flex gap-3">
            <button @click="modo = 'RENTABILIDADE'"
              class="flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest border-2 transition-all"
              :class="modo === 'RENTABILIDADE'
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                : 'bg-white text-slate-400 border-gray-200 hover:border-blue-300'">
              <i class="fa-solid fa-shield-halved mr-2"></i>Rentabilidade
            </button>
            <button @click="modo = 'VISIBILIDADE'"
              class="flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest border-2 transition-all"
              :class="modo === 'VISIBILIDADE'
                ? 'bg-violet-600 text-white border-violet-600 shadow-lg'
                : 'bg-white text-slate-400 border-gray-200 hover:border-violet-300'">
              <i class="fa-solid fa-rocket mr-2"></i>Visibilidade
            </button>
          </div>
          <p class="text-[10px] text-slate-400">
            <span v-if="modo === 'RENTABILIDADE'">Protege a margem alvo (DB). ROAS conservador. Ideal para operação estável.</span>
            <span v-else>Margem alvo 5%. ROAS agressivo para ganhar ranking. Aceita ACOS mais alto.</span>
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estoque Físico (opcional)</label>
            <input v-model="estoqueFisico" type="text" placeholder="Ex: 2 Salvo, 3 Club de Nuit" class="input-soft">
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produtos no Fornecedor (opcional)</label>
            <input v-model="produtosFornecedor" type="text" placeholder="Ex: Lattafa Asad, Armaf Club" class="input-soft">
          </div>
          <div class="space-y-1 md:col-span-2">
            <label class="text-[10px] font-black text-amber-500 uppercase tracking-widest">
              <i class="fa-solid fa-triangle-exclamation mr-1"></i>Estoque Parado +7 dias (opcional)
            </label>
            <input v-model="estoqueParado" type="text" placeholder="Ex: Lattafa Asad - 12 dias, Salvo 2 - 9 dias" class="input-soft border-amber-200 focus:border-amber-400">
            <p class="text-[9px] text-amber-500 font-bold">Produtos listados aqui recebem ação DESOVA com ROAS break-even</p>
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
          <div class="rounded-2xl p-5 border shadow-sm text-center"
            :class="resultado.modoAnalise === 'VISIBILIDADE'
              ? 'bg-violet-50 border-violet-200'
              : 'bg-blue-50 border-blue-200'">
            <p class="text-[9px] font-black uppercase tracking-widest mb-1"
              :class="resultado.modoAnalise === 'VISIBILIDADE' ? 'text-violet-500' : 'text-blue-500'">Modo</p>
            <p class="text-sm font-black"
              :class="resultado.modoAnalise === 'VISIBILIDADE' ? 'text-violet-700' : 'text-blue-700'">
              <i :class="resultado.modoAnalise === 'VISIBILIDADE' ? 'fa-solid fa-rocket' : 'fa-solid fa-shield-halved'" class="mr-1"></i>
              {{ resultado.modoAnalise || 'RENTABILIDADE' }}
            </p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ROAS Geral</p>
            <p class="text-lg font-black" :class="resultado.roasGeral >= 20 ? 'text-emerald-600' : 'text-red-500'">{{ resultado.roasGeral }}x</p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Prejuízo Crítico</p>
            <p class="text-lg font-black text-red-500">{{ resultado.diagnostico?.prejuizoReal?.length || 0 }}</p>
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
                  <th class="text-center font-black text-slate-400 uppercase tracking-widest py-2 px-2">Estoque</th>
                  <th class="text-center font-black text-slate-400 uppercase tracking-widest py-2 px-2">Status</th>
                  <th class="text-center font-black text-slate-400 uppercase tracking-widest py-2 px-2">ACOS</th>
                  <th class="text-center font-black text-slate-400 uppercase tracking-widest py-2 px-2">Meta ROAS</th>
                  <th class="text-left font-black text-slate-400 uppercase tracking-widest py-2 pl-4">Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in resultado.tabelaExecucao" :key="item.produto" class="border-b border-gray-50"
                  :class="item.statusEstoque === 'Parado' ? 'bg-amber-50/40' : ''">
                  <td class="py-3 pr-4 font-bold text-slate-800">{{ item.produto }}</td>
                  <td class="py-3 px-2 text-center">
                    <span class="px-2 py-1 rounded-lg font-black uppercase text-[9px]"
                      :class="{
                        'bg-amber-100 text-amber-700': item.statusEstoque === 'Parado',
                        'bg-blue-100 text-blue-700':   item.statusEstoque === 'Fisico',
                        'bg-slate-100 text-slate-500': item.statusEstoque === 'Fornecedor' || !item.statusEstoque,
                      }">
                      <i v-if="item.statusEstoque === 'Parado'" class="fa-solid fa-triangle-exclamation mr-1"></i>
                      {{ item.statusEstoque || 'Fornecedor' }}
                    </span>
                  </td>
                  <td class="py-3 px-2 text-center">
                    <span class="px-2 py-1 rounded-lg font-black uppercase text-[9px]"
                      :class="{
                        'bg-red-100 text-red-600':       item.statusReal === 'PREJUIZO CRITICO',
                        'bg-yellow-100 text-yellow-700': item.statusReal === 'ALERTA',
                        'bg-emerald-100 text-emerald-600': item.statusReal === 'SAUDAVEL',
                        'bg-gray-100 text-gray-500':     item.statusReal === 'SEM VENDAS',
                      }">{{ item.statusReal }}</span>
                  </td>
                  <td class="py-3 px-2 text-center font-bold text-slate-600">{{ item.acosReal != null ? item.acosReal + '%' : '-' }}</td>
                  <td class="py-3 px-2 text-center font-black"
                    :class="item.statusEstoque === 'Parado' ? 'text-amber-600' : 'text-blue-600'">
                    {{ item.novaMetaRoas != null ? item.novaMetaRoas + 'x' : '-' }}
                  </td>
                  <td class="py-3 pl-4 font-bold"
                    :class="{
                      'text-amber-600': item.acao === 'DESOVA',
                      'text-blue-600':  item.acao === 'DESTRAVAR',
                      'text-slate-500': item.acao !== 'DESOVA' && item.acao !== 'DESTRAVAR',
                    }">{{ item.acao }}</td>
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
      estoqueParado: "",
      modo: "RENTABILIDADE",
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
        form.append("modo", this.modo);
        if (this.estoqueFisico)
          form.append("estoqueFisico", this.estoqueFisico);
        if (this.produtosFornecedor)
          form.append("produtosFornecedor", this.produtosFornecedor);
        if (this.estoqueParado)
          form.append("estoqueParado", this.estoqueParado);

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
