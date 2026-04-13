import { apiPost, apiPut, apiPatch } from "../api.js";

const ConfiguracoesView = {
  template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-4xl h-[92vh] md:h-auto space-y-6 pt-2 px-4 pb-10">
        <div class="flex flex-col shrink-0 text-left">
            <h2 class="text-xl md:text-2xl font-black tracking-tighter text-slate-900 uppercase italic">Ajustes do Sistema</h2>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Taxas Globais e Canais de Venda</p>
        </div>

        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-10 space-y-8">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-4 italic">Configurações Mercado Livre</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 font-bold">
                <div class="space-y-3 text-left">
                    <div class="flex items-center gap-2 ml-2">
                        <i class="fa-solid fa-percent text-orange-400 text-[10px]"></i>
                        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Comissão Padrão</label>
                    </div>
                    <div class="relative">
                        <input v-model.number="localTaxas.ml_comissao" type="number" :disabled="userRole !== 'admin'" 
                               class="input-soft !py-4 !text-xl !font-bold border-slate-100">
                        <span class="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-slate-300">%</span>
                    </div>
                </div>

                <div class="space-y-3 text-left">
                    <div class="flex items-center gap-2 ml-2">
                        <i class="fa-solid fa-shipping-fast text-blue-400 text-[10px]"></i>
                        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Frete Fixo Padrão</label>
                    </div>
                    <div class="relative">
                        <input v-model.number="localTaxas.ml_frete" type="number" step="0.01" :disabled="userRole !== 'admin'" 
                               class="input-soft !py-4 !text-xl !font-bold border-slate-100 !pl-12">
                        <span class="absolute left-5 top-1/2 -translate-y-1/2 text-sm text-slate-300 italic">R$</span>
                    </div>
                </div>
            </div>
            <div class="flex justify-center pt-4">
                <button v-if="userRole === 'admin'" @click="salvarTaxas" 
                        class="btn-primary px-10 py-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                    Atualizar Taxas ML
                </button>
            </div>
        </div>

        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-10 space-y-6">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-4 italic">Canais de Venda Ativos</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="c in canais" :key="c.id" class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div class="flex items-center gap-3">
                        <div :style="{ backgroundColor: c.cor_hex }" class="w-4 h-4 rounded-full shadow-sm"></div>
                        <span class="font-black text-slate-700 uppercase italic text-xs tracking-tighter">{{ c.nome }}</span>
                    </div>
                    <button v-if="userRole === 'admin'" @click="excluirCanal(c.id)" class="text-red-200 hover:text-red-500 transition-colors">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </div>
            </div>

            <div v-if="userRole === 'admin'" class="bg-blue-50/50 p-6 rounded-[1.5rem] border border-dashed border-blue-200 mt-6">
                <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-4 italic">Cadastrar Novo Canal</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input v-model="novoCanal.nome" type="text" placeholder="Nome do Canal" class="input-soft !bg-white">
                    <div class="flex items-center gap-2">
                        <input v-model="novoCanal.cor_hex" type="color" class="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent">
                        <span class="text-[10px] font-bold text-slate-400 uppercase italic">Cor do Badge</span>
                    </div>
                    <button @click="adicionarCanal" class="bg-slate-900 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-slate-800 transition-all">
                        <i class="fa-solid fa-plus mr-2"></i> Criar Canal
                    </button>
                </div>
            </div>
        </div>

        <div class="bg-slate-900 rounded-[1.5rem] p-5 flex items-center gap-4 border border-slate-800 shrink-0">
            <div class="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <i class="fa-solid fa-circle-info text-blue-400 text-xs"></i>
            </div>
            <p class="text-[10px] text-slate-400 font-medium leading-relaxed text-left">
                Dica: O ID do canal cadastrado aqui será usado para vincular suas vendas e gerar relatórios de lucratividade por plataforma no Dashboard.
            </p>
        </div>
    </div>`,
  props: ["userRole", "taxas", "canais"], // Agora recebe a prop canais
  data() {
    return {
      localTaxas: { ...this.taxas },
      novoCanal: { nome: "", cor_hex: "#3b82f6" },
    };
  },
  methods: {
    async salvarTaxas() {
      if (this.userRole !== "admin") return;
      try {
        await apiPut("/api/configuracoes", {
          chave: "ml_comissao",
          valor: this.localTaxas.ml_comissao,
        });
        await apiPut("/api/configuracoes", {
          chave: "ml_frete",
          valor: this.localTaxas.ml_frete,
        });
        this.$emit("notificar", {
          titulo: "Sucesso!",
          texto: "Taxas atualizadas.",
        });
        this.$emit("refresh");
      } catch (err) {
        console.error(err);
      }
    },
    async adicionarCanal() {
      if (!this.novoCanal.nome) return;
      try {
        await apiPost("/api/canais", {
          nome: this.novoCanal.nome,
          corHex: this.novoCanal.cor_hex,
        });
        this.$emit("notificar", {
          titulo: "Canal Criado!",
          texto: "O novo canal já está disponível para vendas.",
        });
        this.novoCanal = { nome: "", cor_hex: "#3b82f6" };
        this.$emit("refresh");
      } catch (err) {
        console.error(err);
      }
    },
    async excluirCanal(id) {
      if (
        !confirm(
          "Deseja realmente remover este canal? Vendas vinculadas a ele podem perder a referência.",
        )
      )
        return;
      try {
        await apiPatch(`/api/canais/${id}/desativar`);
        this.$emit("refresh");
      } catch (err) {
        console.error(err);
      }
    },
  },
  watch: {
    taxas: {
      handler(newVal) {
        this.localTaxas = { ...newVal };
      },
      deep: true,
    },
  },
};
export default ConfiguracoesView;
