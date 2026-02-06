const VenderView = {
  template: `
    <div class="flex flex-col items-center justify-center min-h-[85vh] md:min-h-[70vh] animate-fade-in px-4">
        <div class="w-full max-w-lg bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-6 md:p-10 space-y-6 md:space-y-8">
            <div class="text-center space-y-1 text-left">
                <h2 class="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 leading-none">Venda Rápida</h2>
                <p class="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Registro de Saída</p>
            </div>
            
            <div class="space-y-4 md:space-y-6">
                <div class="space-y-1 text-left">
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-4">Selecione o Perfume</label>
                    <select v-model="form.produtoId" class="input-soft !text-sm" @change="preencherDados">
                        <option value="" disabled>Escolha um item do estoque...</option>
                        <option v-for="p in produtos" :key="p.id" :value="p.id">{{ p.nome }}</option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-3 md:gap-4 items-end">
                    <div class="space-y-1 text-left">
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-4 block h-4">Quantidade</label>
                        <input v-model.number="form.quantidade" type="number" min="1" class="input-soft !py-3 md:!py-4 text-center font-bold">
                    </div>
                    <div class="space-y-1 text-left">
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-4 block h-4">Recebido (ML)</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 italic">R$</span>
                            <input v-model.number="form.precoRecebido" type="number" step="0.01" class="input-soft !pl-10 !py-3 md:!py-4 font-bold border-orange-100" placeholder="Valor líquido">
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-left">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-orange-400 uppercase ml-4">Pedido ML</label>
                        <div class="relative">
                            <i class="fa-solid fa-handshake absolute left-4 top-1/2 -translate-y-1/2 text-orange-300"></i>
                            <input v-model="form.mlOrderId" type="text" placeholder="ID do Pedido" class="input-soft !pl-11 !py-3 md:!py-4 bg-orange-50/10">
                        </div>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-blue-400 uppercase ml-4">Correios</label>
                        <div class="relative">
                            <i class="fa-solid fa-truck-fast absolute left-4 top-1/2 -translate-y-1/2 text-blue-300"></i>
                            <input v-model="form.trackingCode" type="text" placeholder="RASTREIO" class="input-soft !pl-11 !py-3 md:!py-4 bg-blue-50/10 uppercase">
                        </div>
                    </div>
                </div>

                <div v-if="form.produtoId" class="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex justify-between items-center animate-fade-in">
                    <div class="text-left">
                        <p class="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Lucro Real (Líquido)</p>
                        <p class="text-lg font-black text-emerald-700 leading-none">R$ {{ calcularLucroSimples() }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Custo Unitário</p>
                        <p class="text-xs font-bold text-slate-600">R$ {{ getCustoProduto() }}</p>
                    </div>
                </div>

                <div class="text-center py-4 md:py-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                    <label class="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10 font-black">Total Recebido</label>
                    <div class="flex items-center justify-center gap-2 font-bold text-slate-900 relative z-10">
                        <span class="text-xl md:text-2xl italic text-slate-300">R$</span>
                        <span class="text-4xl md:text-5xl tracking-tighter">{{ (form.precoRecebido * form.quantidade).toFixed(2) }}</span>
                    </div>
                    <i class="fa-solid fa-coins absolute -right-4 -bottom-4 text-slate-200/40 text-6xl md:text-7xl rotate-12"></i>
                </div>

                <button @click="salvar" :disabled="!form.produtoId || form.quantidade < 1" 
                        class="btn-primary w-full py-4 md:py-5 text-lg md:text-xl uppercase tracking-tighter disabled:opacity-50 shadow-xl active:scale-95 transition-transform">
                    Confirmar Venda
                </button>
            </div>
        </div>
    </div>`,
  props: ["produtos", "taxas"],
  data() {
    return {
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
    preencherDados() {
      const p = this.produtos.find((i) => i.id === this.form.produtoId);
      // Aqui podemos deixar zerado para você preencher manualmente o que o ML te passar, 
      // ou sugerir o preço_suger_ml se quiser ter uma base.
      if (p) this.form.precoRecebido = 0;
    },
    getCustoProduto() {
      const p = this.produtos.find((i) => i.id === this.form.produtoId);
      return p ? Number(p.custo).toFixed(2) : "0.00";
    },
    calcularLucroSimples() {
      const p = this.produtos.find((i) => i.id === this.form.produtoId);
      if (!p) return "0.00";

      const custoTotal = Number(p.custo) * this.form.quantidade;
      const recebidoTotal = this.form.precoRecebido * this.form.quantidade;

      const lucro = recebidoTotal - custoTotal;
      return lucro.toFixed(2);
    },
    async salvar() {
      const p = this.produtos.find((i) => i.id === this.form.produtoId);
      const totalRecebido = Number(this.form.precoRecebido * this.form.quantidade);
      const lucroTotal = Number(this.calcularLucroSimples());

      const dadosParaSalvar = {
        produto_id: this.form.produtoId,
        nome_produto_snapshot: p.nome,
        quantidade: this.form.quantidade,
        preco_venda_unitario: this.form.precoRecebido, // Salvamos o valor líquido recebido
        faturamento_total: totalRecebido,
        lucro_liquido: lucroTotal,
        ml_order_id: this.form.mlOrderId || null,
        tracking_code: this.form.trackingCode ? this.form.trackingCode.toUpperCase() : null,
      };

      const { error } = await window.supabase
        .from("vendas")
        .insert([dadosParaSalvar]);

      if (!error) {
        this.$emit("notificar", {
          titulo: "Sucesso!",
          texto: "Venda registrada com lucro de R$ " + lucroTotal.toFixed(2),
        });
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