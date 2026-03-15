const HistoricoView = {
  template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-6xl h-[92vh] md:h-auto space-y-3 md:space-y-8 pt-2">
        
        <div class="flex justify-between items-center px-4 shrink-0">
            <h2 class="text-xl md:text-3xl font-bold tracking-tighter text-slate-900 leading-none italic uppercase">Histórico de Vendas</h2>
            <div class="md:hidden text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right">{{ vendasFiltradas.length }} registros</div>
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
                            <th class="py-5 px-6 hidden md:table-cell md:w-[18%] italic text-center text-slate-400">Canal / Pedido</th>
                            <th class="py-5 px-6 hidden md:table-cell md:w-[12%] text-right text-emerald-600 italic">Lucro</th>
                            <th class="py-5 px-6 text-center w-[15%] md:w-[15%] italic">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="v in paginados" :key="v.id" class="hover:bg-slate-50 transition-colors h-[12%] md:h-auto">
                            <td class="py-2 md:py-5 px-4 md:px-6 text-[10px] md:text-xs text-gray-400 font-bold">
                                {{ new Date(v.created_at).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) }}
                            </td>
                            <td class="py-2 md:py-5 px-4 md:px-6">
                                <div class="flex flex-col text-left">
                                    <span class="text-slate-700 font-black truncate text-[11px] md:text-sm uppercase tracking-tighter">{{ v.nome_produto_snapshot }}</span>
                                    <div class="md:hidden flex flex-wrap items-center gap-1 mt-1 font-bold text-[8px]">
                                        <span :class="v.ml_order_id && v.ml_order_id.includes('SHOPEE') ? 'text-orange-600' : 'text-orange-400'" class="uppercase italic">
                                            {{ v.ml_order_id && v.ml_order_id.includes('SHOPEE') ? '[SHOPEE]' : '[ML]' }}
                                        </span>
                                        <span v-if="v.tracking_code" class="text-blue-500 uppercase">| {{ v.tracking_code }}</span>
                                        <span class="text-emerald-600 font-black">| R$ {{ (v.lucro_liquido || 0).toFixed(2) }}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="py-5 px-6 hidden md:table-cell">
                                <div class="flex flex-col gap-1 text-center items-center">
                                    <span :class="v.ml_order_id && v.ml_order_id.includes('SHOPEE') ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700 border-orange-100'" 
                                          class="px-2 py-0.5 rounded text-[9px] font-black w-fit uppercase border italic">
                                        {{ v.ml_order_id || 'VENDA' }}
                                    </span>
                                    <button v-if="v.tracking_code" @click="copiarCodigo(v.tracking_code)" class="text-[10px] text-blue-500 font-bold flex items-center gap-1 hover:text-blue-700">
                                        <i class="fa-solid fa-truck-fast"></i> {{ v.tracking_code }}
                                    </button>
                                </div>
                            </td>
                            <td class="py-5 px-6 hidden md:table-cell text-right text-emerald-600 font-black italic text-sm">
                                R$ {{ (v.lucro_liquido || 0).toFixed(2) }}
                            </td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-center">
                                <div class="flex items-center justify-center gap-3">
                                    <button @click="abrirEdicao(v)" class="text-blue-400 hover:text-blue-600 transition-transform active:scale-90"><i class="fa-solid fa-pen-to-square"></i></button>
                                    <button @click="solicitarExclusao(v.id)" :class="userRole === 'admin' ? 'text-red-200 hover:text-red-500' : 'text-gray-50 cursor-not-allowed'"><i class="fa-solid fa-trash-can"></i></button>
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

        <div v-if="editModal.aberto" class="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl animate-fade-in text-left">
                <div class="text-center mb-6">
                    <h3 class="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Ajustar Venda</h3>
                    <p class="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{{ editModal.form.nome_produto_snapshot }}</p>
                </div>

                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4 font-bold">
                        <div class="space-y-1 text-left">
                            <label class="text-[9px] text-blue-500 uppercase ml-2 italic">Custo Un. (R$)</label>
                            <input v-model.number="editModal.custo_manual" type="number" step="0.01" class="input-soft border-blue-100">
                        </div>
                        <div class="space-y-1 text-left">
                            <label class="text-[9px] text-orange-500 uppercase ml-2 italic">Entrada Un. (R$)</label>
                            <input v-model.number="editModal.form.preco_venda_unitario" type="number" step="0.01" class="input-soft border-orange-100">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 font-bold">
                        <div class="space-y-1 text-left">
                            <label class="text-[9px] text-gray-400 uppercase ml-2">Qtd Vendida</label>
                            <input v-model.number="editModal.form.quantidade" type="number" class="input-soft">
                        </div>
                        <div class="space-y-1 text-left">
                             <label class="text-[9px] text-gray-400 uppercase ml-2">ID/Canal Pedido</label>
                            <input v-model="editModal.form.ml_order_id" type="text" class="input-soft">
                        </div>
                    </div>
                    <div class="space-y-1 font-bold text-left">
                        <label class="text-[9px] text-gray-400 uppercase ml-2">Código de Rastreio</label>
                        <input v-model="editModal.form.tracking_code" type="text" class="input-soft uppercase">
                    </div>
                    <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-inner">
                        <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Lucro Líquido Calculado</p>
                        <p class="text-2xl font-black text-emerald-700 mt-1">R$ {{ ((editModal.form.preco_venda_unitario - editModal.custo_manual) * editModal.form.quantidade).toFixed(2) }}</p>
                    </div>
                </div>
                <div class="flex gap-4 mt-8">
                    <button @click="editModal.aberto = false" class="flex-1 py-4 font-bold text-gray-400 uppercase text-[10px] bg-gray-50 rounded-2xl">Voltar</button>
                    <button @click="confirmarEdicao" class="flex-1 py-4 font-bold text-white uppercase text-[10px] bg-blue-500 rounded-2xl">Atualizar</button>
                </div>
            </div>
        </div>

        <div v-if="confirmModal.aberto" class="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-fade-in text-center">
                <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h3 class="text-xl font-black text-slate-900 tracking-tighter">Remover Venda?</h3>
                <div class="flex gap-3 mt-8">
                    <button @click="confirmModal.aberto = false" class="flex-1 py-4 font-bold text-gray-400 uppercase text-[10px] bg-gray-50 rounded-2xl">Cancelar</button>
                    <button @click="confirmarExclusao" class="flex-1 py-4 font-bold text-white uppercase text-[10px] bg-red-500 rounded-2xl shadow-lg shadow-red-200">Excluir</button>
                </div>
            </div>
        </div>
    </div>`,
  props: ["vendas", "produtos", "userRole"],
  data() {
    return {
      busca: "",
      filtroCanal: "todos", // NOVO ESTADO DO FILTRO
      paginaAtual: 1,
      itensPorPagina: window.innerWidth < 768 ? 7 : 10,
      confirmModal: { aberto: false, idParaExcluir: null },
      editModal: { aberto: false, form: {}, custo_manual: 0 },
    };
  },
  computed: {
    vendasFiltradas() {
      const t = this.busca.toLowerCase();
      const canal = this.filtroCanal;

      return this.vendas.filter((v) => {
        // Lógica de busca por texto
        const matchBusca =
          (v.nome_produto_snapshot || "").toLowerCase().includes(t) ||
          (v.ml_order_id || "").toLowerCase().includes(t) ||
          (v.tracking_code || "").toLowerCase().includes(t);

        // Lógica de filtro por canal
        let matchCanal = true;
        const canalVenda = (v.ml_order_id || "").toUpperCase();

        if (canal === "ML") {
          // Considera ML se não for Shopee e não tiver um ID complexo que contenha SHOPEE
          matchCanal = !canalVenda.includes("SHOPEE");
        } else if (canal === "SHOPEE") {
          matchCanal = canalVenda.includes("SHOPEE");
        }

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
    copiarCodigo(c) {
      navigator.clipboard.writeText(c);
      this.$emit("notificar", {
        titulo: "Copiado!",
        texto: "Rastreio pronto para colar.",
      });
    },
    abrirEdicao(v) {
      const produto = this.produtos.find((p) => p.id === v.produto_id);
      this.editModal.custo_manual = produto ? Number(produto.custo) : 0;
      this.editModal.form = { ...v };
      this.editModal.aberto = true;
    },
    async confirmarEdicao() {
      try {
        const f = this.editModal.form;
        const novoLucro =
          (f.preco_venda_unitario - this.editModal.custo_manual) * f.quantidade;
        const { error } = await window.supabase
          .from("vendas")
          .update({
            quantidade: f.quantidade,
            preco_venda_unitario: f.preco_venda_unitario,
            faturamento_total: f.preco_venda_unitario * f.quantidade,
            lucro_liquido: novoLucro,
            ml_order_id: f.ml_order_id,
            tracking_code: f.tracking_code
              ? f.tracking_code.toUpperCase()
              : null,
          })
          .eq("id", f.id);

        if (!error) {
          this.$emit("refresh");
          this.$emit("notificar", {
            titulo: "Sucesso!",
            texto: "Venda atualizada.",
          });
          this.editModal.aberto = false;
        }
      } catch (err) {
        console.error(err);
      }
    },
    solicitarExclusao(id) {
      if (this.userRole !== "admin") return;
      this.confirmModal.idParaExcluir = id;
      this.confirmModal.aberto = true;
    },
    async confirmarExclusao() {
      try {
        await window.supabase
          .from("vendas")
          .delete()
          .eq("id", this.confirmModal.idParaExcluir);
        this.$emit("refresh");
      } catch (err) {
        console.error(err);
      } finally {
        this.confirmModal.aberto = false;
      }
    },
  },
};

export default HistoricoView;
