import { apiPut, apiDelete, apiPost } from "../api.js";
import { canalLabel, precoSugeridoPorCanal, custoProduto, calcularLucroVenda } from "../venda-utils.js";

const HistoricoView = {
  template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-6xl h-[92vh] md:h-auto space-y-3 md:space-y-8 pt-2 text-left">

        <div class="flex justify-between items-center px-4 shrink-0">
            <h2 class="text-xl md:text-3xl font-bold tracking-tighter text-slate-900 leading-none italic uppercase">Histórico de Vendas</h2>
            <div class="flex items-center gap-3">
                <div class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{{ vendasFiltradas.length }} registros</div>
                <button @click="abrirVenderModal" class="btn-primary px-5 py-2.5 text-xs uppercase tracking-tighter shadow-lg active:scale-95 transition-transform flex items-center gap-2">
                    <i class="fa-solid fa-tag"></i> Vender
                </button>
            </div>
        </div>

        <div class="px-4 shrink-0 grid grid-cols-12 gap-2">
            <div class="relative text-left col-span-8 md:col-span-9">
                <i class="fa-solid fa-search absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xs md:text-base"></i>
                <input v-model="busca" type="text" placeholder="Produto ou Rastreio..." class="input-soft !pl-9 md:!pl-12 !py-2 md:!py-4 !text-xs md:!text-sm w-full">
            </div>
            <div class="col-span-4 md:col-span-3">
                <select v-model="filtroCanal" class="input-soft !py-2 md:!py-4 !text-[10px] md:!text-xs font-black uppercase tracking-tighter border-slate-200 text-slate-600">
                    <option value="todos">Todos</option>
                    <option value="ML">Mercado Livre</option>
                    <option value="SHOPEE">Shopee</option>
                </select>
            </div>
        </div>

        <div class="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1 mx-2 md:mx-0 mb-2">
            <div class="flex-1 overflow-x-auto overflow-y-hidden">
                <table class="w-full text-left font-semibold text-sm table-fixed min-w-full">
                    <thead class="bg-gray-50 text-[9px] md:text-[10px] font-bold uppercase text-gray-400 border-b">
                        <tr>
                            <th class="py-5 px-6 w-[18%] md:w-[12%] italic">Data</th>
                            <th class="py-5 px-6 w-[47%] md:w-[33%] italic">Produto</th>
                            <th class="py-5 px-6 hidden md:table-cell md:w-[22%] italic text-center text-slate-400">Canal / Pedido</th>
                            <th class="py-5 px-6 hidden md:table-cell md:w-[12%] text-right text-emerald-600 italic">Lucro</th>
                            <th class="py-5 px-6 text-center w-[15%] md:w-[12%] italic">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50 font-bold">
                        <tr v-for="v in paginados" :key="v.id" class="hover:bg-slate-50 transition-colors h-[12%] md:h-auto">
                            <td class="py-2 md:py-5 px-4 md:px-6 text-[10px] md:text-xs text-gray-400 italic">
                                {{ new Date(v.createdAt).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) }}
                            </td>
                            <td class="py-2 md:py-5 px-4 md:px-6">
                                <div class="flex flex-col text-left">
                                    <span class="text-slate-700 font-black truncate text-[11px] md:text-sm uppercase tracking-tighter">{{ v.nomeProdutoSnapshot }}</span>
                                    <div class="md:hidden flex flex-wrap items-center gap-1 mt-1 font-bold text-[8px]">
                                        <span :class="canalLabel(v.canal) === 'SHOPEE' ? 'text-orange-600' : 'text-orange-400'" class="uppercase italic">
                                            [{{ canalLabel(v.canal) }}]
                                        </span>
                                        <span v-if="v.mlOrderId" class="text-slate-500">#{{ v.mlOrderId }}</span>
                                        <span v-if="v.trackingCode" class="text-blue-500 uppercase">| {{ v.trackingCode }}</span>
                                        <span class="text-emerald-600 font-black">| R$ {{ (v.lucroLiquido || 0).toFixed(2) }}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="py-5 px-6 hidden md:table-cell">
                                <div class="flex flex-col gap-1 text-center items-center">
                                    <div class="flex items-center gap-2">
                                        <span :class="canalLabel(v.canal) === 'SHOPEE' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700 border-orange-100'"
                                              class="px-2 py-0.5 rounded text-[8px] font-black uppercase border italic">
                                            {{ canalLabel(v.canal) }}
                                        </span>
                                        <span v-if="v.mlOrderId" class="text-[10px] text-slate-400 font-black italic uppercase">
                                            #{{ v.mlOrderId }}
                                        </span>
                                    </div>
                                    <button v-if="v.trackingCode" @click="copiarCodigo(v.trackingCode)" class="text-[9px] text-blue-500 font-bold flex items-center gap-1 hover:text-blue-700 tracking-tighter">
                                        <i class="fa-solid fa-truck-fast"></i> {{ v.trackingCode }}
                                    </button>
                                </div>
                            </td>
                            <td class="py-5 px-6 hidden md:table-cell text-right text-emerald-600 font-black italic text-sm">
                                R$ {{ (v.lucroLiquido || 0).toFixed(2) }}
                            </td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-center">
                                <div class="flex items-center justify-center gap-3">
                                    <button @click="abrirEdicao(v)" :class="isAdmin ? 'text-blue-400 hover:text-blue-600' : 'text-gray-50 cursor-not-allowed'" class="transition-transform active:scale-90"><i class="fa-solid fa-pen-to-square"></i></button>
                                    <button @click="solicitarExclusao(v.id)" :class="isAdmin ? 'text-red-200 hover:text-red-500' : 'text-gray-50 cursor-not-allowed'"><i class="fa-solid fa-trash-can"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="p-4 bg-gray-50 border-t flex justify-between items-center shrink-0">
                <span class="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
                <div class="flex gap-2">
                    <button @click="paginaAtual--" :disabled="paginaAtual === 1" class="w-8 h-8 border rounded-xl flex items-center justify-center disabled:opacity-30"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                    <button @click="paginaAtual++" :disabled="paginaAtual === totalPaginas" class="w-8 h-8 border rounded-xl flex items-center justify-center disabled:opacity-30"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                </div>
            </div>
        </div>

        <!-- Modal de edição -->
        <div v-if="editModal.aberto" class="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 text-left">
            <div class="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl animate-fade-in">
                <div class="text-center mb-6">
                    <h3 class="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Ajustar Venda</h3>
                    <p class="text-[10px] font-bold text-blue-500 uppercase">{{ editModal.form.nomeProdutoSnapshot }}</p>
                </div>

                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4 font-bold">
                        <div class="space-y-1">
                            <label class="text-[9px] text-blue-500 uppercase ml-2 italic">Custo Unitário (R$)</label>
                            <input v-model.number="editModal.custo_manual" type="number" step="0.01" class="input-soft border-blue-100">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] text-orange-500 uppercase ml-2 italic">Entrada Unit. (R$)</label>
                            <input v-model.number="editModal.form.precoVendaUnitario" type="number" step="0.01" class="input-soft border-orange-100">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 font-bold">
                        <div class="space-y-1">
                            <label class="text-[9px] text-gray-400 uppercase ml-2">Qtd Vendida</label>
                            <input v-model.number="editModal.form.quantidade" type="number" class="input-soft">
                        </div>
                        <div class="space-y-1">
                             <label class="text-[9px] text-gray-400 uppercase ml-2">Canal</label>
                            <select v-model="editModal.form.canal" class="input-soft uppercase font-black text-[10px]">
                                <option value="ML">ML</option>
                                <option value="SHOPEE">SHOPEE</option>
                            </select>
                        </div>
                    </div>
                    <div class="space-y-1 font-bold">
                        <label class="text-[9px] text-gray-400 uppercase ml-2">ID Pedido / Rastreio</label>
                        <div class="grid grid-cols-2 gap-2">
                            <input v-model="editModal.form.mlOrderId" type="text" placeholder="ID" class="input-soft uppercase text-[10px]">
                            <input v-model="editModal.form.trackingCode" type="text" placeholder="Rastreio" class="input-soft uppercase text-[10px]">
                        </div>
                    </div>
                    <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-inner">
                        <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Lucro Líquido Calculado</p>
                        <p class="text-2xl font-black text-emerald-700 mt-1">R$ {{ ((editModal.form.precoVendaUnitario - editModal.custo_manual) * editModal.form.quantidade).toFixed(2) }}</p>
                    </div>
                </div>
                <div class="flex gap-4 mt-8">
                    <button @click="editModal.aberto = false" class="flex-1 py-4 font-bold text-gray-400 uppercase text-[10px] bg-gray-50 rounded-2xl">Voltar</button>
                    <button @click="confirmarEdicao" class="flex-1 py-4 font-bold text-white uppercase text-[10px] bg-blue-500 rounded-2xl">Atualizar</button>
                </div>
            </div>
        </div>

        <!-- Modal de exclusão -->
        <div v-if="confirmModal.aberto" class="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-fade-in text-center">
                <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h3 class="text-xl font-black text-slate-900 tracking-tighter">Remover Venda?</h3>
                <div class="flex gap-3 mt-8">
                    <button @click="confirmModal.aberto = false" class="flex-1 py-4 font-bold text-gray-400 uppercase text-[10px] bg-gray-50 rounded-2xl">Cancelar</button>
                    <button @click="confirmarExclusao" class="flex-1 py-4 font-bold text-white uppercase text-[10px] bg-red-500 rounded-2xl">Excluir</button>
                </div>
            </div>
        </div>

        <!-- Modal de Venda Rápida -->
        <div v-if="venderModal.aberto" class="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 text-left">
            <div class="bg-white rounded-[2.5rem] p-6 md:p-10 max-w-lg w-full shadow-2xl animate-fade-in space-y-5 overflow-y-auto max-h-[95vh]">
                <div class="text-center space-y-1">
                    <h2 class="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 leading-none italic uppercase">Venda Rápida</h2>
                    <div class="flex flex-wrap justify-center gap-2 mt-4">
                        <button v-for="c in canais" :key="c.id"
                            @click="mudarCanal(c)"
                            :style="venderForm.canalId === c.id ? { backgroundColor: c.corHex || c.cor_hex, color: 'white' } : {}"
                            :class="venderForm.canalId === c.id ? 'shadow-lg' : 'bg-slate-50 text-slate-400'"
                            class="px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 border border-transparent">
                            {{ c.nome }}
                        </button>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-4">Produto</label>
                        <div class="relative">
                            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                            <input
                                list="lista-vender-modal"
                                v-model="inputBusca"
                                @input="aoSelecionarPeloNome"
                                placeholder="Selecione o produto..."
                                class="input-soft !pl-10 !text-sm"
                            >
                            <datalist id="lista-vender-modal">
                                <option v-for="p in produtos" :key="p.id" :value="p.nome"></option>
                            </datalist>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3 items-end">
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-4 block">Quantidade</label>
                            <input v-model.number="venderForm.quantidade" type="number" min="1" class="input-soft !py-3 text-center font-bold">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-orange-600 uppercase ml-4 block italic">Entrada Líquida (Unit.)</label>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-300 italic">R$</span>
                                <input v-model.number="venderForm.precoRecebido" type="number" step="0.01" class="input-soft !pl-10 !py-3 font-bold border-orange-200">
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1 text-slate-400">
                            <label class="text-[10px] font-bold uppercase ml-4 tracking-widest">ID do Pedido</label>
                            <input v-model="venderForm.mlOrderId" type="text" placeholder="Opcional" class="input-soft !py-3">
                        </div>
                        <div class="space-y-1 text-slate-400">
                            <label class="text-[10px] font-bold uppercase ml-4 tracking-widest">Rastreio</label>
                            <input v-model="venderForm.trackingCode" type="text" placeholder="Opcional" class="input-soft !py-3 uppercase">
                        </div>
                    </div>

                    <div v-if="venderForm.produtoId" class="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-100 flex justify-between items-center animate-fade-in shadow-sm">
                        <div class="text-left">
                            <p class="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none">Lucro Líquido</p>
                            <p class="text-2xl font-black text-emerald-700 mt-1">R$ {{ calcularLucro() }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Custo Unit.</p>
                            <p class="text-xs font-bold text-slate-600 mt-1">R$ {{ getCustoProduto() }}</p>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button @click="fecharVenderModal" class="flex-1 py-4 font-bold text-gray-400 uppercase text-[10px] bg-gray-50 rounded-2xl">Cancelar</button>
                    <button @click="salvar" :disabled="!venderForm.produtoId || venderForm.quantidade < 1"
                            class="flex-1 btn-primary py-4 text-sm uppercase tracking-tighter disabled:opacity-50 active:scale-95 transition-transform">
                        Confirmar Venda
                    </button>
                </div>
            </div>
        </div>
    </div>`,
  props: ["vendas", "produtos", "canais", "userRole"],
  data() {
    return {
      busca: "",
      filtroCanal: "todos",
      paginaAtual: 1,
      itensPorPagina: window.innerWidth < 768 ? 7 : 10,
      confirmModal: { aberto: false, idParaExcluir: null },
      editModal: { aberto: false, form: {}, custo_manual: 0 },
      venderModal: { aberto: false },
      inputBusca: "",
      venderForm: {
        canalId: null,
        produtoId: "",
        quantidade: 1,
        precoRecebido: 0,
        mlOrderId: "",
        trackingCode: "",
      },
    };
  },
  watch: {
    canais: {
      immediate: true,
      handler(novosCanais) {
        if (!this.venderForm.canalId && novosCanais?.length) {
          this.venderForm.canalId = novosCanais[0].id;
        }
      },
    },
    vendasFiltradas() {
      this.paginaAtual = 1;
    },
  },
  computed: {
    isAdmin() {
      return this.userRole === "admin";
    },
    vendasFiltradas() {
      const t = this.busca.toLowerCase();
      const canal = this.filtroCanal;
      return this.vendas.filter((v) => {
        const matchBusca =
          (v.nomeProdutoSnapshot || "").toLowerCase().includes(t) ||
          (v.mlOrderId || "").toLowerCase().includes(t) ||
          (v.trackingCode || "").toLowerCase().includes(t);
        const matchCanal = canal === "todos" || this.canalLabel(v.canal) === canal;
        return matchBusca && matchCanal;
      });
    },
    totalPaginas() {
      return Math.ceil(this.vendasFiltradas.length / this.itensPorPagina) || 1;
    },
    paginados() {
      return this.vendasFiltradas.slice(
        (this.paginaAtual - 1) * this.itensPorPagina,
        this.paginaAtual * this.itensPorPagina,
      );
    },
  },
  methods: {
    canalLabel,
    abrirVenderModal() {
      if (this.canais?.length && !this.venderForm.canalId) {
        this.venderForm.canalId = this.canais[0].id;
      }
      this.venderModal.aberto = true;
    },
    fecharVenderModal() {
      this.venderModal.aberto = false;
      this.inputBusca = "";
      this.venderForm = {
        canalId: this.canais?.[0]?.id || null,
        produtoId: "",
        quantidade: 1,
        precoRecebido: 0,
        mlOrderId: "",
        trackingCode: "",
      };
    },
    mudarCanal(canal) {
      this.venderForm.canalId = canal.id;
      if (this.venderForm.produtoId) this.aoSelecionarPeloNome();
    },
    aoSelecionarPeloNome() {
      const p = this.produtos.find((i) => i.nome === this.inputBusca);
      if (p) {
        this.venderForm.produtoId = p.id;
        const canalObj = this.canais.find((c) => c.id === this.venderForm.canalId);
        this.venderForm.precoRecebido = precoSugeridoPorCanal(p, canalObj?.nome);
      } else {
        this.venderForm.produtoId = "";
      }
    },
    getCustoProduto() {
      const p = this.produtos.find((i) => i.id === this.venderForm.produtoId);
      return custoProduto(p);
    },
    calcularLucro() {
      const p = this.produtos.find((i) => i.id === this.venderForm.produtoId);
      return calcularLucroVenda(p, this.venderForm.precoRecebido, this.venderForm.quantidade);
    },
    async salvar() {
      const canalObj = this.canais.find(
        (c) => c.id === this.venderForm.canalId,
      );
      if (!canalObj) {
        alert("Selecione um canal válido antes de salvar.");
        return;
      }

      const { error } = await apiPost("/api/vendas", {
        produtoId: this.venderForm.produtoId,
        quantidade: this.venderForm.quantidade,
        precoVendaUnitario: this.venderForm.precoRecebido,
        canalId: this.venderForm.canalId,
        canalNome: this.canalLabel(canalObj.nome),
        mlOrderId: this.venderForm.mlOrderId || null,
        trackingCode: this.venderForm.trackingCode?.toUpperCase() || null,
      })
        .then(() => ({ error: null }))
        .catch((err) => ({ error: err }));

      if (!error) {
        this.$emit("notificar", {
          titulo: "Sucesso!",
          texto: `Venda ${this.canalLabel(canalObj.nome)} registrada com sucesso.`,
        });
        this.$emit("refresh", "vendas");
        this.fecharVenderModal();
      } else {
        console.error("Erro ao registrar venda:", error);
        alert(error?.message || "Erro ao salvar venda.");
      }
    },
    async copiarCodigo(c) {
      try {
        await navigator.clipboard.writeText(c);
        this.$emit("notificar", {
          titulo: "Copiado!",
          texto: "Rastreio pronto para colar.",
        });
      } catch (err) {
        console.error("Erro ao copiar rastreio:", err);
        this.$emit("notificar", {
          titulo: "Erro",
          texto: "Não foi possível copiar o rastreio.",
        });
      }
    },
    abrirEdicao(v) {
      if (!this.isAdmin) return;
      const produto = this.produtos.find((p) => p.id === v.produtoId);
      this.editModal.custo_manual = produto ? Number(produto.custo) : 0;
      this.editModal.form = { ...v };
      this.editModal.aberto = true;
    },
    async confirmarEdicao() {
      try {
        const f = this.editModal.form;
        await apiPut(`/api/vendas/${f.id}`, {
          quantidade: f.quantidade,
          precoVendaUnitario: f.precoVendaUnitario,
          canalId: f.canalId,
          canalNome: f.canal,
          mlOrderId: f.mlOrderId,
          trackingCode: f.trackingCode ? f.trackingCode.toUpperCase() : null,
        });
        this.$emit("refresh", "vendas");
        this.editModal.aberto = false;
      } catch (err) {
        console.error("Erro ao atualizar venda:", err);
        this.$emit("notificar", {
          titulo: "Erro",
          texto: err?.message || "Não foi possível atualizar a venda.",
        });
      }
    },
    solicitarExclusao(id) {
      if (!this.isAdmin) return;
      this.confirmModal.idParaExcluir = id;
      this.confirmModal.aberto = true;
    },
    async confirmarExclusao() {
      try {
        await apiDelete(`/api/vendas/${this.confirmModal.idParaExcluir}`);
        this.$emit("refresh", "vendas");
        this.confirmModal.aberto = false;
      } catch (err) {
        console.error("Erro ao excluir venda:", err);
        this.$emit("notificar", {
          titulo: "Erro",
          texto: err?.message || "Não foi possível excluir a venda.",
        });
      }
    },
  },
};

export default HistoricoView;
