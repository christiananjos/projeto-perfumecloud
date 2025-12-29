const VenderView = {
    template: `
    <div class="flex flex-col items-center justify-center min-h-[85vh] md:min-h-[70vh] animate-fade-in px-4">
        
        <div class="w-full max-w-lg bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-6 md:p-10 space-y-6 md:space-y-8">
            
            <div class="text-center space-y-1">
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
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-4">Quantidade</label>
                        <input v-model.number="form.quantidade" type="number" min="1" class="input-soft !py-3 md:!py-4 text-center font-bold" @input="calcularTotal">
                    </div>
                    
                    <div class="space-y-1 text-left">
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-4">Preço Unitário</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 italic">R$</span>
                            <input v-model.number="form.precoUnitario" type="number" step="0.01" class="input-soft !pl-10 !py-3 md:!py-4 font-bold" @input="calcularTotal">
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

                <div class="text-center py-4 md:py-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                    <label class="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10 font-black">Faturamento Total</label>
                    <div class="flex items-center justify-center gap-2 font-bold text-slate-900 relative z-10">
                        <span class="text-xl md:text-2xl italic text-slate-300">R$</span>
                        <span class="text-4xl md:text-5xl tracking-tighter">{{ totalVendaFormatado }}</span>
                    </div>
                    <p v-if="form.quantidade > 1" class="text-[10px] text-slate-400 mt-1 font-bold relative z-10">
                        ({{ form.quantidade }}x de R$ {{ form.precoUnitario.toFixed(2) }})
                    </p>
                    <i class="fa-solid fa-coins absolute -right-4 -bottom-4 text-slate-200/40 text-6xl md:text-7xl rotate-12"></i>
                </div>

                <button @click="salvar" :disabled="!form.produtoId || form.quantidade < 1" 
                        class="btn-primary w-full py-4 md:py-5 text-lg md:text-xl uppercase tracking-tighter disabled:opacity-50 shadow-xl active:scale-95 transition-transform">
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
            }
        },
        async salvar() {
            const p = this.produtos.find(i => i.id === this.form.produtoId);
            const taxaSalva = localStorage.getItem('taxaMLFixa');
            const valorTaxaFixa = taxaSalva ? parseFloat(taxaSalva) : 60.00;

            const lucroTotal = (this.form.precoUnitario - p.custo - valorTaxaFixa) * this.form.quantidade;

            const { error } = await window.supabase.from('vendas').insert([{
                produto_id: this.form.produtoId,
                nome_produto_snapshot: p.nome,
                quantidade: this.form.quantidade,
                faturamento_total: this.form.precoUnitario * this.form.quantidade,
                lucro_liquido: lucroTotal,
                ml_order_id: this.form.mlOrderId,
                tracking_code: this.form.trackingCode ? this.form.trackingCode.toUpperCase() : null
            }]);

            if(!error) {
                this.$emit('notificar', { 
                    titulo: 'Venda Registrada!', 
                    texto: 'Lucro de R$ ' + lucroTotal.toFixed(2) + ' adicionado.' 
                });
                
                this.form = { produtoId: '', quantidade: 1, precoUnitario: 0, mlOrderId: '', trackingCode: '' };
                this.$emit('refresh');
            } else {
                alert("Erro ao salvar: " + error.message);
            }
        }
    }
};

export default VenderView;