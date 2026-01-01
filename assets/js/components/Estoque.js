const EstoqueView = {
  template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-6xl h-[92vh] md:h-auto space-y-3 md:space-y-8 pt-2">
        
        <div class="flex justify-between items-center px-4 shrink-0">
            <h2 class="text-xl md:text-3xl font-bold tracking-tighter text-slate-900 leading-none">Gestão de Estoque</h2>
            <button @click="abrirModal()" class="btn-primary uppercase text-[9px] md:text-xs tracking-widest font-bold px-4 py-2 md:py-4">
                <i class="fa-solid fa-plus mr-1 md:mr-2"></i> Novo Produto
            </button>
        </div>

        <div class="grid grid-cols-2 gap-2 px-4 shrink-0">
            <div class="relative">
                <i class="fa-solid fa-search absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xs md:text-base"></i>
                <input v-model="filtros.busca" type="text" placeholder="Nome ou inspiração..." class="input-soft !pl-9 md:!pl-12 !py-2 md:!py-4 !text-xs md:!text-sm w-full">
            </div>
            <div class="relative">
                <i class="fa-solid fa-hand-holding-dollar absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-orange-400 text-xs md:text-base"></i>
                <input v-model.number="filtros.precoMax" type="number" placeholder="Até R$..." class="input-soft !pl-9 md:!pl-12 !py-2 md:!py-4 !text-xs md:!text-sm border-orange-100 w-full">
            </div>
        </div>

        <div class="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1 mx-2 md:mx-0 mb-2">
            <div class="flex-1 overflow-x-auto">
                <table class="w-full text-left font-semibold text-xs md:text-sm table-fixed min-w-full">
                    <thead class="bg-gray-50 text-[9px] md:text-[10px] font-bold uppercase text-gray-400 border-b">
                        <tr>
                            <th class="py-3 md:py-5 px-4 md:px-6 w-[40%] md:w-[35%]">Produto</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-center w-[15%]">Margem</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-right w-[15%] text-slate-400">Custo</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-right text-orange-600 w-[20%]">Venda ML</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-center w-[15%] md:w-32 text-slate-400">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="p in paginados" :key="p.id" class="hover:bg-slate-50 transition-colors">
                            <td class="py-2 md:py-5 px-4 md:px-6">
                                <div class="flex flex-col text-left">
                                    <span class="text-slate-700 font-bold truncate leading-tight">{{ p.nome }}</span>
                                    <span class="text-[8px] text-slate-400 font-medium uppercase tracking-tighter">{{ p.inspiracao || 'Original' }}</span>
                                </div>
                            </td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-center">
                                <span class="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-black">{{ p.margem || 30 }}%</span>
                            </td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-right text-slate-400 font-bold">R$ {{ Number(p.custo).toFixed(2) }}</td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-right text-orange-600 font-bold">R$ {{ Number(p.preco_suger_ml).toFixed(2) }}</td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-center text-slate-300">
                                <div class="flex items-center justify-center gap-2">
                                    <button @click="userRole === 'admin' ? abrirModal(p) : null" :class="userRole === 'admin' ? 'text-blue-400 hover:text-blue-600' : 'text-gray-200 cursor-not-allowed'"><i class="fa-solid fa-pen-to-square"></i></button>
                                    <button @click="userRole === 'admin' ? excluir(p.id) : null" :class="userRole === 'admin' ? 'text-red-200 hover:text-red-500' : 'text-gray-100 cursor-not-allowed'"><i class="fa-solid fa-trash-can"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="p-3 md:p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                <div class="flex flex-col text-left">
                   <span class="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{{ produtosFiltrados.length }} itens</span>
                   <span class="text-[8px] md:text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
                </div>
                <div class="flex gap-1">
                    <button @click="paginaAtual--" :disabled="paginaAtual === 1" class="w-8 h-8 md:w-10 md:h-10 border rounded-xl flex items-center justify-center disabled:opacity-30"><i class="fa-solid fa-chevron-left text-[10px]"></i></button>
                    <button @click="paginaAtual++" :disabled="paginaAtual === totalPaginas" class="w-8 h-8 md:w-10 md:h-10 border rounded-xl flex items-center justify-center disabled:opacity-30"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>
                </div>
            </div>
        </div>

        <div v-if="modal.aberto" class="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl animate-fade-in text-left">
                <div class="text-center mb-6">
                    <h3 class="text-2xl font-black text-slate-900 tracking-tighter">{{ modoEdicao ? 'Ajustar Produto' : 'Novo Produto' }}</h3>
                </div>
                
                <div class="space-y-4">
                    <div class="space-y-1 text-left">
                        <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Nome do Perfume</label>
                        <input v-model="form.nome" type="text" class="input-soft">
                    </div>

                    <div class="space-y-1 text-left">
                        <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Inspiração</label>
                        <input v-model="form.inspiracao" type="text" class="input-soft">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1 text-left">
                            <label class="text-[9px] font-bold text-blue-500 uppercase ml-2 italic">Custo (R$)</label>
                            <input v-model.number="form.custo" type="number" step="0.01" @input="autoCalcularSugerido" class="input-soft font-bold">
                        </div>
                        <div class="space-y-1 text-left">
                            <label class="text-[9px] font-bold text-emerald-500 uppercase ml-2 italic">Margem (%)</label>
                            <input v-model.number="form.margem" type="number" @input="autoCalcularSugerido" class="input-soft font-bold !text-emerald-600">
                        </div>
                    </div>

                    <div class="space-y-1 text-left">
                        <label class="text-[9px] font-bold text-orange-400 uppercase ml-2 italic">Venda Sugerida ML</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-300">R$</span>
                            <input v-model.number="form.preco_suger_ml" type="number" step="0.01" class="input-soft !pl-10 border-orange-100 text-orange-600 font-bold">
                        </div>
                    </div>

                    <div class="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200">
                        <div class="flex justify-between text-[9px] text-gray-500 font-bold uppercase">
                            <span>Seu Lucro: <b class="text-emerald-600">R$ {{ (form.custo * (form.margem/100)).toFixed(2) }}</b></span>
                            <span>Taxas ML: <b class="text-red-400">R$ {{ (form.preco_suger_ml * (taxas.ml_comissao/100)).toFixed(2) }}</b></span>
                        </div>
                    </div>
                </div>

                <div class="flex gap-4 mt-8">
                    <button @click="fecharModal" class="flex-1 font-bold text-gray-400 uppercase text-[10px]">Cancelar</button>
                    <button @click="salvar" class="flex-1 btn-primary text-xs uppercase font-black">Salvar</button>
                </div>
            </div>
        </div>
    </div>`,
  props: ["produtos", "userRole", "taxas"],
  data() {
    return {
      paginaAtual: 1,
      itensPorPagina: window.innerWidth < 768 ? 6 : 10,
      filtros: { busca: "", precoMax: null },
      modal: { aberto: false },
      modoEdicao: false,
      idSendoEditado: null,
      form: {
        nome: "",
        inspiracao: "",
        custo: 0,
        preco_suger_ml: 0,
        margem: 30,
      },
    };
  },
  computed: {
    produtosFiltrados() {
      if (!this.produtos) return [];
      const t = this.filtros.busca.toLowerCase();
      return this.produtos.filter(
        (p) =>
          p.nome.toLowerCase().includes(t) ||
          (p.inspiracao && p.inspiracao.toLowerCase().includes(t))
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
        this.paginaAtual * this.itensPorPagina
      );
    },
  },
  methods: {
    autoCalcularSugerido() {
      if (this.form.custo > 0 && this.taxas) {
        const comissao = this.taxas.ml_comissao / 100;
        const frete = this.taxas.ml_frete;
        const margemDesejada = 1 + this.form.margem / 100;

        const custoComLucro = this.form.custo * margemDesejada;
        const resultado = (custoComLucro + frete) / (1 - comissao);
        this.form.preco_suger_ml = Number(resultado.toFixed(2));
      }
    },
    abrirModal(p = null) {
      if (p) {
        this.modoEdicao = true;
        this.idSendoEditado = p.id;
        this.form = { ...p, margem: p.margem || 30 };
      } else {
        this.modoEdicao = false;
        this.form = {
          nome: "",
          inspiracao: "",
          custo: 0,
          preco_suger_ml: 0,
          margem: 30,
        };
      }
      this.modal.aberto = true;
    },
    fecharModal() {
      this.modal.aberto = false;
    },
    async salvar() {
      const payload = { ...this.form };
      delete payload.id;
      if (this.modoEdicao)
        await window.supabase
          .from("produtos")
          .update(payload)
          .eq("id", this.idSendoEditado);
      else await window.supabase.from("produtos").insert([payload]);
      this.$emit("refresh");
      this.fecharModal();
    },
    async excluir(id) {
      if (confirm("Excluir produto?")) {
        await window.supabase.from("produtos").delete().eq("id", id);
        this.$emit("refresh");
      }
    },
  },
};

export default EstoqueView;
