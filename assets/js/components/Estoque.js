import { apiPost, apiPut, apiPatch } from '../api.js';


  template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-6xl h-[92vh] md:h-auto space-y-3 md:space-y-8 pt-2">
        <div class="flex justify-between items-center px-4 shrink-0">
            <h2 class="text-xl md:text-3xl font-bold tracking-tighter text-slate-900 leading-none italic uppercase">Gestão de Estoque</h2>
            <button @click="abrirModal()" class="btn-primary uppercase text-[9px] md:text-xs tracking-widest font-bold px-4 py-2 md:py-4">
                <i class="fa-solid fa-plus mr-1 md:mr-2"></i> Novo Produto
            </button>
        </div>

        <div class="grid grid-cols-2 gap-2 px-4 shrink-0">
            <div class="relative text-left">
                <i class="fa-solid fa-search absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xs md:text-base"></i>
                <input v-model="filtros.busca" type="text" placeholder="Nome ou inspiração..." class="input-soft !pl-9 md:!pl-12 !py-2 md:!py-4 !text-xs md:!text-sm w-full">
            </div>
            <div class="relative text-left">
                <i class="fa-solid fa-hand-holding-dollar absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-orange-400 text-xs md:text-base"></i>
                <input v-model.number="filtros.precoMax" type="number" placeholder="Até R$..." class="input-soft !pl-9 md:!pl-12 !py-2 md:!py-4 !text-xs md:!text-sm border-orange-100 w-full">
            </div>
        </div>

        <div class="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1 mx-2 md:mx-0 mb-2">
            <div class="flex-1 overflow-x-auto">
                <table class="w-full text-left font-semibold text-xs md:text-sm table-fixed min-w-full">
                    <thead class="bg-gray-50 text-[9px] md:text-[10px] font-bold uppercase text-gray-400 border-b">
                        <tr>
                            <th class="py-3 md:py-5 px-4 md:px-6 w-[35%] md:w-[30%] italic">Produto</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-center w-[12%] italic">Margem %</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-right w-[15%] text-slate-400 italic">Custo</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-right text-orange-600 w-[18%] font-black uppercase italic">Venda ML</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-right text-orange-400 w-[18%] font-black uppercase italic text-center">Venda Shopee</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-center w-24 text-slate-400 uppercase italic text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="p in paginados" :key="p.id" class="hover:bg-slate-50 transition-colors">
                            <td class="py-2 md:py-5 px-4 md:px-6">
                                <div class="flex flex-col text-left font-bold">
                                    <span class="text-slate-700 truncate leading-tight">{{ p.nome }}</span>
                                    <span class="text-[8px] text-slate-400 uppercase tracking-tighter">{{ p.inspiracao || 'Original' }}</span>
                                </div>
                            </td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-center">
                                <span class="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-black">{{ p.margem }}%</span>
                            </td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-right text-slate-400 font-bold">R$ {{ Number(p.custo).toFixed(2) }}</td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-right text-orange-600 font-black italic">R$ {{ Number(p.preco_suger_ml).toFixed(2) }}</td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-right text-orange-400 font-black italic">R$ {{ Number(p.preco_suger_shopee || 0).toFixed(2) }}</td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-center">
                                <div class="flex items-center justify-center gap-2">
                                    <button @click="userRole === 'admin' ? abrirModal(p) : null" :class="userRole === 'admin' ? 'text-blue-400 hover:text-blue-600' : 'text-gray-200 cursor-not-allowed'"><i class="fa-solid fa-pen-to-square"></i></button>
                                    <button @click="userRole === 'admin' ? excluir(p.id) : null" :class="userRole === 'admin' ? 'text-red-200 hover:text-red-500' : 'text-gray-100 cursor-not-allowed'"><i class="fa-solid fa-trash-can"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="modal.aberto" class="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div class="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl animate-fade-in text-left my-8 border border-slate-100">
                <div class="text-center mb-6">
                    <h3 class="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{{ modoEdicao ? 'Ajustar Produto' : 'Novo Produto' }}</h3>
                </div>
                
                <div class="space-y-4 text-left">
                    <div class="space-y-1">
                        <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Nome do Produto</label>
                        <input v-model="form.nome" type="text" class="input-soft">
                    </div>

                    <div class="space-y-1">
                        <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Inspiração / Cor / Variação</label>
                        <input v-model="form.inspiracao" type="text" class="input-soft">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-blue-500 uppercase ml-2 italic">Custo (R$)</label>
                            <input v-model.number="form.custo" type="number" step="0.01" @input="autoCalcularTudo" class="input-soft font-bold">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-emerald-500 uppercase ml-2 italic">Margem (%)</label>
                            <input v-model.number="form.margem" type="number" @input="autoCalcularTudo" class="input-soft font-bold !text-emerald-600">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                        <div class="space-y-1">
                            <label class="text-[9px] font-black text-slate-500 uppercase ml-2">Taxa ML (%)</label>
                            <input v-model.number="form.taxa_ml" type="number" step="0.01" @input="autoCalcularTudo" class="input-soft !bg-white">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-black text-slate-500 uppercase ml-2">Frete ML (R$)</label>
                            <input v-model.number="form.frete_fixo" type="number" step="0.01" @input="autoCalcularTudo" class="input-soft !bg-white">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-orange-600 uppercase ml-2 italic font-black">Sugestão ML</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-300">R$</span>
                                <input v-model.number="form.preco_suger_ml" type="number" step="0.01" class="input-soft !pl-8 border-orange-100 text-orange-600 font-bold">
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-orange-400 uppercase ml-2 italic font-black">Sugestão Shopee</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-200">R$</span>
                                <input v-model.number="form.preco_suger_shopee" type="number" step="0.01" class="input-soft !pl-8 border-orange-50 text-orange-500 font-bold">
                            </div>
                        </div>
                    </div>

                    <div class="bg-slate-900 rounded-2xl p-4 text-[9px] font-bold uppercase tracking-widest text-white/70">
                        <div class="flex justify-between items-center">
                            <span>Lucro Real Esperado:</span>
                            <b class="text-emerald-400 text-sm">R$ {{ (Number(form.custo || 0) * (Number(form.margem || 10)/100)).toFixed(2) }}</b>
                        </div>
                    </div>
                </div>
                <div class="flex gap-4 mt-8">
                    <button @click="fecharModal" class="flex-1 font-bold text-gray-400 uppercase text-[10px]">Cancelar</button>
                    <button @click="salvar" class="flex-1 btn-primary text-xs uppercase font-black tracking-widest">Confirmar</button>
                </div>
            </div>
        </div>
    </div>`,
  props: ["produtos", "userRole", "taxas"],
  data() {
    return {
      paginaAtual: 1,
      itensPorPagina: 10,
      filtros: { busca: "", precoMax: null },
      modal: { aberto: false },
      modoEdicao: false,
      idSendoEditado: null,
      form: {
        nome: "",
        inspiracao: "",
        custo: 0,
        preco_suger_ml: 0,
        preco_suger_shopee: 0,
        margem: 10,
        taxa_ml: 0,
        frete_fixo: 0,
      },
    };
  },
  computed: {
    produtosFiltrados() {
      const t = (this.filtros.busca || "").toLowerCase();
      return this.produtos.filter(
        (p) =>
          (p.nome || "").toLowerCase().includes(t) ||
          (p.inspiracao || "").toLowerCase().includes(t),
      );
    },
    totalPaginas() {
      return (
        Math.ceil(this.produtosFiltrados.length / this.itensPorPagina) || 1
      );
    },
    paginados() {
      return this.produtosFiltrados.slice(
        (this.paginaAtual - 1) * this.itensPorPagina,
        this.paginaAtual * this.itensPorPagina,
      );
    },
  },
  methods: {
    autoCalcularTudo() {
      const custo = Number(this.form.custo) || 0;
      const margemProd = 1 + Number(this.form.margem) / 100;

      // LÓGICA ML USANDO VALORES DO FORMULÁRIO (DINÂMICOS)
      const taxaML = Number(this.form.taxa_ml) / 100;
      const freteML = Number(this.form.frete_fixo);

      const vML = (custo * margemProd + freteML) / (1 - taxaML);
      this.form.preco_suger_ml = Number(vML.toFixed(2));

      // LÓGICA SHOPEE 2026
      this.form.preco_suger_shopee = Number(
        this.calcularPrecoShopee(custo, this.form.margem),
      );
    },
    calcularPrecoShopee(custo, margem) {
      const custoNumerico = Number(custo) || 0;
      const margemPercentual = 1 + Number(margem) / 100;
      const valorComMargem = custoNumerico * margemPercentual;

      // Regra 1: Itens até R$ 79,99 (Comissão 20% + R$ 4,00 fixos)
      let tentativa1 = (valorComMargem + 4) / 0.8;
      if (tentativa1 <= 79.99) {
        return tentativa1.toFixed(2);
      }

      // Regra 2: R$ 80,00 a R$ 99,99 (Comissão 14% + R$ 16,00 fixos)
      let tentativa2 = (valorComMargem + 16) / 0.86;
      if (tentativa2 >= 80 && tentativa2 <= 99.99) {
        return tentativa2.toFixed(2);
      }

      // Regra 3: R$ 100,00 a R$ 199,99 (Comissão 14% + R$ 20,00 fixos)
      let tentativa3 = (valorComMargem + 20) / 0.86;
      if (tentativa3 >= 100 && tentativa3 <= 199.99) {
        return tentativa3.toFixed(2);
      }

      // Regra 4: Itens acima de R$ 200,00 (Comissão 14% + R$ 26,00 fixos)
      // Nota: O teto de R$ 28 que você tinha antes mudou para R$ 26 conforme o trecho.
      let tentativa4 = (valorComMargem + 26) / 0.86;
      return tentativa4.toFixed(2);
    },
    abrirModal(p = null) {
      if (p) {
        this.modoEdicao = true;
        this.idSendoEditado = p.id;
        this.form = {
          nome: p.nome,
          inspiracao: p.inspiracao || "",
          custo: Number(p.custo),
          margem: Number(p.margem || 10),
          preco_suger_ml: Number(p.precoSugerMl),
          preco_suger_shopee: Number(p.precoSugerShopee || 0),
          taxa_ml:
            p.mktpTaxaOverride !== null
              ? Number(p.mktpTaxaOverride)
              : this.taxas.ml_comissao,
          frete_fixo:
            p.mktpFreteOverride !== null
              ? Number(p.mktpFreteOverride)
              : this.taxas.ml_frete,
        };
      } else {
        this.modoEdicao = false;
        this.form = {
          nome: "",
          inspiracao: "",
          custo: 0,
          margem: 10,
          preco_suger_ml: 0,
          preco_suger_shopee: 0,
          taxa_ml: this.taxas.ml_comissao,
          frete_fixo: this.taxas.ml_frete,
        };
      }
      this.modal.aberto = true;
    },
    fecharModal() {
      this.modal.aberto = false;
    },
    async salvar() {
      const payload = {
        nome: this.form.nome,
        inspiracao: this.form.inspiracao,
        custo: this.form.custo,
        margem: this.form.margem,
        precoSugerMl: this.form.preco_suger_ml,
        precoSugerShopee: this.form.preco_suger_shopee,
        mktpTaxaOverride: this.form.taxa_ml,
        mktpFreteOverride: this.form.frete_fixo,
      };
      if (this.modoEdicao)
        await apiPut(`/api/produtos/${this.idSendoEditado}`, payload);
      else
        await apiPost('/api/produtos', payload);
      this.$emit('refresh');
      this.fecharModal();
    },
    async excluir(id) {
      if (confirm('Excluir item?')) {
        await apiPatch(`/api/produtos/${id}/inativar`);
        this.$emit('refresh');
      }
    },
  },
};
export default EstoqueView;
