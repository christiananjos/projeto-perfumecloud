const VenderView = {
    template: `
    <div class="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
        <div class="w-full max-w-lg card shadow-2xl space-y-8">
            <h2 class="text-3xl font-bold text-center tracking-tighter text-slate-900">Venda Rápida</h2>
            
            <div class="space-y-6">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-4">Selecione o Perfume</label>
                    <select v-model="form.produtoId" class="input-soft !text-left" @change="preencherDados">
                        <option value="" disabled>Escolha um item do estoque...</option>
                        <option v-for="p in produtos" :key="p.id" :value="p.id">{{ p.nome }}</option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-4">Quantidade</label>
                        <input v-model.number="form.quantidade" type="number" min="1" class="input-soft" @input="calcularTotal">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-4">Preço Unitário (R$)</label>
                        <input v-model.number="form.precoUnitario" type="number" step="0.01" class="input-soft" @input="calcularTotal">
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-orange-400 uppercase ml-4">Pedido ML</label>
                        <input v-model="form.mlOrderId" type="text" placeholder="ID do Pedido" class="input-soft bg-orange-50/10">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-blue-400 uppercase ml-4">Correios</label>
                        <input v-model="form.trackingCode" type="text" placeholder="Rastreio" class="input-soft bg-blue-50/10 uppercase">
                    </div>
                </div>

                <div class="text-center py-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faturamento Total</label>
                    <div class="flex items-center justify-center gap-2 font-bold text-slate-900">
                        <span class="text-2xl italic text-slate-300">R$</span>
                        <span class="text-5xl tracking-tighter">{{ totalVendaFormatado }}</span>
                    </div>
                    <p v-if="form.quantidade > 1" class="text-[10px] text-slate-400 mt-1">
                        ({{ form.quantidade }}x de R$ {{ form.precoUnitario.toFixed(2) }})
                    </p>
                </div>

                <button @click="salvar" :disabled="!form.produtoId || form.quantidade < 1" class="btn-primary w-full py-5 text-xl uppercase tracking-tighter disabled:opacity-50">
                    Confirmar Venda
                </button>
            </div>
        </div>
    </div>`,
    props: ['produtos'],
    data() {
        return {
            form: {
                produtoId: '',
                quantidade: 1,
                precoUnitario: 0,
                precoVendaTotal: 0,
                mlOrderId: '',
                trackingCode: ''
            }
        }
    },
    computed: {
        totalVendaFormatado() {
            return (this.form.precoUnitario * this.form.quantidade).toFixed(2);
        }
    },
    methods: {
        preencherDados() {
            const p = this.produtos.find(i => i.id === this.form.produtoId);
            if(p) {
                this.form.precoUnitario = p.preco_suger_ml;
                this.calcularTotal();
            }
        },
        calcularTotal() {
            this.form.precoVendaTotal = this.form.precoUnitario * this.form.quantidade;
        },
        async salvar() {
            const p = this.produtos.find(i => i.id === this.form.produtoId);
            
            // Cálculo do Lucro: (Preço Unitário - Custo - Taxa Fixa 60) * Quantidade
            const lucroTotal = (this.form.precoUnitario - p.custo - 60) * this.form.quantidade;

            const { error } = await window.supabase.from('vendas').insert([{
                produto_id: this.form.produtoId,
                nome_produto_snapshot: p.nome,
                quantidade: this.form.quantidade,
                preco_venda_unitario: this.form.precoUnitario,
                faturamento_total: this.form.precoUnitario * this.form.quantidade,
                lucro_liquido: lucroTotal,
                ml_order_id: this.form.mlOrderId,
                tracking_code: this.form.trackingCode ? this.form.trackingCode.toUpperCase() : null
            }]);

            if(!error) {
                this.$emit('notificar', { 
                    titulo: 'Venda Registrada!', 
                    texto: `Total: R$ ${this.totalVendaFormatado} | Lucro: R$ ${lucroTotal.toFixed(2)}` 
                });
                
                // Reseta o formulário
                this.form = { produtoId: '', quantidade: 1, precoUnitario: 0, precoVendaTotal: 0, mlOrderId: '', trackingCode: '' };
                this.$emit('refresh');
            } else {
                alert("Erro ao salvar: " + error.message);
            }
        }
    }
};

export default VenderView;