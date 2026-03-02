const VenderView = {
  template: `
    <div class="flex flex-col items-center justify-center min-h-[85vh] md:min-h-[70vh] animate-fade-in px-4 text-left">
        <div class="w-full max-w-lg bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-6 md:p-10 space-y-6 md:space-y-8">
            <div class="text-center space-y-1">
                <h2 class="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 leading-none italic uppercase tracking-tight">Venda Rápida</h2>
                <p class="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Registro de Saída</p>
            </div>
            
            <div class="space-y-4 md:space-y-6">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-4">Produto</label>
                    <div class="relative">
                        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                        <input 
                            list="lista-vender" 
                            v-model="inputBusca" 
                            @input="aoSelecionarPeloNome"
                            placeholder="Selecione o produto..." 
                            class="input-soft !pl-10 !text-sm"
                        >
                        <datalist id="lista-vender">
                            <option v-for="p in produtos" :key="p.id" :value="p.nome"></option>
                        </datalist>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 md:gap-4 items-end">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-4 block h-4">Quantidade</label>
                        <input v-model.number="form.quantidade" type="number" min="1" class="input-soft !py-3 md:!py-4 text-center font-bold">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-orange-600 uppercase ml-4 block h-4 font-black italic">Entrada Líquida ML</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-300 italic">R$</span>
                            <input v-model.number="form.precoRecebido" type="number" step="0.01" class="input-soft !pl-10 !py-3 md:!py-4 font-bold border-orange-200">
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div class="space-y-1 text-slate-400">
                        <label class="text-[10px] font-bold uppercase ml-4 tracking-widest">ID do Pedido</label>
                        <input v-model="form.mlOrderId" type="text" placeholder="Opcional" class="input-soft !py-3 md:!py-4">
                    </div>
                    <div class="space-y-1 text-slate-400">
                        <label class="text-[10px] font-bold uppercase ml-4 tracking-widest">Rastreio</label>
                        <input v-model="form.trackingCode" type="text" placeholder="Opcional" class="input-soft !py-3 md:!py-4 uppercase">
                    </div>
                </div>

                <div v-if="form.produtoId" class="bg-emerald-50/80 rounded-2xl p-5 border border-emerald-100 flex justify-between items-center animate-fade-in shadow-sm">
                    <div>
                        <p class="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none">Lucro Real (Entrada - Custo)</p>
                        <p class="text-2xl font-black text-emerald-700 mt-1">R$ {{ calcularLucroSimples() }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Custo Unitário</p>
                        <p class="text-xs font-bold text-slate-600 mt-1">R$ {{ getCustoProduto() }}</p>
                    </div>
                </div>

                <div class="text-center py-4 md:py-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                    <label class="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10 font-black">Total a Cair na Conta</label>
                    <div class="flex items-center justify-center gap-2 font-bold text-slate-900 relative z-10">
                        <span class="text-xl md:text-2xl italic text-slate-300">R$</span>
                        <span class="text-4xl md:text-5xl tracking-tighter">{{ (form.precoRecebido * form.quantidade).toFixed(2) }}</span>
                    </div>
                    <i class="fa-solid fa-money-bill-trend-up absolute -right-4 -bottom-4 text-slate-200/40 text-6xl md:text-7xl rotate-12"></i>
                </div>

                <button @click="salvar" :disabled="!form.produtoId || form.quantidade < 1" 
                        class="btn-primary w-full py-4 md:py-5 text-lg md:text-xl uppercase tracking-tighter disabled:opacity-50 shadow-xl active:scale-95 transition-transform">
                    Confirmar Venda
                </button>
            </div>
        </div>
    </div>`,
  props: ["produtos"],
  data() {
    return {
      inputBusca: "",
      form: {
        produtoId: "",
        quantidade: 1,
        precoRecebido: 0,
        mlOrderId: "",
        trackingCode: "",
      },
    };
  },
  methods: {
    aoSelecionarPeloNome() {
      const p = this.produtos.find((i) => i.nome === this.inputBusca);
      if (p) {
        this.form.produtoId = p.id;
        // Sugere o valor sugerido apenas como ponto de partida, mas deixa você editar livremente
        this.form.precoRecebido = p.preco_suger_ml || 0;
      } else {
        this.form.produtoId = "";
      }
    },
    getCustoProduto() {
      const p = this.produtos.find((i) => i.id === this.form.produtoId);
      return p ? Number(p.custo).toFixed(2) : "0.00";
    },
    calcularLucroSimples() {
      const p = this.produtos.find((i) => i.id === this.form.produtoId);
      if (!p) return "0.00";

      // LÓGICA SOLICITADA: Valor que o ML deu (Entrada Líquida) menos o Custo.
      const entradaML = Number(this.form.precoRecebido);
      const custoUnitario = Number(p.custo);
      const lucroUnitario = entradaML - custoUnitario;

      return (lucroUnitario * this.form.quantidade).toFixed(2);
    },
    async salvar() {
      const p = this.produtos.find((i) => i.id === this.form.produtoId);
      const lucroTotal = Number(this.calcularLucroSimples());
      const faturamentoTotal = Number(
        this.form.precoRecebido * this.form.quantidade,
      );

      const { error } = await window.supabase.from("vendas").insert([
        {
          produto_id: this.form.produtoId,
          nome_produto_snapshot: p.nome,
          quantidade: this.form.quantidade,
          preco_venda_unitario: this.form.precoRecebido, // Aqui salva o valor líquido que você digitou
          faturamento_total: faturamentoTotal,
          lucro_liquido: lucroTotal, // Salva a diferença exata
          ml_order_id: this.form.mlOrderId || null,
          tracking_code: this.form.trackingCode
            ? this.form.trackingCode.toUpperCase()
            : null,
        },
      ]);

      if (!error) {
        this.$emit("notificar", {
          titulo: "Sucesso!",
          texto: "Venda registrada com sucesso.",
        });
        this.inputBusca = "";
        this.form = {
          produtoId: "",
          quantidade: 1,
          precoRecebido: 0,
          mlOrderId: "",
          trackingCode: "",
        };
        this.$emit("refresh");
      } else {
        alert("Erro ao salvar venda.");
      }
    },
  },
};

export default VenderView;
