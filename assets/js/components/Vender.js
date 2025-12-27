const VenderView = {
    template: `
    <div class="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
        <div class="w-full max-w-lg card shadow-2xl space-y-8">
            <h2 class="text-3xl font-bold text-center tracking-tighter text-slate-900">Venda Rápida</h2>
            <div class="space-y-6">
                <select v-model="form.produtoId" class="input-soft !text-left" @change="preencherPreco">
                    <option value="" disabled>Selecione o Perfume...</option>
                    <option v-for="p in produtos" :key="p.id" :value="p.id">{{ p.nome }}</option>
                </select>
                <div class="grid grid-cols-2 gap-4">
                    <input v-model="form.mlOrderId" type="text" placeholder="Pedido ML" class="input-soft bg-orange-50/10">
                    <input v-model="form.trackingCode" type="text" placeholder="Correios" class="input-soft bg-blue-50/10 uppercase">
                </div>
                <div class="text-center py-4">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Preço de Venda Final</label>
                    <div class="flex items-center justify-center gap-2 font-bold text-slate-900">
                        <span class="text-4xl italic">R$</span>
                        <input v-model.number="form.precoVenda" type="number" class="text-6xl bg-transparent w-64 text-center outline-none tracking-tighter">
                    </div>
                </div>
                <button @click="salvar" class="btn-primary w-full py-5 text-xl uppercase tracking-tighter">Confirmar Venda</button>
            </div>
        </div>
    </div>`,
    props: ['produtos'],
    data() { return { form: { produtoId: '', mlOrderId: '', trackingCode: '', precoVenda: 0 } } },
    methods: {
        preencherPreco() {
            const p = this.produtos.find(i => i.id === this.form.produtoId);
            if(p) this.form.precoVenda = p.preco_suger_ml;
        },
        async salvar() {
            const p = this.produtos.find(i => i.id === this.form.produtoId);
            const lucro = this.form.precoVenda - p.custo - 60;
            const { error } = await window.supabase.from('vendas').insert([{
                produto_id: this.form.produtoId,
                nome_produto_snapshot: p.nome,
                quantidade: 1,
                preco_venda_unitario: this.form.precoVenda,
                faturamento_total: this.form.precoVenda,
                lucro_liquido: lucro,
                ml_order_id: this.form.mlOrderId,
                tracking_code: this.form.trackingCode.toUpperCase()
            }]);
            if(!error) {
                this.$emit('notificar', {titulo: 'Venda Concluída!', texto: 'Lucro registrado: R$ ' + lucro.toFixed(2)});
                this.form = { produtoId: '', mlOrderId: '', trackingCode: '', precoVenda: 0 };
                this.$emit('refresh');
            }
        }
    }
};
export default VenderView;